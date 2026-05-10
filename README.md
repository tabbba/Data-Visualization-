# Data Visualization

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen?logo=github)](https://tabbba.github.io/Data-Visualization-/)
[![Python](https://img.shields.io/badge/Python-3.14-blue?logo=python&logoColor=white)](https://www.python.org/)
[![D3.js](https://img.shields.io/badge/D3.js-v7-orange?logo=d3.js&logoColor=white)](https://d3js.org/)
[![uv](https://img.shields.io/badge/uv-package%20manager-purple)](https://github.com/astral-sh/uv)
[![Jupyter](https://img.shields.io/badge/Jupyter-notebooks-F37626?logo=jupyter&logoColor=white)](https://jupyter.org/)

Interactive D3.js visualization exploring aviation recovery data post-COVID, with Python-based preprocessing and exploratory notebooks.

**Live site:** [tabbba.github.io/Data-Visualization-](https://tabbba.github.io/Data-Visualization-/)

---

## Run locally

```bash
python3 -m http.server
```

Then open [localhost:8000](http://localhost:8000) in your browser.

---

## Setup

Sync the environment before running anything:

```bash
uv sync
```

## Preprocessing

Raw CSV files live in `data/raw/`. To regenerate the cleaned datasets in `data/clean/`:

```bash
uv run python scripts/preprocess.py
```

## Notebooks

Exploratory notebooks are in `notebooks/` and load cleaned data from `data/clean/`.

