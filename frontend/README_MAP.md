# Peta SDGs 1 & Clustering (Integrasi Leaflet)

## Rute Halaman
Kunjungi: `/sdg/map`

## API
Endpoint: `/api/sdgs1_map`  
Mengembalikan JSON gabungan `sdgs_1` + `location_village` (butuh FK `sdgs_1(nama_desa)` → `location_village(nama_desa)`).

## Dependensi
- leaflet
- react-leaflet

Jalankan:
```bash
npm install
npm run dev
```
Pastikan env:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
```
