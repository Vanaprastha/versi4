# Wates SDGs Dashboard — Refactor (frontend / src / asset)

Struktur baru agar mudah dikembangkan **tanpa mengubah tampilan & fitur inti**:

```
wates-dashboard-refactor/
├─ frontend/      # Next.js app (UI sama persis, + halaman Upload CSV)
│  ├─ public/
│  │  └─ assets/  # disinkron dari ../asset saat build/dev
│  └─ src/
├─ src/           # Backend FastAPI (pickle-based) untuk prediksi & clustering
│  ├─ app.py
│  ├─ train_model.py
│  ├─ models/     # taruh .pkl + columns.json + scaler.pkl di sini
│  └─ requirements.txt
└─ asset/         # sumber aset (gambar, background, foto tim, dll)
```

## Cara Jalan Lokal

### 1) Backend (FastAPI)
```bash
cd src
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# (opsional) latih model dari CSV kamu sendiri
# ganti --csv, --target, dan --features sesuai datasetmu
python train_model.py --csv data/latih.csv --target label --task classification --outdir models

# jalankan server
./run_local.sh  # atau: uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Endpoints:
- `GET /health` → cek model & kolom
- `POST /predict` (multipart file `file` = CSV) → hasil prediksi
- `POST /cluster` (multipart file `file` = CSV) → label cluster

### 2) Frontend (Next.js)
```bash
cd frontend
cp .env.local.example .env.local  # edit sesuai backend
npm i
npm run dev
```
Buka `http://localhost:3000`. Menu **Upload CSV** sudah tersedia dan akan memanggil backend via `NEXT_PUBLIC_API_BASE_URL`.

---

## Deploy (Gratisan Friendly)

### Frontend → Vercel
1. Buat project dari folder `frontend/`.
2. Set env var di Vercel: `NEXT_PUBLIC_API_BASE_URL=https://<domain-backend-kamu>`.
3. Deploy.

### Backend → Railway/Render
- **Railway**: Deploy dari folder `src/` (ada Dockerfile). Set `PORT=8000`.
- **Render**: New Web Service → Docker → root `src/`. Set env `PORT=8000`.
- Upload model (.pkl, scaler.pkl, columns.json) ke `src/models/` atau mount persistent storage.

### Supabase (opsional)
- Gunakan Supabase untuk simpan **arsip CSV** + logging hasil prediksi. Tambahkan di `frontend/src/lib/...` sesuai kebutuhan.

## Konvensi Model (Wajib Konsisten)
- `models/columns.json` menyimpan:
```json
{"features": ["feat1","feat2"], "target": "label"}
```
- Preprocessing menggunakan `scaler.pkl` (StandardScaler). **Pastikan kolom CSV upload sama urutannya**.
- Klasifikasi simpan di `classifier.pkl`, clustering di `kmeans.pkl`.

Semoga membantu! 🚀


### Sinkronisasi Aset
Edit gambar di `asset/`, lalu jalankan:
```bash
python scripts/sync_assets.py
```
Aset akan tersalin ke `frontend/public/assets`.
