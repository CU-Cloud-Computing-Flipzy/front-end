import React from "react";

export default function MainPage() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [activePage, setActivePage] = React.useState("home");

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: "220px",
          background: "#111827",
          color: "white",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
        }}
      >
        {/* Profile Photo */}
        <img
          src={user?.picture}
          alt="Profile"
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            border: "3px solid white",
            marginBottom: "10px",
          }}
        />

        <SidebarButton onClick={() => setActivePage("profile")}>
          User Profile
        </SidebarButton>

        <SidebarButton onClick={() => setActivePage("wallet")}>
          Wallet
        </SidebarButton>

        <SidebarButton onClick={() => setActivePage("shop")}>
          Shop
        </SidebarButton>

        <SidebarButton onClick={() => setActivePage("cart")}>
          Cart
        </SidebarButton>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          padding: "40px",
          marginLeft: "240px",
          color: "black",
        }}
      >
        {activePage === "home" && <Home user={user} />}
        {activePage === "profile" && <UserProfile user={user} />}
        {activePage === "wallet" && <Wallet />}
        {activePage === "shop" && <Shop />}
        {activePage === "cart" && (
          <Cart onCheckout={() => setActivePage("checkout")} />
        )}
        {activePage === "checkout" && (
          <Checkout onBack={() => setActivePage("cart")} />
        )}
      </div>
    </div>
  );
}

/* Sidebar Button with Hover Effects */
const SidebarButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    style={{ ...sidebarBtnStyle }}
    onMouseEnter={(e) => {
      e.target.style.background = "rgba(255, 255, 255, 0.2)";
      e.target.style.transform = "scale(1.03)";
      e.target.style.borderLeft = "4px solid #3b82f6";
    }}
    onMouseLeave={(e) => {
      e.target.style.background = "rgba(255, 255, 255, 0.1)";
      e.target.style.transform = "scale(1)";
      e.target.style.borderLeft = "4px solid transparent";
    }}
  >
    {children}
  </button>
);

const sidebarBtnStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  border: "none",
  color: "white",
  padding: "12px 16px",
  borderRadius: "8px",
  fontSize: "16px",
  cursor: "pointer",
  textAlign: "left",
  transition: "all 0.2s ease",
  borderLeft: "4px solid transparent",
};

/* ===== PAGE COMPONENTS ===== */
function Home({ user }) {
  return (
    <>
      <h1>Welcome, {user?.name}!</h1>
      <p>Your email: {user?.email}</p>
    </>
  );
}

function UserProfile({ user }) {
  return (
    <>
      <h1>User Profile</h1>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
    </>
  );
}

function Wallet() {
  return <h1>Wallet (Coming Soon)</h1>;
}

function Shop() {
  return <h1>Shop (Coming Soon)</h1>;
}

/* ======== CART PAGE ======== */
function Cart({ onCheckout }) {
  return (
    <>
      <h1>Your Cart</h1>
      <p>You currently have 3 items in your cart.</p>

      <button
        style={{
          marginTop: "20px",
          padding: "12px 20px",
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
        }}
        onClick={onCheckout}
      >
        Proceed to Checkout →
      </button>
    </>
  );
}

/* ======== CHECKOUT PAGE ======== */
function Checkout({ onBack }) {
  return (
    <>
      {/* Go Back Button */}
      <button
        onClick={onBack}
        style={{
          padding: "8px 14px",
          background: "#374151",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          position: "absolute",
          top: "20px",
          left: "260px",
        }}
        onMouseEnter={(e) => (e.target.style.background = "#4b5563")}
        onMouseLeave={(e) => (e.target.style.background = "#374151")}
      >
        ← Back to Cart
      </button>

      <h1 style={{ marginTop: "80px" }}>Checkout</h1>
      <p>Confirm your order and complete the purchase.</p>

      <button
        style={{
          padding: "12px 20px",
          background: "green",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Pay Now
      </button>
    </>
  );
}
