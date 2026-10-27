"""Train a custom Keras CNN or MobileNetV2 classifier on split PlantVillage leaf imagery."""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path


def build_custom_cnn(num_classes: int, image_size: int = 224):
    import tensorflow as tf
    from tensorflow.keras import layers, models, regularizers

    l2_reg = regularizers.l2(1e-4)

    inputs = layers.Input(shape=(image_size, image_size, 3), name="rgb_leaf_input")
    x = inputs

    for filters in (32, 64, 128, 256):
        x = layers.Conv2D(
            filters,
            kernel_size=3,
            padding="same",
            kernel_regularizer=l2_reg,
            use_bias=False,
        )(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation("relu")(x)
        x = layers.Conv2D(
            filters,
            kernel_size=3,
            padding="same",
            kernel_regularizer=l2_reg,
            use_bias=False,
        )(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation("relu")(x)
        x = layers.MaxPooling2D(pool_size=2)(x)
        x = layers.Dropout(0.20)(x)

    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(256, activation="relu", kernel_regularizer=l2_reg)(x)
    x = layers.Dropout(0.40)(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="class_probabilities")(x)

    return models.Model(inputs=inputs, outputs=outputs, name="PlantVillageCustomCNN")


def build_mobilenetv2_transfer(num_classes: int, image_size: int = 224):
    import tensorflow as tf
    from tensorflow.keras import layers, models

    inputs = layers.Input(shape=(image_size, image_size, 3), name="rgb_leaf_input")
    # Input arrives rescaled in [0, 1]; convert to [-1, 1] expected by MobileNetV2
    scaled = layers.Rescaling(scale=2.0, offset=-1.0)(inputs)

    backbone = tf.keras.applications.MobileNetV2(
        input_shape=(image_size, image_size, 3),
        include_top=False,
        weights="imagenet",
    )
    backbone.trainable = False

    x = backbone(scaled, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.35)(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="class_probabilities")(x)

    return models.Model(inputs=inputs, outputs=outputs, name="PlantVillageMobileNetV2")


def save_training_curves(history_dict: dict, out_path: Path) -> None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    epochs = range(1, len(history_dict.get("accuracy", [])) + 1)
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.5))

    axes[0].plot(epochs, history_dict.get("accuracy", []), label="Train Accuracy", color="#1E5631")
    axes[0].plot(
        epochs, history_dict.get("val_accuracy", []), label="Val Accuracy", color="#D97706"
    )
    axes[0].set_title("CNN Classification Accuracy")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Accuracy")
    axes[0].legend()
    axes[0].grid(alpha=0.25)

    axes[1].plot(epochs, history_dict.get("loss", []), label="Train Loss", color="#1E5631")
    axes[1].plot(epochs, history_dict.get("val_loss", []), label="Val Loss", color="#DC2626")
    axes[1].set_title("Cross-Entropy Loss")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Loss")
    axes[1].legend()
    axes[1].grid(alpha=0.25)

    fig.tight_layout()
    fig.savefig(out_path, dpi=160)
    plt.close(fig)


def main() -> None:
    parser = argparse.ArgumentParser(description="Train PlantVillage leaf disease CNN.")
    parser.add_argument(
        "--data-dir",
        default="data/plantvillage_split",
        help="Directory containing train/ and val/ folders",
    )
    parser.add_argument(
        "--arch",
        choices=["cnn", "mobilenetv2"],
        default="cnn",
        help="Model architecture: custom 4-block CNN or MobileNetV2 transfer learning",
    )
    parser.add_argument("--epochs", type=int, default=25)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--image-size", type=int, default=224)
    parser.add_argument("--learning-rate", type=float, default=1e-3)
    parser.add_argument("--output-model", default="models/plantvillage_cnn.keras")
    parser.add_argument("--labels-out", default="class_labels.json")
    args = parser.parse_args()

    import tensorflow as tf

    tf.keras.utils.set_random_seed(42)

    data_root = Path(args.data_dir)
    train_dir = data_root / "train"
    val_dir = data_root / "val"
    if not train_dir.exists() or not val_dir.exists():
        raise FileNotFoundError(
            f"Expected train/ and val/ splits inside {data_root}. Run prepare_dataset.py first."
        )

    raw_train_ds = tf.keras.utils.image_dataset_from_directory(
        train_dir,
        image_size=(args.image_size, args.image_size),
        batch_size=args.batch_size,
        label_mode="categorical",
        shuffle=True,
        seed=42,
    )
    class_names = list(raw_train_ds.class_names)

    raw_val_ds = tf.keras.utils.image_dataset_from_directory(
        val_dir,
        image_size=(args.image_size, args.image_size),
        batch_size=args.batch_size,
        label_mode="categorical",
        class_names=class_names,
        shuffle=False,
    )

    # Synchronize class_labels.json with exact Keras directory alphabetical order
    labels_path = Path(args.labels_out)
    with labels_path.open("w", encoding="utf-8") as fp:
        json.dump(class_names, fp, indent=2)

    augmentation = tf.keras.Sequential(
        [
            tf.keras.layers.RandomFlip("horizontal_and_vertical"),
            tf.keras.layers.RandomRotation(0.12),
            tf.keras.layers.RandomZoom(0.10),
            tf.keras.layers.RandomContrast(0.10),
        ],
        name="train_only_augmentation",
    )
    rescale = tf.keras.layers.Rescaling(1.0 / 255.0)
    autotune = tf.data.AUTOTUNE

    # Augmentation is applied strictly to training batches (never validation or test)
    train_ds = (
        raw_train_ds.map(
            lambda x, y: (rescale(augmentation(x, training=True)), y),
            num_parallel_calls=autotune,
        )
        .prefetch(autotune)
    )
    val_ds = raw_val_ds.map(
        lambda x, y: (rescale(x), y), num_parallel_calls=autotune
    ).prefetch(autotune)

    if args.arch == "mobilenetv2":
        model = build_mobilenetv2_transfer(len(class_names), args.image_size)
    else:
        model = build_custom_cnn(len(class_names), args.image_size)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=args.learning_rate),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    output_model_path = Path(args.output_model)
    output_model_path.parent.mkdir(parents=True, exist_ok=True)

    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=str(output_model_path),
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1,
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True,
            verbose=1,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            min_lr=1e-6,
            verbose=1,
        ),
    ]

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs,
        callbacks=callbacks,
    )

    curves_path = output_model_path.parent / "training_curves.png"
    save_training_curves(history.history, curves_path)

    best_val_acc = float(max(history.history.get("val_accuracy", [0.0])))
    model_version = f"plantvillage-{args.arch}-v1.0.0"

    metadata = {
        "model_version": model_version,
        "architecture": args.arch,
        "image_size": args.image_size,
        "rescale_input": True,
        "num_classes": len(class_names),
        "best_val_accuracy": round(best_val_acc, 4),
        "trained_at_utc": datetime.now(timezone.utc).isoformat(),
    }
    metadata_path = output_model_path.parent / "model_metadata.json"
    with metadata_path.open("w", encoding="utf-8") as fp:
        json.dump(metadata, fp, indent=2)

    print(f"Saved trained Keras model to: {output_model_path}")
    print(f"Saved training curves to: {curves_path}")
    print(f"Best validation accuracy: {best_val_acc:.4f}")


if __name__ == "__main__":
    main()
