import { SITE, siteUrl, BUILDER } from "@/lib/site";

export function GET() {
  const origin = siteUrl();
  const body = `# ${SITE.name}

> Branded single-page sites for daily/short-term rental owners in Baku.
> Guests see photos, price, and rules, then message the owner on WhatsApp.
> Currently free (setup + monthly); paid plans may come later. No marketplace commission.

## Product

- Marketing: ${origin}/?lang=az
- Marketing (RU): ${origin}/?lang=ru
- Browse listings: ${origin}/browse?lang=az
- Demo listing: https://demo.solivya.homes/?lang=az
- Owner app: ${origin}/admin/login

## Pricing (AZN)

- Setup: free (for now)
- Monthly: free (for now)
- Commission: none

## Builder

- ${BUILDER.name}: ${BUILDER.portfolioOrigin}

## Notes

- Public locales: az (default), ru via ?lang=
- Each published property lives on {slug}.solivya.homes
- Share preview (OG) for a listing uses the owner's main photo
- Marketing /browse share preview uses the Solivya brand card
- Do not index /admin or /admin/preview
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
