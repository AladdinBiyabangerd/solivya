export default function AdminHome() {
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
          Solivya · admin
        </p>
        <h1 style={{ fontSize: "1.75rem", marginBottom: 12 }}>
          app.solivya.homes
        </h1>
        <p style={{ color: "#57534E", lineHeight: 1.6 }}>
          Sahib paneli burada olacaq (login + redaktə). Local:{" "}
          <code>http://app.localhost:3000</code>
        </p>
      </div>
    </main>
  );
}
