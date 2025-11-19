import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      fetch("http://localhost:4000/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          // Save user info locally
          localStorage.setItem("user", JSON.stringify(data));

          // Go to main page
          navigate("/main");
        });
    }
  }, [navigate]);

  return <div>Signing you in...</div>;
}
