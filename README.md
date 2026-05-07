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

## D3 Visualization
Start a local server, for example using `python3 -m http.server`, open `localhost:8000` from the browser and select `recovery_compass.html`
