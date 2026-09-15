# Solivya

Solivya — sahib brendli **günlük kirayə** üçün kiçik veb saytdır.

Məqsəd sadədir: qonaq elanda bütün lazımi məlumatı görsün — şəkillər, otaqlar, qiymət, rezervasiya — və ev sahibi öz brendi ilə tanınsın. Başqa platformanın görünüşü deyil; evi olan insanın öz səhifəsi.

Hazırda layihə qurulur: dizayn nümunəsi var, əsas sayt isə işə salınıb və məlumat bazasına bağlanıb.

---

## Kim üçündür?

- Evini və ya mənzilini günlük kirayəyə verənlər
- Öz brendi ilə sadə, gözəl rezervasiya səhifəsi istəyənlər

---

## Nə olacaq?

Qonaq səhifədə evi görəcək, tarix seçəcək və rezervasiya edəcək.  
Sahib isə öz brendi, şəkilləri və qiymətləri ilə səhifəni idarə edəcək.

---

## Texniki hissə

**Stack:** Next.js · React · TypeScript · Tailwind CSS · Supabase  
**Host:** Vercel (aladdinbiyabangerd.site ilə eyni)

---

## İşə salmaq

Əvvəlcə bir dəfə:

```bash
npm install
```

`.env.example` → `.env.local` kopyala və Supabase açarlarını doldur.

**Dev (lokal işlətmək)** — http://127.0.0.1:3000

```bash
npm run dev
```

Lokal: `localhost:3000` (marketing + `/admin` panel), `{slug}.localhost:3000` (sayt). Köhnə `app.localhost` ana hosta (`/admin`) yönləndirilir.

**Build** — production build

```bash
npm run build
```

**Start** — build-dən sonra serveri işə salmaq

```bash
npm run start
```

---

## Vercel deploy

1. [Vercel](https://vercel.com) → **Add New Project** → GitHub `AladdinBiyabangerd/solivya`  
   Framework: Next.js (avtomatik). Build: `npm run build`.
2. **Environment Variables** (Production + Preview) — `.env.example` açarları:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_ROOT_DOMAIN` = `solivya.homes`
   - `NEXT_PUBLIC_SALES_WHATSAPP`
3. Deploy et. Əvvəlcə `*.vercel.app` URL marketing kimi işləyir.
4. **Domains** (Project → Settings → Domains):
   - `solivya.homes`
   - `www.solivya.homes` (vercel.json `www` → apex 301 edir)
   - `app.solivya.homes` (opsional; middleware apex `/admin`-ə 308 edir)
   - `*.solivya.homes` (property subdomainləri: `demo.solivya.homes` və s.)
5. DNS (Vercel-in göstərdiyi record-lar):
   - Apex `solivya.homes` — A / ALIAS
   - `www`, `app` (legacy), `*` — CNAME → `cname.vercel-dns.com`
6. **Supabase** → Authentication → URL configuration:
   - Site URL: `https://solivya.homes`
   - Redirect URLs: `https://solivya.homes/**`, lokal `http://localhost:3000/**`

Tenant routing: apex = marketing + path `/admin` (owner panel), digər subdomain = property saytı. `app.` legacy redirect.
