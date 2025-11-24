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
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => res.json())
          .then((googleUser) => {
            const backendUrl = "https://composite-service-425935075553.us-central1.run.app";
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
            if (!res.ok) throw new Error();
            return res.json();
          })
          .then((user) => {
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/main");
          })
          .catch(() => navigate("/"));
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
