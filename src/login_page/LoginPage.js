import React from "react";
import "./LoginPage.css";
import backgroundImg from "./background.jpg";
import flipzyLogo from "./Flipzy_Logo.png";

export default function LoginPage() {
  const clientId = "425935075553-hh37qk9fpi1ghoqntgo9u59isr7lhjtd.apps.googleusercontent.com"; 

  const loginWithGoogle = () => {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: "http://localhost:3000/main",
      response_type: "token",
      scope: "openid email profile",
      prompt: "select_account",
    });
    window.location.href =
      "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        height: "100vh",
        padding: "24px",
        display: "grid",
        placeItems: "center",
      }}
    >
      <main className="wrap">
        {/* Brand */}
        <section
          className="brand"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            marginTop: "30px",
          }}
        >
          <div
            className="logo"
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              marginBottom: "20px",
            }}
          >
            <img
              src={flipzyLogo}
              alt="Flipzy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
                border: "4px solid white",
              }}
            />
          </div>

          <h1
            style={{
              color: "white",
              textShadow: "0 0 6px rgba(0,0,0,0.4)",
              margin: 0,
            }}
          >
            Flipzy
          </h1>

          <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "4px" }}>
            Sign in with your Google Account
          </p>
        </section>

        {/* Google login */}
        <div className="card">
          <div className="content" style={{ textAlign: "center" }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={loginWithGoogle}
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Continue with Google
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
