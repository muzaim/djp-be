# ⚡ DJP NestJS Boilerplate

> Starter template backend NestJS + TypeScript + MySQL + TypeORM yang bersih, scalable, dan siap produksi. Dibuat sesederhana mungkin tanpa *over-engineering* agar mudah dipahami dan dikembangkan.

---

## 🚀 Panduan Cepat (Quick Start)

Ikuti langkah-langkah berikut untuk menjalankan project di komputer lokal Anda:

### 1. Install Dependencies
```bash
make install
```

### 2. Siapkan Database MySQL Lokal
1. Pastikan **MySQL** sudah menyala di komputer Anda.
2. Buka DBeaver (atau database manager pilihan Anda), lalu buat database baru bernama **`djp`**:
   ```sql
   CREATE DATABASE djp;
   ```
3. Salin file template environment variable:
   ```bash
   cp .env.example .env
   ```
4. Buka file `.env` yang baru dibuat, lalu sesuaikan username dan password MySQL Anda:
   ```ini
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USERNAME=root         # Ganti dengan username MySQL Anda
   DB_PASSWORD=yourpassword # Ganti dengan password MySQL Anda
   DB_DATABASE=djp
   ```

### 3. Jalankan Migrasi & Mulai Aplikasi
```bash
# Membuat tabel database secara otomatis berdasarkan entity kode kita
make migrate-run

# Menjalankan server NestJS (mode development / watch-mode)
make dev
```

*   **API Base URL**: `http://localhost:3000/api/v1`
*   **Dokumentasi Swagger UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🛠️ Daftar Perintah Developer (Makefile)

Gunakan perintah pintas `make` berikut di terminal untuk mempercepat alur kerja Anda:

### 🗄️ Database & Migrasi
*   `make migrate-show` — Melihat status migrasi (apakah ada migrasi yang belum dijalankan).
*   `make migrate-run` — Menjalankan semua file migrasi yang pending ke database.
*   `make migrate-revert` — Membatalkan (rollback) satu migrasi terakhir.
*   `make migrate-generate name=<NamaMigrasi>` — Mendeteksi perubahan entity kode kita dan otomatis membuat file SQL migrasi baru.
    *   *Contoh:* `make migrate-generate name=CreateUsersTable`
*   `make seed` — Mengisi database dengan data dummy awal (placeholder).

### 💻 Menjalankan & Build Server
*   `make dev` — Menjalankan server lokal (otomatis restart setiap kali ada perubahan file).
*   `make build` — Compile kode TypeScript menjadi JavaScript siap produksi ke dalam folder `/dist`.
*   `make start` — Menjalankan hasil compile build siap produksi.

### 🧪 Kualitas Kode & Pengujian (Test)
*   `make lint` — Memeriksa kesalahan format penulisan kode (ESLint).
*   `make format` — Merapikan format kode secara otomatis menggunakan Prettier.
*   `make test` — Menjalankan Unit Test (Jest).
*   `make test-e2e` — Menjalankan Integration Test / End-to-End (Jest).

---

## 📦 Menjalankan Aplikasi dengan Docker (Opsional)

Jika Anda ingin menjalankan aplikasi NestJS di dalam container Docker, namun tetap menggunakan database MySQL yang terinstall di lokal komputer Anda:

1. Ubah `DB_HOST` di file `.env` lokal Anda ke alamat gateway host Docker:
   ```ini
   DB_HOST=host.docker.internal
   ```
2. Jalankan docker compose:
   ```bash
   docker compose up --build
   ```

---

## 📁 Struktur Folder & Desain Kode

Struktur project ini menggunakan arsitektur berbasis modular (feature/domain):

```text
src/
├── common/                  # Filter error global & middleware pendukung
├── config/                  # Pengaturan & validasi otomatis file .env saat startup
├── database/                # Konfigurasi TypeORM CLI & file hasil migrasi SQL
├── modules/                 # Modul fitur bisnis aplikasi (berbasis domain)
│   ├── health/              # Modul pengecekan status server (/api/v1/health)
│   └── users/               # Modul contoh CRUD User (Controller, Service, Entity, DTOs)
├── app.module.ts            # Modul utama (AppModule) yang merangkai semua modul
└── main.ts                  # Bootstrapper (Port, CORS, Helmet, Versioning, Global Validation)
```

> [!NOTE]
> Kami tidak membungkus TypeORM repository dengan abstraction class tambahan (seperti BaseRepository/BaseService) agar kode tetap ringan, mudah dipahami, dan performanya maksimal.
