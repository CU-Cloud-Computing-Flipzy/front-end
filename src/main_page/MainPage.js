import React, { useState, useEffect } from "react";

/* =========================================
   MOCK DATA (Initial State)
   ========================================= */
const MOCK_USER = {
  name: "Alex Doe",
  email: "alex@example.com",
  picture: "https://i.pravatar.cc/150?img=11",
  balance: "$4,250.00",
};

const INITIAL_PRODUCTS = [
  { id: 1, name: "Neon Cyber-Headset", price: 120, color: "#8b5cf6", category: "Audio", type: "Real" },
  { id: 2, name: "Ergo-Mechanical Key", price: 250, color: "#ec4899", category: "Peripherals", type: "Real" },
  { id: 3, name: "4K Ultra Monitor", price: 400, color: "#3b82f6", category: "Displays", type: "Real" },
  { id: 4, name: "Holographic Mouse", price: 85, color: "#10b981", category: "Peripherals", type: "Virtual" },
  { id: 5, name: "Bass-Pro Speaker", price: 180, color: "#f59e0b", category: "Audio", type: "Real" },
  { id: 6, name: "Gold Game Skin", price: 25, color: "#eab308", category: "Gaming", type: "Virtual" },
  { id: 7, name: "Cloud Storage 10TB", price: 15, color: "#06b6d4", category: "Services", type: "Virtual" },
];

/* =========================================
   MAIN COMPONENT
   ========================================= */
