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

Lokal tenant hostları: `localhost:3000` (marketing), `app.localhost:3000` (admin), `{slug}.localhost:3000` (sayt).

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
   - `app.solivya.homes`
   - `*.solivya.homes` (property subdomainləri: `demo.solivya.homes` və s.)
5. DNS (Vercel-in göstərdiyi record-lar):
   - Apex `solivya.homes` — A / ALIAS
   - `www`, `app`, `*` — CNAME → `cname.vercel-dns.com`
6. **Supabase** → Authentication → URL configuration:
   - Site URL: `https://app.solivya.homes`
   - Redirect URLs: `https://app.solivya.homes/**`, `https://solivya.homes/**`, lokal `http://app.localhost:3000/**`

Tenant routing production-da host əsasında işləyir: apex = marketing, `app.` = admin, digər subdomain = property saytı.
