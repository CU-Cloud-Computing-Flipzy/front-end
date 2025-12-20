import React from "react";
import flipzyLogo from "./Flipzy_Logo.png";

export default function LoginPage() {
  const clientId = "425935075553-hh37qk9fpi1ghoqntgo9u59isr7lhjtd.apps.googleusercontent.com";

  const loginWithGoogle = () => {
    const redirectUri = "https://storage.googleapis.com/flipzy-frontend/index.html";
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "token",
      scope: "openid email profile",
      prompt: "select_account",
    });
    window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; margin: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .login-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
      `}</style>

      <div style={styles.contentWrapper}>
        <div style={styles.logoContainer}>
          <img src={flipzyLogo} alt="Flipzy Logo" style={styles.logoImage} />
        </div>

        <h1 style={styles.title}>Welcome to Flipzy</h1>
        <p style={styles.subtitle}>Manage your wallet and shop with ease.</p>

        <div className="login-card" style={styles.card}>
          <button
            onClick={loginWithGoogle}
            style={styles.googleButton}
            onMouseEnter={(e) => (e.target.style.background = "#f8fafc")}
            onMouseLeave={(e) => (e.target.style.background = "white")}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="G"
              style={{ width: "24px", height: "24px" }}
            />
            <span>Continue with Google</span>
          </button>
        </div>

        <p style={styles.footerText}>
          By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    background: "#f3f4f6",
    backgroundImage: "radial-gradient(circle at 50% 0%, #e0e7ff 0%, #f3f4f6 70%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  contentWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    animation: "fadeIn 0.6s ease-out forwards",
    maxWidth: "400px",
    width: "90%",
  },
  logoContainer: {
    width: "100px",
    height: "100px",
    borderRadius: "24px",
    background: "white",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#111827",
    margin: "0 0 8px 0",
    textAlign: "center",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "16px",
    marginBottom: "32px",
    textAlign: "center",
  },
  card: {
    background: "white",
    padding: "40px 30px",
    borderRadius: "24px",
    width: "100%",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  googleButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    width: "100%",
    padding: "14px",
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#374151",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  footerText: {
    marginTop: "24px",
    fontSize: "12px",
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: "1.5",
  },
};