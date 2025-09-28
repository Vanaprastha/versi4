\
import io
import os
import json
import pickle
from functools import lru_cache

import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

PORT = int(os.getenv("PORT", "8000"))
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app = FastAPI(title="Wates ML Backend (pickle)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.getenv("MODELS_DIR", os.path.join(os.path.dirname(__file__), "models"))
CLASSIFIER_PKL = os.getenv("CLASSIFIER_PKL", os.path.join(MODELS_DIR, "classifier.pkl"))
SCALER_PKL = os.getenv("SCALER_PKL", os.path.join(MODELS_DIR, "scaler.pkl"))
COLUMNS_JSON = os.getenv("COLUMNS_JSON", os.path.join(MODELS_DIR, "columns.json"))
KMEANS_PKL = os.getenv("KMEANS_PKL", os.path.join(MODELS_DIR, "kmeans.pkl"))

class Info(BaseModel):
    status: str
    versions: dict

def _safe_load(path: str):
    if not os.path.exists(path):
        return None
    with open(path, "rb") as f:
        return pickle.load(f)

@lru_cache(maxsize=1)
def _load_columns():
    if not os.path.exists(COLUMNS_JSON):
        return None
    with open(COLUMNS_JSON, "r") as f:
        return json.load(f)

@lru_cache(maxsize=1)
def _load_classifier():
    return _safe_load(CLASSIFIER_PKL)

@lru_cache(maxsize=1)
def _load_scaler():
    return _safe_load(SCALER_PKL)

@lru_cache(maxsize=1)
def _load_kmeans():
    return _safe_load(KMEANS_PKL)

@app.get("/health", response_model=Info)
def health():
    cols = _load_columns()
    return Info(
        status="ok",
        versions={
            "has_classifier": _load_classifier() is not None,
            "has_scaler": _load_scaler() is not None,
            "has_kmeans": _load_kmeans() is not None,
            "has_columns": cols is not None,
            "n_features": len(cols["features"]) if cols else 0,
            "target": cols.get("target") if cols else None,
        }
    )

def _read_csv(file: UploadFile) -> pd.DataFrame:
    content = file.file.read()
    df = pd.read_csv(io.BytesIO(content))
    return df

def _align_columns(df: pd.DataFrame, cols: dict) -> pd.DataFrame:
    missing = [c for c in cols["features"] if c not in df.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"Kolom hilang: {missing}")
    X = df[cols["features"]].copy()
    return X

@app.post("/predict")
def predict(file: UploadFile = File(...)):
    clf = _load_classifier()
    cols = _load_columns()
    if clf is None or cols is None:
        raise HTTPException(status_code=503, detail="Model/kolom belum tersedia. Jalankan training dulu.")
    df = _read_csv(file)
    X = _align_columns(df, cols)
    scaler = _load_scaler()
    if scaler is not None:
        Xs = scaler.transform(X)
    else:
        Xs = X.values
    try:
        yhat = clf.predict(Xs).tolist()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal prediksi: {e}")
    proba = None
    if hasattr(clf, "predict_proba"):
        try:
            proba = clf.predict_proba(Xs).tolist()
        except Exception:
            proba = None
    return {"n": len(yhat), "predictions": yhat, "proba": proba}

@app.post("/cluster")
def cluster(file: UploadFile = File(...)):
    km = _load_kmeans()
    cols = _load_columns()
    if km is None or cols is None:
        raise HTTPException(status_code=503, detail="Model clustering/kolom belum tersedia. Jalankan training dulu.")
    df = _read_csv(file)
    X = _align_columns(df, cols)
    scaler = _load_scaler()
    if scaler is not None:
        Xs = scaler.transform(X)
    else:
        Xs = X.values
    try:
        labels = km.predict(Xs).tolist()
    except AttributeError:
        # Older sklearn KMeans uses .predict only if fitted; else use .fit_predict as fallback
        labels = km.fit_predict(Xs).tolist()
    return {"n": len(labels), "labels": labels}
