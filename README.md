# Dekan Admin v1

Dekan projesi için özel, koyu temalı bir GitHub release/admin paneli.

## v1'de neler var?

- GitHub release installer indirme sayıları
- Tüm release'lerin toplam indirmeleri
- Latest sürüm ve yayın tarihi
- GitHub stars / forks / açık issue
- Son GitHub Actions workflow durumu
- Release bazında installer adı ve SHA-256 digest
- Admin şifreli giriş
- Dekan logo ve özel tema
- Her 5 dakikada bir GitHub verisi yenileme
- Kullanıcı cihazlarından **hiçbir telemetry toplamama**

> Bu sürüm yalnızca GitHub'ın public repository API'sini okur.

---

## 1. Local çalıştırma

Node.js 20+ önerilir.

```bash
npm install
```

`.env.example` dosyasını `.env.local` olarak kopyala:

```bash
copy .env.example .env.local
```

Mac/Linux:

```bash
cp .env.example .env.local
```

`.env.local` içini düzenle:

```env
GITHUB_REPO=chrisssst/Dekan
ADMIN_PASSWORD=buraya-guclu-bir-sifre
ADMIN_SECRET=buraya-uzun-rastgele-bir-secret
GITHUB_TOKEN=
```

Sonra:

```bash
npm run dev
```

Tarayıcı:

```text
http://localhost:3000
```

---

## 2. ADMIN_SECRET üretme

PowerShell:

```powershell
-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```

veya herhangi bir password manager ile 40+ karakter rastgele değer oluştur.

`ADMIN_PASSWORD` ve `ADMIN_SECRET` dosyalarını GitHub'a commit etme.

---

## 3. Vercel'e deploy

1. Bu projeyi yeni bir GitHub reposuna yükle: örneğin `Dekan-Admin`.
2. Vercel'e gir.
3. `Add New -> Project`.
4. `Dekan-Admin` reposunu seç.
5. Framework otomatik olarak Next.js seçilir.
6. Environment Variables bölümüne şunları ekle:

```text
GITHUB_REPO = chrisssst/Dekan
ADMIN_PASSWORD = kendi admin şifren
ADMIN_SECRET = uzun rastgele secret
```

`GITHUB_TOKEN` opsiyoneldir ancak GitHub API rate limit için önerilir.

7. Deploy'a bas.

---

## GitHub token gerekli mi?

Hayır. Public repository verileri token olmadan da okunabilir.

Ancak GitHub'ın anonim API rate limit'i daha düşüktür. Paneli sık kullanacaksan read-only fine-grained GitHub token eklemek daha iyi olur.

Token'ı **client-side** kullanma. Bu proje token'ı yalnızca Next.js server tarafında kullanır.

---

## Privacy

Dekan Admin v1 kullanıcı bilgisayarlarından veri toplamaz.

Şu anda gösterilen bilgiler yalnızca GitHub'dan gelir:

- release indirme sayıları
- stars / forks / issues
- release metadata
- Actions workflow durumu

v2'de aktif kurulum / app-open / crash analytics eklenirse bunun kullanıcıya açıkça gösterilen, anonim ve isteğe bağlı olması önerilir.

---

## Not

GitHub'ın `download_count` alanı indirme adedini gösterir; **kimlerin indirdiğini göstermez**.
