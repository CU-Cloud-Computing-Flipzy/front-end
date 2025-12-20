import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const accessToken = params.get("access_token");

      if (accessToken) {
        // 1. Get Google Info
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => res.json())
          .then((googleUser) => {
            const backendUrl = "https://composite-service-425935075553.us-central1.run.app";
            
            // 2. Send to your Backend to create/fetch user
            return fetch(`${backendUrl}/login/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: googleUser.email,
                username: googleUser.name,
                full_name: googleUser.name,
                avatar_url: googleUser.picture,
                google_token: accessToken,
              }),
            });
          })
          .then((res) => {
            if (!res.ok) throw new Error("Backend login failed");
            return res.json();
          })
          .then((data) => {
            // data = { user: { ... }, jwt: "..." }

            // 3. TRANSFORM DATA
            const userForFrontend = {
                id: data.user.id,
                name: data.user.full_name || data.user.username, 
                email: data.user.email,
                picture: data.user.avatar_url,
                // UPDATED: Save the role here so it is available immediately
                role: data.user.role, 
                jwt: data.jwt,
                balance: "$0.00" 
            };

            localStorage.setItem("user", JSON.stringify(userForFrontend));
            navigate("/main");
          })
          .catch((err) => {
            console.error("Login Error:", err);
            navigate("/");
          });
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4f6",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2>Verifying your credentials...</h2>
    </div>
  );
}