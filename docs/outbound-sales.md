# Solivya — outbound satış (Addım 12)

Məqsəd: 20–30 günlük kirayə sahibinə yazmaq → demo göstərmək → **100 ₼ qurulum** almaq → səhifəni canlı etmək → **20 ₼/ay**.

Hazır linklər (domen alınana qədər local / sonra production):

| Nə | Link |
|---|---|
| Satış landing | `https://solivya.homes` (local: `http://127.0.0.1:3000`) |
| Demo səhifə | `https://demo.solivya.homes` (local: `http://demo.localhost:3000`) |
| Hesab / admin | `https://app.solivya.homes` |

---

## 1) Kimə yazmaq

Axtar:

- bina.az — “günlük kirayə”, “посуточно”, Bakı (və digər şəhərlər)
- Instagram — bio-da WhatsApp, “günlük”, “посуточно”, “Airbnb”
- 1–5 mənzili olan, agentlik olmayan “sahibindən” elanlar

Seçim filtrı:

- Elan aktivdir, telefon/WhatsApp var
- Fotolar zəif və ya qaydalar WhatsApp-da parçalanıb
- Marketplace-dədir, amma birbaşa qonaq da istəyə bilər

Hədəf: **gündə 8–12 mesaj**, 3 gün = ~25–35 nəfər.

---

## 2) İlk mesaj (WhatsApp / DM)

Qısa tut. Linki dərhal ver.

### Variant A — birbaşa

```
Salam. Elanınıza baxdım — günlük kirayə verirsiniz.

Qonaqlar adətən eyni sualları soruşur: qiymət, wifi, depozit, boş tarix.
Solivya ilə öz brendli səhifəniz olur: foto, qiymət, qaydalar bir linkdə,
WhatsApp birbaşa sizə gəlir. Marketplace komissiyası yoxdur.

Demo: [DEMO_LINK]
Qiymət: qurulum 100 ₼, sonra 20 ₼/ay.

Baxmaq istəyirsinizsə, 2 dəqiqəlik cavab kifayətdir.
```

### Variant B — daha yumşaq

```
Salam. Günlük kirayə elanınızı gördüm.

WhatsApp-da foto və qaydaları dəfələrlə göndərməmək üçün
sahiblərə öz linklərini düzəldirik — belə görünür: [DEMO_LINK]

Maraqlıdırsa yazın, qısa izah edim.
```

### Variant C — RU (elan rusdadırsa)

```
Здравствуйте. Увидел(а) ваше объявление посуточно.

Гости обычно спрашивают одно и то же: цена, wifi, депозит, даты.
Solivya — ваша брендовая страница: фото, цена, правила в одной ссылке,
WhatsApp сразу вам. Без комиссии маркетплейса.

Демо: [DEMO_LINK]
Цена: настройка 100 ₼, дальше 20 ₼/мес.

Если интересно — ответьте, коротко расскажу.
```

---

## 3) Cavab gələndə

### Maraqlanıb

```
Əla. Demo-ya baxın: [DEMO_LINK]
Landing (nə daxildir + qiymət): [LANDING_LINK]

Sizə uyğundursa:
1) mənzil adı / zona
2) gecəlik qiymət
3) 5–10 foto (WhatsApp-la da olar)

Qurulum 100 ₼ — səhifə adətən 1–3 günə hazır olur.
Sonra özünüz paneldən foto/qiymət dəyişirsiniz.
```

### “Nə fərqi var Airbnb / bina.az-dan?”

```
Onlar marketplace-dir — elanı orada saxlayırsınız.
Solivya sizin öz səhifənizdir: bio-ya, statusa, elana link qoyursunuz,
qonaq oxuyub birbaşa WhatsApp-ınıza yazır. Komissiya yoxdur.
```

### “Ödəniş saytdan olacaq?”

```
İndilik yox — qəsdən. Bron və ödəniş WhatsApp / nağd / köçürmə ilə.
Səhifə məlumat + etibar üçündür.
```

### “Bahadır” / “düşünüm”

```
Başa düşürəm. Qurulum bir dəfəlikdir; aylıq 20 ₼ hosting + paneldir.
İstəsəniz əvvəl demo-ya baxın — bəyənməsəniz davam etmirik.
Sabah qısa yazım?
```

### Cavab yoxdur (24–48 saat)

```
Salam, dünən demo linkini göndərmişdim: [DEMO_LINK]
Baxmağa vaxt olmadısa — bir cümlə kifayətdir, bağlayım.
```

---

## 4) Bağlama (ödəniş)

```
Razılaşırsınızsa:
Köçürmə: [KART / KAPITAL / M10 — öz rekvizitinizi yazın]
Məbləğ: 100 ₼ (qurulum)
Təsdiq screenshot göndərin.

Sonra:
- subdomain (məs. sahil.solivya.homes)
- admin girişi
- fotoları birlikdə yerləşdiririk / siz paneldən yükləyirsiniz
```

Aylıq: hər ayın əvvəlində 20 ₼ — eyni köçürmə. Avtomatik billing yoxdur (MVP).

---

## 5) İlk müştəri onboard (checklist)

Ödəniş gələndən sonra:

1. [ ] `app` panelində hesab yarat (və ya sahib signup edir)
2. [ ] Property: slug, title AZ/RU, zona, qiymət, qaydalar, WhatsApp nömrəsi
3. [ ] Fotolar: hero + qalereya (ən azı 5)
4. [ ] Publish → `https://{slug}.solivya.homes` yoxla (AZ + RU)
5. [ ] Sahibə göndər: canlı link + admin login + “bio-ya yapışdır”
6. [ ] Aylıq xatırlatma tarixi yaz (cədvəl / Notes)

Sahibə qısa təlimat:

```
Səhifəniz: [LIVE_LINK]
Admin: [APP_LOGIN]
Dəyişmək: foto, qiymət, qaydalar → Publish.

Linki Instagram bio, WhatsApp status və elana qoyun.
```

---

## 6) Sadə tracker (kopyala)

| # | Ad / mənbə | Kontakt | Yazıldı | Demo | Status | Qeyd |
|---|---|---|---|---|---|---|
| 1 | | | | | yeni / baxır / razı / ödədi / rədd | |
| 2 | | | | | | |

Statuslar: `yeni` → `cavab` → `demo` → `razı` → `ödədi` → `canlı` | `rədd` | `sonra`

---

## 7) “Hazır” meyarı

- ≥20 nəfərə yazılmayıbsa — hələ outbound bitməyib
- **≥1 ödənişli sahib canlıdır** → Addım 12 tamam

Domen hələ yoxdursa: demo + landing local/staging linklə sat; production DNS (Addım 3) ödənişdən əvvəl və ya dərhal sonra.
