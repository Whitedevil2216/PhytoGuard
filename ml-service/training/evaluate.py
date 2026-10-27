"""Evaluate a trained Keras CNN strictly on the held-out PlantVillage test split."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def save_confusion_matrix_plot(cm, class_labels: list[str], out_path: Path) -> None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig_size = max(8, int(len(class_labels) * 0.55))
    fig, ax = plt.subplots(figsize=(fig_size, fig_size))
    im = ax.imshow(cm, interpolation="nearest", cmap="Greens")
    fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)

    short_labels = [lbl.replace("___", " · ") for lbl in class_labels]
    ax.set_xticks(range(len(short_labels)))
    ax.set_yticks(range(len(short_labels)))
    ax.set_xticklabels(short_labels, rotation=90, fontsize=7)
    ax.set_yticklabels(short_labels, fontsize=7)
    ax.set_xlabel("Predicted Class")
    ax.set_ylabel("True Held-Out Class")
    ax.set_title("PlantVillage Held-Out Test Confusion Matrix")

    fig.tight_layout()
    fig.savefig(out_path, dpi=160)
    plt.close(fig)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Evaluate trained CNN weights on held-out PlantVillage test/ images."
    )
    parser.add_argument("--test-dir", default="data/plantvillage_split/test")
    parser.add_argument("--model-path", default="models/plantvillage_cnn.keras")
    parser.add_argument("--labels-path", default="class_labels.json")
    parser.add_argument("--image-size", type=int, default=224)
    parser.add_argument("--batch-size", type=int, default=32)
    args = parser.parse_args()

    import numpy as np
    from sklearn.metrics import (
        accuracy_score,
        classification_report,
        confusion_matrix,
        precision_recall_fscore_support,
    )
    import tensorflow as tf

    test_dir = Path(args.test_dir)
    model_path = Path(args.model_path)
    labels_path = Path(args.labels_path)

    if not test_dir.exists():
        raise FileNotFoundError(f"Held-out test directory not found: {test_dir}")
    if not model_path.exists():
        raise FileNotFoundError(f"Trained Keras model not found: {model_path}")

    with labels_path.open("r", encoding="utf-8") as fp:
        class_labels = json.load(fp)

    raw_test_ds = tf.keras.utils.image_dataset_from_directory(
        test_dir,
        image_size=(args.image_size, args.image_size),
        batch_size=args.batch_size,
        label_mode="int",
        class_names=class_labels,
        shuffle=False,
    )

    rescale = tf.keras.layers.Rescaling(1.0 / 255.0)
    test_ds = raw_test_ds.map(lambda x, y: (rescale(x), y))

    model = tf.keras.models.load_model(str(model_path), compile=False)

    y_true = []
    y_pred = []

    for batch_images, batch_labels in test_ds:
        probs = model.predict(batch_images, verbose=0)
        preds = np.argmax(probs, axis=1)
        y_true.extend(batch_labels.numpy().tolist())
        y_pred.extend(preds.tolist())

    overall_acc = float(accuracy_score(y_true, y_pred))
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_true, y_pred, average="macro", zero_division=0
    )
    per_class_report = classification_report(
        y_true,
        y_pred,
        target_names=class_labels,
        output_dict=True,
        zero_division=0,
    )
    cm = confusion_matrix(y_true, y_pred)

    out_dir = model_path.parent
    cm_plot_path = out_dir / "confusion_matrix.png"
    save_confusion_matrix_plot(cm, class_labels, cm_plot_path)

    report_payload = {
        "test_samples": len(y_true),
        "overall_accuracy": round(overall_acc, 4),
        "macro_precision": round(float(precision), 4),
        "macro_recall": round(float(recall), 4),
        "macro_f1": round(float(f1), 4),
        "per_class": per_class_report,
    }
    report_path = out_dir / "evaluation_report.json"
    with report_path.open("w", encoding="utf-8") as fp:
        json.dump(report_payload, fp, indent=2)

    print(json.dumps({k: v for k, v in report_payload.items() if k != "per_class"}, indent=2))
    print(f"Saved confusion matrix plot to: {cm_plot_path}")
    print(f"Saved detailed evaluation report to: {report_path}")


if __name__ == "__main__":
    main()
