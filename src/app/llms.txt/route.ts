import { SITE, siteUrl, BUILDER } from "@/lib/site";

export function GET() {
  const origin = siteUrl();
  const body = `# ${SITE.name}

> Branded single-page sites for daily/short-term rental owners in Baku.
> Guests see photos, price, and rules, then message the owner on WhatsApp.

## Product

- Marketing: ${origin}/?lang=az
- Marketing (RU): ${origin}/?lang=ru
- Demo listing: https://demo.solivya.homes/?lang=az
- Owner app: https://app.solivya.homes/login

## Pricing (AZN)

- Setup: 100
- Monthly: 20

## Builder

- ${BUILDER.name}: ${BUILDER.portfolioOrigin}

## Notes

- Public locales: az (default), ru via ?lang=
- Each published property lives on {slug}.solivya.homes
- Do not index /admin, /login, /signup, or /preview
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
