import Script from "next/script";

/** GA4 web stream measurement ID for solivya.homes. */
export function gaMeasurementId(): string {
  const value = (
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-5RF1NH5SZK"
  ).trim();
  return /^G-[A-Z0-9]+$/.test(value) ? value : "";
}

export function GoogleAnalytics() {
  const id = gaMeasurementId();
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">{`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');
`}</Script>
    </>
  );
}
