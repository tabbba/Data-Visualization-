from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_RAW_DIR = PROJECT_ROOT / "data" / "raw"
DEFAULT_CLEAN_DIR = PROJECT_ROOT / "data" / "clean"


def load_csv(raw_dir: Path, filename: str, **kwargs: object) -> pd.DataFrame:
    path = raw_dir / filename
    if not path.exists():
        raise FileNotFoundError(f"Missing raw input: {path}")
    return pd.read_csv(path, **kwargs)


def clean_airport_traffic(raw_dir: Path, clean_dir: Path) -> Path:
    df = load_csv(raw_dir, "airport_traffic_merged.csv")
    df = df.drop(
        columns=["FLT_DEP_IFR_2", "FLT_ARR_IFR_2", "FLT_TOT_IFR_2", "MONTH_MON"],
        errors="ignore",
    )
    df["FLT_DATE"] = pd.to_datetime(df["FLT_DATE"])
    df["DOW"] = df["FLT_DATE"].dt.dayofweek
    df = df.drop_duplicates()

    output = clean_dir / "airport_clean.csv"
    df.to_csv(output, index=False)
    return output


def clean_carbon_prices(raw_dir: Path, clean_dir: Path) -> Path:
    df = load_csv(
        raw_dir,
        "Carbon Emissions Futures Historical Data.csv",
        encoding="utf-8-sig",
        sep=";",
        skiprows=1,
    )
    df = df.drop(columns=["Open", "High", "Low", "Vol.", "Change %"], errors="ignore")
    df["Date"] = pd.to_datetime(df["Date"], format="%m/%d/%Y")
    df = df.rename(columns={"Price": "EUA_PRICE_EUR"})

    df["YEAR"] = df["Date"].dt.year
    df["MONTH"] = df["Date"].dt.month
    monthly = (
        df.groupby(["YEAR", "MONTH"])["EUA_PRICE_EUR"]
        .mean()
        .round(2)
        .reset_index()
    )
    monthly["DATE"] = pd.to_datetime(
        monthly[["YEAR", "MONTH"]].assign(DAY=1)
    ).dt.strftime("%Y-%m-%d")
    monthly = monthly[["DATE", "YEAR", "MONTH", "EUA_PRICE_EUR"]]

    output = clean_dir / "carbon_price_monthly_cleaned.csv"
    monthly.to_csv(output, index=False)
    return output


def clean_emissions(raw_dir: Path, clean_dir: Path) -> list[Path]:
    df = load_csv(raw_dir, "g2g_emissions.csv")
    df.columns = df.columns.str.strip()
    text_columns = df.select_dtypes(include="str").columns
    df[text_columns] = df[text_columns].apply(lambda column: column.str.strip())
    df = df.drop(columns=["FOCUS_TYPE"], errors="ignore")
    df["CO2_KG"] = df["CO2_TONS"] * 1000
    df = df.drop(columns=["CO2_TONS"])
    df["DATE"] = pd.to_datetime(
        df["YEAR"].astype(str) + "-" + df["MONTH"].astype(str).str.zfill(2) + "-01"
    )
    df = df.drop_duplicates()

    state_output = clean_dir / "emission_state_clean.csv"
    network_output = clean_dir / "emission_network_clean.csv"
    df[df["LEVEL"] == "STATE"].copy().to_csv(state_output, index=False)
    df[df["LEVEL"] == "NETWORK"].copy().to_csv(network_output, index=False)
    return [state_output, network_output]


def clean_passengers(raw_dir: Path, clean_dir: Path) -> Path:
    df = load_csv(raw_dir, "passenger.csv", encoding="utf-8-sig", sep=";", skiprows=5)
    empty_columns = [column for column in df.columns if df[column].isna().all()]
    df = df.drop(columns=empty_columns)
    df = df.dropna(thresh=45)
    df = df.drop_duplicates()

    output = clean_dir / "passenger_clean.csv"
    df.to_csv(output, index=False)
    return output


def preprocess(raw_dir: Path, clean_dir: Path) -> list[Path]:
    raw_dir = raw_dir.resolve()
    clean_dir = clean_dir.resolve()
    clean_dir.mkdir(parents=True, exist_ok=True)

    outputs: list[Path] = []
    outputs.append(clean_airport_traffic(raw_dir, clean_dir))
    outputs.append(clean_carbon_prices(raw_dir, clean_dir))
    outputs.extend(clean_emissions(raw_dir, clean_dir))
    outputs.append(clean_passengers(raw_dir, clean_dir))
    return outputs


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate cleaned datasets from raw CSV files."
    )
    parser.add_argument(
        "--raw-dir",
        type=Path,
        default=DEFAULT_RAW_DIR,
        help="Directory containing raw CSV files.",
    )
    parser.add_argument(
        "--clean-dir",
        type=Path,
        default=DEFAULT_CLEAN_DIR,
        help="Directory where cleaned CSV files are written.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    outputs = preprocess(args.raw_dir, args.clean_dir)
    for output in outputs:
        print(output.relative_to(PROJECT_ROOT))


if __name__ == "__main__":
    main()
