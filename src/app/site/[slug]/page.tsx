type Props = {
  params: Promise<{ slug: string }>;
};

export default async function SiteHome({ params }: Props) {
  const { slug } = await params;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#F7F3EE",
        color: "#1C1917",
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <p
          style={{
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontSize: 12,
            color: "#9A7B4F",
            marginBottom: 12,
          }}
        >
          Solivya · site
        </p>
        <h1 style={{ fontSize: "1.75rem", marginBottom: 12 }}>
          {slug}.solivya.homes
        </h1>
        <p style={{ color: "#57534E", lineHeight: 1.6 }}>
          İctimai mənzil səhifəsi. Slug: <strong>{slug}</strong>
          <br />
          Local: <code>http://{slug}.localhost:3000</code>
        </p>
      </div>
    </main>
  );
}
