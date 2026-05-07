# Data-Visualization-

## Preprocessing

Raw CSV files live in `data/raw/`. To regenerate the cleaned datasets in
`data/clean/`, run:

```bash
uv run python scripts/preprocess.py
```

## Notebooks

Active exploratory notebooks live in `notebooks/` and load the cleaned CSVs from
`data/clean/`.
