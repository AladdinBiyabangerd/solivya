import { createClient } from "@/utils/supabase/server";

export default async function MarketingHome() {
  const supabase = await createClient();
  const { error } = await supabase.auth.getSession();
  const connected = !error;

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
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <p
          style={{
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontSize: 12,
            color: "#9A7B4F",
            marginBottom: 12,
          }}
        >
          Solivya · marketing
        </p>
        <h1 style={{ fontSize: "1.75rem", marginBottom: 12 }}>
          solivya.homes
        </h1>
        <p style={{ color: "#57534E", lineHeight: 1.6, marginBottom: 20 }}>
          Satış landing buraya gələcək. Local test:{" "}
          <code>localhost</code>, <code>app.localhost</code>,{" "}
          <code>demo.localhost</code>
        </p>
        <p
          style={{
            display: "inline-block",
            padding: "0.5rem 0.9rem",
            borderRadius: 4,
            background: connected ? "#E8F0EA" : "#F5E6E4",
            color: connected ? "#3F5E4A" : "#7F1D1D",
            fontSize: 14,
          }}
        >
          Supabase: {connected ? "bağlantı OK" : error.message}
        </p>
      </div>
    </main>
  );
}
