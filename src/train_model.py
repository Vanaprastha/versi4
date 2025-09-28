\
import argparse, os, json, pickle
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", required=True, help="Path CSV latih")
    ap.add_argument("--target", required=True, help="Nama kolom target (untuk klasifikasi)")
    ap.add_argument("--features", nargs="+", help="Daftar fitur; default = selain target")
    ap.add_argument("--task", choices=["classification","clustering"], default="classification")
    ap.add_argument("--outdir", default=os.path.join(os.path.dirname(__file__), "models"))
    ap.add_argument("--k", type=int, default=3, help="Jumlah cluster untuk clustering")
    args = ap.parse_args()

    os.makedirs(args.outdir, exist_ok=True)
    df = pd.read_csv(args.csv)

    if args.features is None:
        features = [c for c in df.columns if c != args.target]
    else:
        features = args.features

    X = df[features].values

    scaler = StandardScaler()
    Xs = scaler.fit_transform(X)

    columns = {"features": features, "target": args.target}

    if args.task == "classification":
        y = df[args.target].values
        clf = LogisticRegression(max_iter=500)
        clf.fit(Xs, y)
        with open(os.path.join(args.outdir, "classifier.pkl"), "wb") as f:
            pickle.dump(clf, f)
    else:
        km = KMeans(n_clusters=args.k, n_init=10, random_state=42)
        km.fit(Xs)
        with open(os.path.join(args.outdir, "kmeans.pkl"), "wb") as f:
            pickle.dump(km, f)

    with open(os.path.join(args.outdir, "scaler.pkl"), "wb") as f:
        pickle.dump(scaler, f)
    with open(os.path.join(args.outdir, "columns.json"), "w") as f:
        json.dump(columns, f, indent=2)

    print("Model tersimpan di:", args.outdir)

if __name__ == "__main__":
    main()
