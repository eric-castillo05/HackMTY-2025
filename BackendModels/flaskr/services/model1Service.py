from pathlib import Path
from typing import List, Optional
import pandas as pd

COL_DATE   = "Date"
class model1Service:
    def __init__(self):
        pass

    def add_calendar_feats(ddf: pd.DataFrame, date_col: str = COL_DATE) -> pd.DataFrame:
        ddf = ddf.copy()
        ddf[date_col] = pd.to_datetime(ddf[date_col], errors="coerce")
        ddf["year"] = ddf[date_col].dt.year
        ddf["month"] = ddf[date_col].dt.month
        ddf["day"] = ddf[date_col].dt.day
        ddf["dow"] = ddf[date_col].dt.dayofweek
        ddf["weekofyear"] = ddf[date_col].dt.isocalendar().week.astype(int)
        ddf["quarter"] = ddf[date_col].dt.quarter
        return ddf

    def load_table_any(path: Path) -> pd.DataFrame:
        """Lee .xlsx/.xls con read_excel, .csv con read_csv (inferiendo sep por defecto)."""
        suffix = path.suffix.lower()
        if suffix in [".xlsx", ".xls"]:
            return pd.read_excel(path)
        elif suffix in [".csv", ".txt"]:
            return pd.read_csv(path)
        else:
            # intento final: read_excel
            try:
                return pd.read_excel(path)
            except Exception:
                return pd.read_csv(path)

    def ensure_required_columns(df: pd.DataFrame, required: List[str]) -> Optional[List[str]]:
        missing = [c for c in required if c not in df.columns]
        return missing if len(missing) > 0 else None

    def med_lastk(df_base: pd.DataFrame, mask, col: str, k: int = 28) -> Optional[float]:
        sub = df_base[mask].sort_values(COL_DATE).tail(k)
        vals = pd.to_numeric(sub[col], errors="coerce").dropna()
        return float(vals.median()) if len(vals) else None