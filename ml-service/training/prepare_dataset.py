"""Prepare a leak-free 70/15/15 train/val/test split from a PlantVillage folder."""

from __future__ import annotations

import argparse
import json
import random
import shutil
from pathlib import Path
from typing import List

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def collect_images(class_dir: Path) -> List[Path]:
    files = [
        p
        for p in sorted(class_dir.iterdir())
        if p.is_file() and p.suffix.lower() in VALID_EXTENSIONS
    ]
    return files


def split_dataset(
    raw_dir: Path,
    output_dir: Path,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    seed: int = 42,
    selected_classes: List[str] | None = None,
) -> dict:
    if not raw_dir.exists():
        raise FileNotFoundError(f"Raw PlantVillage directory not found: {raw_dir}")

    rng = random.Random(seed)
    all_subdirs = sorted([d for d in raw_dir.iterdir() if d.is_dir()])

    if selected_classes:
        wanted = set(selected_classes)
        class_dirs = [d for d in all_subdirs if d.name in wanted]
    else:
        class_dirs = all_subdirs

    if not class_dirs:
        raise ValueError("No matching PlantVillage class folders found in raw_dir.")

    summary = {"seed": seed, "classes": {}, "totals": {"train": 0, "val": 0, "test": 0}}

    for split_name in ("train", "val", "test"):
        (output_dir / split_name).mkdir(parents=True, exist_ok=True)

    for class_dir in class_dirs:
        images = collect_images(class_dir)
        if len(images) < 10:
            raise ValueError(
                f"Class '{class_dir.name}' only contains {len(images)} images; need at least 10."
            )

        shuffled = list(images)
        rng.shuffle(shuffled)

        n_total = len(shuffled)
        n_train = int(n_total * train_ratio)
        n_val = int(n_total * val_ratio)

        splits = {
            "train": shuffled[:n_train],
            "val": shuffled[n_train : n_train + n_val],
            "test": shuffled[n_train + n_val :],
        }

        # Verify zero overlap across train, val, and test partitions
        train_set = {p.resolve() for p in splits["train"]}
        val_set = {p.resolve() for p in splits["val"]}
        test_set = {p.resolve() for p in splits["test"]}
        assert train_set.isdisjoint(val_set), "Data leakage detected between train and val!"
        assert train_set.isdisjoint(test_set), "Data leakage detected between train and test!"
        assert val_set.isdisjoint(test_set), "Data leakage detected between val and test!"

        summary["classes"][class_dir.name] = {
            "train": len(splits["train"]),
            "val": len(splits["val"]),
            "test": len(splits["test"]),
        }

        for split_name, split_files in splits.items():
            dest_class_dir = output_dir / split_name / class_dir.name
            dest_class_dir.mkdir(parents=True, exist_ok=True)
            summary["totals"][split_name] += len(split_files)
            for src_path in split_files:
                shutil.copy2(src_path, dest_class_dir / src_path.name)

    manifest_path = output_dir / "split_manifest.json"
    with manifest_path.open("w", encoding="utf-8") as fp:
        json.dump(summary, fp, indent=2)

    return summary


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Split raw PlantVillage class directories into disjoint train/val/test folders."
    )
    parser.add_argument("--raw-dir", required=True, help="Path to raw PlantVillage root folder")
    parser.add_argument(
        "--output-dir",
        default="data/plantvillage_split",
        help="Destination folder for train/val/test splits",
    )
    parser.add_argument(
        "--labels-file",
        default="class_labels.json",
        help="Optional class_labels.json filter to restrict to the 21 supported classes",
    )
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    selected = None
    labels_path = Path(args.labels_file)
    if labels_path.exists():
        with labels_path.open("r", encoding="utf-8") as fp:
            selected = json.load(fp)

    stats = split_dataset(
        raw_dir=Path(args.raw_dir),
        output_dir=Path(args.output_dir),
        seed=args.seed,
        selected_classes=selected,
    )
    print(f"Dataset split complete: {json.dumps(stats['totals'], indent=2)}")


if __name__ == "__main__":
    main()