export default function MainPage() {
  const [user, setUser] = useState(MOCK_USER);
  const [activePage, setActivePage] = useState("home");
  const [selectedItem, setSelectedItem] = useState(null);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orderHistory, setOrderHistory] = useState([
    { id: 99, name: "Vintage Gamepad", price: 45, color: "#64748b", date: "2023-10-15", type: "Real" }
  ]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user"));
      if (stored) setUser(stored);
    } catch (e) {
      console.log("No user found, using mock.");
    }
  }, []);

  // --- ACTIONS ---

  const handleBuyNow = (product) => {
    setSelectedItem(product);
    setActivePage("checkout");
  };

  const handleConfirmPayment = () => {
    const newOrder = {
      ...selectedItem,
      date: new Date().toLocaleDateString(),
      id: Math.random()
    };
    setOrderHistory([newOrder, ...orderHistory]);
    setSelectedItem(null);
    setActivePage("orders");
  };

  const handlePostProduct = (newProductData) => {
    const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#f43f5e"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const productToAdd = {
      id: Math.random(),
      name: newProductData.name,
      price: parseFloat(newProductData.price),
      category: newProductData.category, // This will now accept custom strings
      type: newProductData.type, 
      color: randomColor,
    };

    setProducts([productToAdd, ...products]);
    setActivePage("shop");
  };

  const handleLogout = () => {
    const confirm = window.confirm("Are you sure you want to log out?");
    if (confirm) {
        localStorage.removeItem("user");
        window.location.href = "/"; 
    }
  };

  return (
    <div style={styles.appContainer}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; margin: 0; }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.4s ease-out forwards; }

        .hover-card { transition: all 0.3s ease; }
        .hover-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
        
        .sidebar-btn:hover { background: rgba(255, 255, 255, 0.1); transform: translateX(5px); }
        .filter-btn { transition: all 0.2s; }
        .filter-btn:hover { transform: translateY(-2px); }
      `}</style>

      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.profileSection}>
          <img src={user.picture} alt="Profile" style={styles.avatar} />
          <div style={{ marginLeft: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "16px" }}>{user.name}</h3>
            <span style={{ fontSize: "12px", opacity: 0.7, display: "block" }}>
              Standard Member
            </span>
          </div>
        </div>

        <nav style={styles.nav}>
          <SidebarButton active={activePage === "home"} onClick={() => setActivePage("home")} icon="🏠">
            Dashboard
          </SidebarButton>
          <SidebarButton active={activePage === "profile"} onClick={() => setActivePage("profile")} icon="👤">
            Profile
          </SidebarButton>
          <SidebarButton active={activePage === "shop"} onClick={() => setActivePage("shop")} icon="🛍️">
            Shop
          </SidebarButton>
          <SidebarButton active={activePage === "orders"} onClick={() => setActivePage("orders")} icon="📦">
            Orders
          </SidebarButton>
          
          <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
             <SidebarButton active={activePage === "post"} onClick={() => setActivePage("post")} icon="➕">
               Sell Item
             </SidebarButton>
          </div>
        </nav>

        <div style={styles.logoutSection}>
          <SidebarButton onClick={handleLogout} icon="🚪">
            Logout
          </SidebarButton>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={styles.main}>
        <Header title={
            activePage === "post" ? "Sell a Product" : 
            activePage === "orders" ? "Order History" : 
            activePage.charAt(0).toUpperCase() + activePage.slice(1)
        } />
        
        <div className="fade-in" key={activePage} style={{ width: "100%" }}>
          {activePage === "home" && <Home user={user} />}
          {activePage === "profile" && <UserProfile user={user} />}
          {activePage === "shop" && <Shop products={products} onBuy={handleBuyNow} />}
          {activePage === "orders" && <OrderHistory history={orderHistory} />}
          {activePage === "post" && <PostProduct onPost={handlePostProduct} />}
          {activePage === "checkout" && (
            <Checkout item={selectedItem} onBack={() => setActivePage("shop")} onConfirm={handleConfirmPayment} />
          )}
        </div>
      </main>
    </div>
  );
}

/* =========================================
   REUSABLE UI COMPONENTS
   ========================================= */

const Header = ({ title }) => (
  <div style={styles.header}>
    <h2 style={styles.pageTitle}>{title}</h2>
    <div style={styles.headerActions}>
      <button style={styles.iconButton}>🔔</button>
    </div>
  </div>
);

const SidebarButton = ({ children, onClick, active, icon }) => (
  <button
    className="sidebar-btn"
    onClick={onClick}
    style={{
      ...styles.sidebarBtn,
      background: active ? "linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0) 100%)" : "transparent",
      borderLeft: active ? "4px solid #60a5fa" : "4px solid transparent",
      color: active ? "#60a5fa" : "#9ca3af",
    }}
  >
    <span style={{ marginRight: "12px" }}>{icon}</span>
    {children}
  </button>
);

const Card = ({ children, style }) => (
  <div className="hover-card" style={{ ...styles.card, ...style }}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", style, type = "button" }) => (
  <button
    onClick={onClick}
    type={type}
    style={{
      ...styles.button,
      ...(variant === "primary" ? styles.btnPrimary : styles.btnSecondary),
      ...style,
    }}
  >
    {children}
  </button>
);

/* =========================================
   PAGE COMPONENTS
   ========================================= */

function Home({ user }) {
  return (
    <div style={styles.gridContainer}>
      <div style={{ ...styles.banner, gridColumn: "1 / -1" }}>
        <h1 style={{ margin: 0 }}>Welcome back, {user.name}! 👋</h1>
        <p style={{ opacity: 0.9, marginTop: "5px" }}>
          Here is what's happening with your account today.
        </p>
      </div>
      <Card>
        <h4 style={styles.cardTitle}>Total Balance</h4>
        <p style={styles.bigNumber}>{user.balance || "$0.00"}</p>
      </Card>
      <Card>
        <h4 style={styles.cardTitle}>Loyalty Points</h4>
        <p style={styles.bigNumber}>850</p>
      </Card>
    </div>
  );
}

function UserProfile({ user }) {
  return (
    <div style={{ maxWidth: "600px" }}>
      <Card style={{ textAlign: "center", padding: "40px" }}>
        <img src={user.picture} alt="Profile" style={{ ...styles.avatar, width: "100px", height: "100px", margin: "0 auto 20px" }} />
        <h2 style={{ margin: 0 }}>{user.name}</h2>
        <p style={{ color: "#6b7280" }}>{user.email}</p>
        <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
          <Button>Edit Profile</Button>
          <Button variant="secondary">Change Password</Button>
        </div>
      </Card>
    </div>
  );
}

/* UPDATED POST PRODUCT: Toggle for Custom Category */
function PostProduct({ onPost }) {
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  
  const [formData, setFormData] = useState({ 
    name: "", 
    price: "", 
    category: "Peripherals",
    type: "Real"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) return alert("Please fill in all fields");
    onPost(formData);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Card style={{ padding: "30px" }}>
            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Add New Item</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "15px" }}>
                    <label style={styles.label}>Product Name</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Quantum Keyboard" 
                        style={styles.input}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                
                {/* Category & Type Selection */}
                <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                    
                    {/* Dynamic Category Input */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={styles.label}>Category</label>
                            {/* Toggle Button */}
                            <span 
                                onClick={() => {
                                    setIsCustomCategory(!isCustomCategory);
                                    // Reset category to empty if switching to custom, or default if switching back
                                    setFormData({
                                        ...formData, 
                                        category: !isCustomCategory ? "" : "Peripherals"
                                    });
                                }}
                                style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', marginBottom: '6px', textDecoration: 'underline' }}
                            >
                                {isCustomCategory ? "Select from list" : "Add new +"}
                            </span>
                        </div>
                        
                        {isCustomCategory ? (
                             <input 
                                type="text" 
                                placeholder="Enter custom category..." 
                                style={styles.input}
                                autoFocus
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                             />
                        ) : (
                            <select 
                                style={styles.input}
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="Peripherals">Peripherals</option>
                                <option value="Audio">Audio</option>
                                <option value="Displays">Displays</option>
                                <option value="Gaming">Gaming</option>
                                <option value="Services">Services</option>
                            </select>
                        )}
                    </div>

                    <div style={{ flex: 1 }}>
                        <label style={styles.label}>Type</label>
                        <select 
                            style={styles.input}
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="Real">Real Good</option>
                            <option value="Virtual">Virtual Good</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: "25px" }}>
                    <label style={styles.label}>Price ($)</label>
                    <input 
                        type="number" 
                        placeholder="0.00" 
                        style={styles.input}
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                </div>

                <Button type="submit" style={{ width: "100%", height: "45px" }}>
                    Post to Shop
                </Button>
            </form>
        </Card>
    </div>
  );
}

function Shop({ products, onBuy }) {
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [shopType, setShopType] = React.useState("Real"); 
  
  const typeProducts = products.filter(p => p.type === shopType);
  const categories = ["All", ...new Set(typeProducts.map(p => p.category))];
  
  const filteredProducts = typeProducts.filter(p => 
    activeCategory === "All" ? true : p.category === activeCategory
  );

  return (
    <div>
      <div style={styles.segmentedControl}>
         <button 
           onClick={() => { setShopType("Real"); setActiveCategory("All"); }}
           style={shopType === "Real" ? styles.segmentActive : styles.segmentInactive}
         >
           Real Goods
         </button>
         <button 
           onClick={() => { setShopType("Virtual"); setActiveCategory("All"); }}
           style={shopType === "Virtual" ? styles.segmentActive : styles.segmentInactive}
         >
           Virtual Goods
         </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "25px", overflowX: "auto", paddingBottom: "5px" }}>
        {categories.map(cat => (
          <button
            key={cat}
            className="filter-btn"
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              background: activeCategory === cat ? "#3b82f6" : "white",
              color: activeCategory === cat ? "white" : "#6b7280",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={styles.gridContainer}>
        {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#6b7280" }}>
                No items found in {shopType} category.
            </div>
        ) : (
            filteredProducts.map((p) => (
            <Card key={p.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ height: "140px", background: p.color, borderRadius: "8px", marginBottom: "15px", display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.2)', fontSize: '24px', fontWeight: 'bold' }}>
                {p.category.substring(0,2).toUpperCase()}
                </div>
                <div>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <div style={styles.badgeLabel}>{p.category}</div>
                    <div style={{ ...styles.badgeLabel, background: p.type === 'Real' ? '#dcfce7' : '#f3e8ff', color: p.type === 'Real' ? '#15803d' : '#7e22ce' }}>
                        {p.type}
                    </div>
                </div>
                <h3 style={{ margin: "5px 0 5px 0" }}>{p.name}</h3>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>Premium item.</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
                <span style={{ fontWeight: "bold", fontSize: "18px" }}>${p.price}</span>
                <Button onClick={() => onBuy(p)} style={{ padding: "8px 16px", fontSize: "14px", background: "#10b981" }}>
                    Buy Now
                </Button>
                </div>
            </Card>
            ))
        )}
      </div>
    </div>
  );
}

function OrderHistory({ history }) {
  return (
    <div style={{ maxWidth: "800px" }}>
      {history.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "40px" }}>
            <h3>No orders yet!</h3>
            <p>Go to the shop to buy your first item.</p>
        </Card>
      ) : (
        history.map((order, index) => (
            <Card key={index} style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "10px", background: order.color }}></div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 4px 0" }}>{order.name}</h4>
                    <span style={{ fontSize: "12px", color: "#6b7280", background: "#f3f4f6", padding: "4px 8px", borderRadius: "6px" }}>
                        {order.type} Order Delivered
                    </span>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "bold" }}>${order.price}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>{order.date}</div>
                </div>
            </Card>
        ))
      )}
    </div>
  );
}

function Checkout({ item, onBack, onConfirm }) {
  if (!item) return <div>Error: No item selected. <button onClick={onBack}>Go Back</button></div>;
  const tax = item.price * 0.08;
  const total = item.price + tax;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
      <div>
        <button onClick={onBack} style={styles.backLink}>← Back to Shop</button>
        <Card style={{ marginTop: "20px", padding: "30px" }}>
          <h2 style={{ marginBottom: "20px" }}>Payment Details</h2>
          <div style={{ marginBottom: "15px" }}>
              <label style={styles.label}>Card Number</label>
              <input type="text" defaultValue="4242 4242 4242 4242" style={styles.input} />
          </div>
          <div style={{ display: "flex", gap: "15px", marginBottom: "25px" }}>
              <div style={{ flex: 1 }}>
                  <label style={styles.label}>Expiry</label>
                  <input type="text" defaultValue="12/25" style={styles.input} />
              </div>
              <div style={{ flex: 1 }}>
                  <label style={styles.label}>CVC</label>
                  <input type="text" defaultValue="123" style={styles.input} />
              </div>
          </div>
          <Button onClick={onConfirm} style={{ width: "100%", height: "50px", fontSize: "16px" }}>Confirm Payment</Button>
        </Card>
      </div>
      <div>
        <div style={{ marginTop: "36px" }}></div>
        <Card>
          <h3 style={{ marginTop: 0 }}>Order Summary</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #eee" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "8px", background: item.color }}></div>
            <div>
              <h4 style={{ margin: 0 }}>{item.name}</h4>
              <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>Category: {item.category}</p>
            </div>
            <span style={{ marginLeft: "auto", fontWeight: "600" }}>${item.price}</span>
          </div>
          <div style={styles.summaryRow}><span>Subtotal</span> <span>${item.price.toFixed(2)}</span></div>
          <div style={styles.summaryRow}><span>Tax (8%)</span> <span>${tax.toFixed(2)}</span></div>
          <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "15px 0" }} />
          <div style={{ ...styles.summaryRow, fontSize: "18px", fontWeight: "bold", color: "#2563eb" }}>
            <span>Total to Pay</span> <span>${total.toFixed(2)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* =========================================
   STYLES OBJECTS
   ========================================= */
const styles = {
  appContainer: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    background: "#f3f4f6",
    backgroundImage: "radial-gradient(circle at 50% 0%, #e0e7ff 0%, #f3f4f6 70%)", 
    color: "#1f2937",
    overflow: "hidden",
  },
  sidebar: {
    width: "260px",
    background: "#111827",
    color: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    padding: "24px",
    boxShadow: "4px 0 10px rgba(0,0,0,0.1)",
    zIndex: 10,
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    paddingBottom: "24px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    marginBottom: "24px",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    objectFit: "cover",
    border: "2px solid rgba(255,255,255,0.2)",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  sidebarBtn: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "12px 16px",
    border: "none",
    background: "transparent",
    color: "#9ca3af",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    textAlign: "left",
    fontFamily: "inherit",
  },
  main: {
    flex: 1,
    padding: "40px",
    overflowY: "auto",
    position: "relative",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "700",
    margin: 0,
    color: "#111827",
  },
  headerActions: { display: "flex", gap: "12px" },
  iconButton: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
    border: "1px solid rgba(0,0,0,0.02)",
  },
  banner: {
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    borderRadius: "16px",
    padding: "32px",
    color: "white",
    boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)",
  },
  cardTitle: {
    color: "#6b7280",
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: "0 0 8px 0",
  },
  bigNumber: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  button: {
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  btnPrimary: {
    background: "#2563eb",
    color: "white",
    boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)",
  },
  btnSecondary: {
    background: "white",
    border: "1px solid #d1d5db",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s",
    background: "white",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#4b5563",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  backLink: {
    background: "none",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    fontSize: "14px",
    padding: 0,
    marginBottom: "10px",
    display: 'block',
  },
  badgeLabel: {
    fontSize: "10px",
    textTransform: "uppercase",
    fontWeight: "bold",
    color: "#6366f1",
    background: "#e0e7ff",
    padding: "2px 6px",
    borderRadius: "4px",
    display: "inline-block",
    marginBottom: "4px"
  },
  segmentedControl: {
      display: "inline-flex",
      background: "#e5e7eb",
      borderRadius: "12px",
      padding: "4px",
      marginBottom: "24px"
  },
  segmentActive: {
      background: "white",
      color: "#111827",
      border: "none",
      borderRadius: "8px",
      padding: "8px 20px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      transition: "all 0.2s"
  },
  segmentInactive: {
      background: "transparent",
      color: "#6b7280",
      border: "none",
      padding: "8px 20px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s"
  }
};