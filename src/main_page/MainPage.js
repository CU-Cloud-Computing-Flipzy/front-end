import React, { useState, useEffect } from "react";

const API_BASE_URL = "https://composite-service-425935075553.us-central1.run.app";

const CATEGORY_MAP = {
  "Peripherals_Real":    "550e8400-e29b-41d4-a716-446655440001",
  "Peripherals_Virtual": "550e8400-e29b-41d4-a716-446655440002",
  "Audio_Real":          "550e8400-e29b-41d4-a716-446655440003",
  "Audio_Virtual":       "550e8400-e29b-41d4-a716-446655440004",
  "Displays_Real":       "550e8400-e29b-41d4-a716-446655440005",
  "Displays_Virtual":    "550e8400-e29b-41d4-a716-446655440006",
  "Gaming_Real":         "550e8400-e29b-41d4-a716-446655440007",
  "Gaming_Virtual":      "550e8400-e29b-41d4-a716-446655440008",
  "Services_Real":       "550e8400-e29b-41d4-a716-446655440009",
  "Services_Virtual":    "550e8400-e29b-41d4-a716-446655440010"
};

const MOCK_USER = {
  id: "", 
  name: "Guest",
  email: "",
  picture: "https://i.pravatar.cc/150?img=11",
  balance: "$0.00",
  role: "guest",
  jwt: "",
  phone: "",
  address: {}
};

export default function MainPage() {
  const [user, setUser] = useState(MOCK_USER);
  const [activePage, setActivePage] = useState("home");
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderHistory, setOrderHistory] = useState([]);
  const [editItemData, setEditItemData] = useState(null); 

  const refreshUser = async (token) => {
    try {
        const profileRes = await fetch(`${API_BASE_URL}/composite/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (profileRes.ok) {
          const backendUser = await profileRes.json();
          let realBalance = "$0.00";
          
          try {
            const walletRes = await fetch(`${API_BASE_URL}/composite/wallet`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (walletRes.ok) {
              const walletData = await walletRes.json();
              realBalance = `$${parseFloat(walletData.balance).toFixed(2)}`;
            }
          } catch (err) { console.error(err); }

          const verifiedUser = {
            id: backendUser.id,
            name: backendUser.full_name || backendUser.username,
            email: backendUser.email,
            picture: backendUser.avatar_url || "https://i.pravatar.cc/150?img=11",
            role: backendUser.role,
            balance: realBalance,
            numericBalance: parseFloat(realBalance.replace('$', '')),
            jwt: token,
            phone: backendUser.phone || "",
            address: backendUser.address || {} 
          };

          setUser(verifiedUser);
          localStorage.setItem("user", JSON.stringify(verifiedUser));
          return verifiedUser;
        }
    } catch (e) { console.error(e); }
    return null;
  };

  useEffect(() => {
    const init = async () => {
        const storedString = localStorage.getItem("user");
        if (storedString) {
            const stored = JSON.parse(storedString);
            if (stored.jwt) await refreshUser(stored.jwt);
        } else {
            setUser(MOCK_USER);
        }
    };
    init();
  }, []);

  const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/composite/items`);
        if (response.ok) {
          const data = await response.json();
          const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#f43f5e"];
          
          const mappedProducts = data.map((item, index) => {
             const catName = item.category ? item.category.name : "";
             const type = catName.includes("Virtual") ? "Virtual" : "Real";
             const catSlug = catName.split('_')[0] || "Uncategorized";

             return {
                ...item,
                type: type, 
                color: colors[index % colors.length],
                category: catSlug, 
                price: parseFloat(item.price),
                imageUrl: item.media && item.media.length > 0 ? item.media[0].url : null, 
                seller_id: item.owner_user_id 
             };
          });
          setProducts(mappedProducts);
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  // --- UPDATED HISTORY FETCHING (BUYER + SELLER) ---
  useEffect(() => {
    if (activePage === "orders" && user.jwt) {
      const fetchHistory = async () => {
        try {
          // Fetch both lists simultaneously
          const [buyerRes, sellerRes] = await Promise.all([
            fetch(`${API_BASE_URL}/composite/my-transactions?buyer_id=${user.id}`, {
                headers: { "Authorization": `Bearer ${user.jwt}` }
            }),
            fetch(`${API_BASE_URL}/composite/my-transactions?seller_id=${user.id}`, {
                headers: { "Authorization": `Bearer ${user.jwt}` }
            })
          ]);

          let combinedData = [];

          if (buyerRes.ok) {
             const buyerData = await buyerRes.json();
             combinedData = [...combinedData, ...buyerData];
          }

          if (sellerRes.ok) {
             const sellerData = await sellerRes.json();
             // Avoid duplicates
             const existingIds = new Set(combinedData.map(item => item.id));
             const uniqueSellerData = sellerData.filter(item => !existingIds.has(item.id));
             combinedData = [...combinedData, ...uniqueSellerData];
          }

          const mappedHistory = combinedData.map(tx => ({
            id: tx.id,
            name: tx.title_snapshot,
            price: tx.price_snapshot,
            type: tx.order_type,
            date: new Date(tx.created_at).toLocaleDateString(),
            status: tx.status,
            color: "#e5e7eb",
            buyerId: tx.buyer_id || (tx.buyer ? tx.buyer.id : null),
            sellerId: tx.seller_id || (tx.seller ? tx.seller.id : null)
          }));

          mappedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

          setOrderHistory(mappedHistory);

        } catch (e) { console.error("History Fetch Error:", e); }
      };
      fetchHistory();
    }
  }, [activePage, user.jwt, user.id]);

  const deleteItemAfterPurchase = async (itemId) => {
    setProducts(prev => prev.filter(p => p.id !== itemId));
  };

  const createPendingTransaction = async (product) => {
    if (!product || !user.id) return null;
    const orderType = product.type === "Virtual" ? "VIRTUAL" : "REAL";

    const payload = {
        buyer_id: user.id,
        seller_id: product.seller_id,
        item_id: product.id,
        order_type: orderType,
        title_snapshot: product.name,     
        price_snapshot: String(product.price)    
    };

    const res = await fetch(`${API_BASE_URL}/composite/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.jwt}` },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        throw new Error("Failed to create transaction record.");
    }
    return await res.json(); 
  };

  const finalizeTransaction = async (transactionId) => {
      const res = await fetch(`${API_BASE_URL}/composite/transactions/${transactionId}/checkout`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${user.jwt}` }
      });

      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Payment failed");
      }
      return await res.json();
  };

  const handleBuyNow = async (product) => {
      if (!user.jwt) return alert("Please log in first.");

      if (product.seller_id === user.id) {
          alert("You cannot buy your own item.");
          return;
      }

      try {
        if (product.type === "Virtual") {
            const confirmVirtual = window.confirm(`Instant Buy: ${product.name} for $${product.price}?`);
            if (!confirmVirtual) return;

            await createPendingTransaction(product);

            deleteItemAfterPurchase(product.id);

            alert("Buy successfully");
            
            await refreshUser(user.jwt);
            setActivePage("orders");
        } else {
            const tx = await createPendingTransaction(product);
            
            setCurrentTransaction({
                ...tx,
                productImage: product.imageUrl,
                productColor: product.color
            });
            setActivePage("checkout");
        }

      } catch (e) {
          console.error(e);
          let msg = e.message || "Transaction failed";
          
          if (msg.includes("400")) {
              alert("Purchase Failed: Insufficient funds or invalid state.");
          } else {
              alert(`Error: ${msg}`);
          }
      }
  };

  const handleConfirmCheckout = async () => {
      if (!currentTransaction) return;
      
      try {
          await finalizeTransaction(currentTransaction.id);
          
          alert("Payment Successful! Item will be shipped.");
          
          if (currentTransaction.item && currentTransaction.item.id) {
             deleteItemAfterPurchase(currentTransaction.item.id);
          }

          await refreshUser(user.jwt);
          setCurrentTransaction(null);
          setActivePage("orders");
      } catch (e) {
          console.error(e);
          alert(`Checkout Failed: ${e.message}`);
      }
  };

  const handlePostProduct = async (productData) => {
    const isEdit = !!editItemData;
    const url = isEdit 
        ? `${API_BASE_URL}/composite/items/${editItemData.id}` 
        : `${API_BASE_URL}/composite/items/create`;
    
    const method = isEdit ? "PATCH" : "POST";
    const compositeKey = `${productData.category}_${productData.type}`;
    const targetCategoryId = CATEGORY_MAP[compositeKey]; 

    if (!targetCategoryId) { return alert(`Invalid category/type combination.`); }

    let body;
    let headers = { "Authorization": `Bearer ${user.jwt}` };

    if (isEdit) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({
            name: productData.name,
            price: parseFloat(productData.price),
            status: "active",
            condition: "new",
            category_id: targetCategoryId
        });
    } else {
        const form = new FormData();
        form.append("seller_id", user.id); 
        form.append("name", productData.name); 
        form.append("price", productData.price); 
        form.append("description", "No description provided"); 
        form.append("status", "active"); 
        form.append("condition", "new"); 
        form.append("category_id", targetCategoryId); 
        if (productData.imageFile) form.append("file", productData.imageFile);
        body = form;
    }

    try {
      const res = await fetch(url, { method, headers, body });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${JSON.stringify(err)}`);
        return;
      }
      
      alert(isEdit ? "Item updated!" : "Item posted!");
      setEditItemData(null); 
      fetchItems(); 
      setActivePage("shop");

    } catch (e) {
      console.error(e);
      alert("Network error.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    const endpoint = user.role === 'admin' 
        ? `/admin/items/${itemId}` 
        : `/composite/items/${itemId}`;

    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${user.jwt}` }
        });

        if (res.ok) {
            alert("Item deleted.");
            setProducts(products.filter(p => p.id !== itemId));
        } else {
            alert("Failed to delete item.");
        }
    } catch (e) {
        console.error(e);
        alert("Network error.");
    }
  };

  const handleEditClick = (item) => {
      setEditItemData(item);
      setActivePage("post"); 
  };

  const handleUpdateProfile = async (profileData) => {
    try {
        const res = await fetch(`${API_BASE_URL}/composite/profile`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.jwt}` 
            },
            body: JSON.stringify(profileData)
        });

        if (res.ok) {
            alert("Profile updated!");
            refreshUser(user.jwt);
        } else {
            const err = await res.json();
            alert(`Failed: ${err.detail}`);
        }
    } catch (e) {
        console.error(e);
        alert("Network Error");
    }
  };


const handleLogout = () => {
  if (!window.confirm("Log out?")) return;

  localStorage.clear();
  setUser(MOCK_USER);

  window.location.replace(
    "https://storage.googleapis.com/flipzy-frontend/index.html"
  );
};

  const isAdmin = user.role === "admin";

  return (
    <div style={styles.appContainer}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; margin: 0; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .hover-card { transition: all 0.3s ease; }
        .hover-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
        .sidebar-btn:hover { background: rgba(255, 255, 255, 0.1); transform: translateX(5px); }
        .filter-btn { transition: all 0.2s; }
        .filter-btn:hover { transform: translateY(-2px); }
      `}</style>

      <aside style={styles.sidebar}>
        <div style={styles.profileSection}>
          <img src={user.picture} alt="Profile" style={styles.avatar} />
          <div style={{ marginLeft: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "16px" }}>{user.name}</h3>
            <span style={{ fontSize: "12px", opacity: 0.7, display: "block" }}>
              {isAdmin ? "Administrator" : "Standard Member"}
            </span>
          </div>
        </div>
        
        <nav style={styles.nav}>
          {!isAdmin && <SidebarButton active={activePage === "home"} onClick={() => setActivePage("home")} icon="🏠">Dashboard</SidebarButton>}
          <SidebarButton active={activePage === "profile"} onClick={() => setActivePage("profile")} icon="👤">Profile</SidebarButton>
          <SidebarButton active={activePage === "shop"} onClick={() => { setEditItemData(null); setActivePage("shop"); }} icon="🛍️">Shop</SidebarButton>
          {!isAdmin && <SidebarButton active={activePage === "orders"} onClick={() => setActivePage("orders")} icon="📦">Orders</SidebarButton>}
          {!isAdmin && (
            <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
               <SidebarButton active={activePage === "post"} onClick={() => { setEditItemData(null); setActivePage("post"); }} icon="➕">Sell Item</SidebarButton>
            </div>
          )}
        </nav>

        <div style={styles.logoutSection}>
          <SidebarButton onClick={handleLogout} icon="🚪">Logout</SidebarButton>
        </div>
      </aside>

      <main style={styles.main}>
        <Header title={
            activePage === "post" ? (editItemData ? "Edit Item" : "Sell a Product") : 
            activePage === "orders" ? "Transaction History" : 
            activePage.charAt(0).toUpperCase() + activePage.slice(1)
        } />
        
        {loading && activePage === "shop" ? (
             <div style={{padding: "20px", textAlign:"center", color: "#6b7280"}}>Loading items from server...</div>
        ) : (
            <div className="fade-in" key={activePage} style={{ width: "100%" }}>
              {activePage === "home" && !isAdmin && <Home user={user} setUser={setUser} />}
              {activePage === "profile" && <UserProfile user={user} onUpdate={handleUpdateProfile} />}
              {activePage === "shop" && (
                  <Shop 
                    products={products} 
                    user={user}
                    onBuy={handleBuyNow} 
                    onDelete={handleDeleteItem}
                    onEdit={handleEditClick}
                  />
              )}
              {activePage === "orders" && !isAdmin && <OrderHistory history={orderHistory} currentUserId={user.id} />}
              {activePage === "post" && !isAdmin && <PostProduct onPost={handlePostProduct} editData={editItemData} />}
              {activePage === "checkout" && (
                <Checkout 
                    transaction={currentTransaction} 
                    user={user}
                    onBack={() => {
                        setCurrentTransaction(null);
                        setActivePage("shop");
                    }} 
                    onConfirm={handleConfirmCheckout} 
                />
              )}
            </div>
        )}
      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

const Header = ({ title }) => (
  <div style={styles.header}>
    <h2 style={styles.pageTitle}>{title}</h2>
  </div>
);

const SidebarButton = ({ children, onClick, active, icon, style }) => (
  <button
    className="sidebar-btn"
    type="button" 
    onClick={(e) => {
        if (onClick) onClick(e);
    }}
    style={{
      ...styles.sidebarBtn,
      background: active ? "linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0) 100%)" : "transparent",
      borderLeft: active ? "4px solid #60a5fa" : "4px solid transparent",
      color: active ? "#60a5fa" : "#9ca3af",
      ...style
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

const Button = ({ children, onClick, variant = "primary", style, type = "button", disabled }) => (
  <button
    onClick={onClick}
    type={type}
    disabled={disabled}
    style={{
      ...styles.button,
      ...(variant === "primary" ? styles.btnPrimary : styles.btnSecondary),
      ...style,
    }}
  >
    {children}
  </button>
);

function Home({ user, setUser }) {
  const [isDepositing, setIsDepositing] = useState(false);

  const handleAddMoney = async () => {
    const input = window.prompt("Enter amount to deposit ($):", "1000");
    if (input === null) return; 
    const amount = parseFloat(input);
    if (isNaN(amount) || amount <= 0) return alert("Invalid amount.");

    setIsDepositing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/composite/wallet/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.jwt}` },
        body: JSON.stringify({ amount: amount })
      });

      if (res.ok) {
        const data = await res.json();
        const newBalance = `$${parseFloat(data.balance).toFixed(2)}`;
        const updatedUser = { ...user, balance: newBalance };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        alert(`Success! Added $${amount} to your wallet.`);
      } else {
        alert("Deposit failed.");
      }
    } catch (e) { console.error(e); alert("Network error."); } 
    finally { setIsDepositing(false); }
  };

  return (
    <div style={styles.gridContainer}>
      <div style={{ ...styles.banner, gridColumn: "1 / -1" }}>
        <h1 style={{ margin: 0 }}>Welcome back, {user.name}! 👋</h1>
        <p style={{ opacity: 0.9, marginTop: "5px" }}>Here is what's happening with your account today.</p>
      </div>
      <Card>
        <h4 style={styles.cardTitle}>Total Balance</h4>
        <p style={styles.bigNumber}>{user.balance || "$0.00"}</p>
        <button onClick={handleAddMoney} disabled={isDepositing} style={{ marginTop: "15px", padding: "10px 20px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: isDepositing ? "not-allowed" : "pointer", opacity: isDepositing ? 0.7 : 1, display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          {isDepositing ? "Processing..." : "💰 Deposit Money"}
        </button>
      </Card>
    </div>
  );
}

function UserProfile({ user, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ 
        phone: user.phone || "", 
        country: user.address?.country || "", 
        city: user.address?.city || "", 
        street: user.address?.street || "", 
        postal_code: user.address?.postal_code || "" 
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({ 
            phone: formData.phone,
            address: { 
                country: formData.country, 
                city: formData.city, 
                street: formData.street, 
                postal_code: formData.postal_code 
            }
        });
        setIsEditing(false);
    };

    return (
      <div style={{ maxWidth: "600px" }}>
        <Card style={{ textAlign: "center", padding: "40px" }}>
          <img src={user.picture} alt="Profile" style={{ ...styles.avatar, width: "100px", height: "100px", margin: "0 auto 20px" }} />
          <h2 style={{ margin: 0 }}>{user.name}</h2>
          <p style={{ color: "#6b7280" }}>{user.email}</p>
          <p style={{ color: "#9ca3af", fontSize: "14px" }}>{user.phone ? `Phone: ${user.phone}` : "No phone added"}</p>
          
          {!isEditing ? (
             <div style={{ marginTop: "20px" }}>
                <div style={{ textAlign: 'left', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#374151' }}>Shipping Address</h4>
                    {user.address && (user.address.street || user.address.city || user.address.country) ? (
                        <div style={{ color: '#6b7280', fontSize: '14px', background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                            <p style={{ margin: '4px 0' }}>{user.address.street}</p>
                            <p style={{ margin: '4px 0' }}>{user.address.city}, {user.address.postal_code}</p>
                            <p style={{ margin: '4px 0', fontWeight: '500' }}>{user.address.country}</p>
                        </div>
                    ) : (
                        <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0, fontStyle: 'italic' }}>No address set.</p>
                    )}
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                </div>
             </div>
          ) : (
             <form onSubmit={handleSubmit} style={{ marginTop: "20px", textAlign: "left" }}>
                <div style={{ marginBottom: "10px" }}><label style={styles.label}>Phone</label><input style={styles.input} value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} required /></div>
                <div style={{ marginBottom: "10px" }}><label style={styles.label}>Country</label><input style={styles.input} value={formData.country} onChange={e=>setFormData({...formData, country: e.target.value})} required /></div>
                <div style={{ marginBottom: "10px" }}><label style={styles.label}>City</label><input style={styles.input} value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} required /></div>
                <div style={{ marginBottom: "10px" }}><label style={styles.label}>Street</label><input style={styles.input} value={formData.street} onChange={e=>setFormData({...formData, street: e.target.value})} required /></div>
                <div style={{ marginBottom: "10px" }}><label style={styles.label}>Zip Code</label><input style={styles.input} value={formData.postal_code} onChange={e=>setFormData({...formData, postal_code: e.target.value})} required /></div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <Button type="submit">Save</Button>
                    <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
             </form>
          )}
        </Card>
      </div>
    );
}

function PostProduct({ onPost, editData }) {
  const [formData, setFormData] = useState({ 
    name: editData ? editData.name : "", 
    price: editData ? editData.price : "", 
    category: editData ? editData.category : "Peripherals",
    type: editData ? editData.type : "Real",
    imageFile: null,    
    imagePreview: editData ? editData.imageUrl : null 
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setFormData({ ...formData, imageFile: file, imagePreview: reader.result }); };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return alert("Please fill in all fields");
    onPost(formData);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Card style={{ padding: "30px" }}>
            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>{editData ? "Edit Item" : "Add New Item"}</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "15px" }}>
                    <label style={styles.label}>Product Name</label>
                    <input type="text" placeholder="e.g. Quantum Keyboard" style={styles.input} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                    <div style={{ flex: 1 }}>
                        <label style={styles.label}>Category {editData && "(Cannot change)"}</label>
                        <select 
                            style={{ ...styles.input, backgroundColor: editData ? "#f3f4f6" : "white", cursor: editData ? 'not-allowed' : 'pointer' }}
                            value={formData.category} 
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            disabled={!!editData}
                        >
                            <option value="Peripherals">Peripherals</option>
                            <option value="Audio">Audio</option>
                            <option value="Displays">Displays</option>
                            <option value="Gaming">Gaming</option>
                            <option value="Services">Services</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={styles.label}>Type {editData && "(Cannot change)"}</label>
                        <select 
                            style={{ ...styles.input, backgroundColor: editData ? "#f3f4f6" : "white", cursor: editData ? 'not-allowed' : 'pointer' }}
                            value={formData.type} 
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            disabled={!!editData}
                        >
                            <option value="Real">Real Good</option>
                            <option value="Virtual">Virtual Good</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label style={styles.label}>Price ($)</label>
                    <input type="number" placeholder="0.00" style={styles.input} value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>

                {!editData && ( 
                    <div style={{ marginBottom: "25px" }}>
                        <label style={styles.label}>Product Image</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} style={{...styles.input, paddingTop: '8px'}} />
                        {formData.imagePreview && (
                            <div style={{ marginTop: '10px', width: '100%', height: '150px', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={formData.imagePreview} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                            </div>
                        )}
                    </div>
                )}

                <Button type="submit" style={{ width: "100%", height: "45px" }}>{editData ? "Update Item" : "Post to Shop"}</Button>
            </form>
        </Card>
    </div>
  );
}

function Shop({ products, user, onBuy, onDelete, onEdit }) {
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [shopType, setShopType] = React.useState("Real"); 
  
  const typeProducts = products.filter(p => p.type === shopType);
  const categories = ["All", ...new Set(typeProducts.map(p => p.category))];
  
  const filteredProducts = typeProducts.filter(p => 
    activeCategory === "All" ? true : p.category === activeCategory
  );

  const isAdmin = user.role === 'admin';

  return (
    <div>
      <div style={styles.segmentedControl}>
         <button onClick={() => { setShopType("Real"); setActiveCategory("All"); }} style={shopType === "Real" ? styles.segmentActive : styles.segmentInactive}>Real Goods</button>
         <button onClick={() => { setShopType("Virtual"); setActiveCategory("All"); }} style={shopType === "Virtual" ? styles.segmentActive : styles.segmentInactive}>Virtual Goods</button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "25px", overflowX: "auto", paddingBottom: "5px" }}>
        {categories.map(cat => (
          <button key={cat} className="filter-btn" onClick={() => setActiveCategory(cat)} style={{ padding: "8px 16px", borderRadius: "20px", border: "none", fontSize: "14px", fontWeight: "500", cursor: "pointer", background: activeCategory === cat ? "#3b82f6" : "white", color: activeCategory === cat ? "white" : "#6b7280", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>{cat}</button>
        ))}
      </div>

      <div style={styles.gridContainer}>
        {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#6b7280" }}>No items found.</div>
        ) : (
            filteredProducts.map((p) => {
                const isOwner = p.seller_id === user.id;
                const canDelete = isAdmin || isOwner;
                const canEdit = isOwner;

                return (
                    <Card key={p.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div style={{ position: 'relative', height: "140px", background: p.imageUrl ? "white" : (p.color || "#e5e7eb"), borderRadius: "8px", marginBottom: "15px", display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.2)', fontSize: '24px', fontWeight: 'bold', overflow: "hidden" }}>
                            {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                (p.category || "??").substring(0,2).toUpperCase()
                            )}
                            {canDelete && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                                    style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '50%', background: 'white', border: '1px solid #fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10, fontSize: '14px', fontWeight: 'bold', transition: 'all 0.2s' }}
                                    title="Delete Item"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <div style={styles.badgeLabel}>{p.category || "Uncategorized"}</div>
                                <div style={{ ...styles.badgeLabel, background: p.type === 'Real' ? '#dcfce7' : '#f3e8ff', color: p.type === 'Real' ? '#15803d' : '#7e22ce' }}>{p.type || "Item"}</div>
                            </div>
                            <h3 style={{ margin: "5px 0 5px 0" }}>{p.name || "Untitled"}</h3>
                            <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>Premium item.</p>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", gap: "10px" }}>
                            <span style={{ fontWeight: "bold", fontSize: "18px" }}>${(p.price || 0).toFixed(2)}</span>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {canEdit ? (
                                    <Button variant="secondary" onClick={() => onEdit(p)} style={{ padding: "8px 12px", fontSize: "12px" }}>Edit</Button>
                                ) : (
                                    !isAdmin && (
                                        <Button onClick={() => onBuy(p)} style={{ padding: "8px 16px", fontSize: "14px", background: "#10b981" }}>
                                            {p.type === "Virtual" ? "Instant Buy" : "Order"}
                                        </Button>
                                    )
                                )}
                            </div>
                        </div>
                    </Card>
                );
            })
        )}
      </div>
    </div>
  );
}

function OrderHistory({ history, currentUserId }) {
  const getStatusColor = (status) => {
      switch(status) {
          case "COMPLETED": return { bg: "#dcfce7", color: "#15803d", text: "COMPLETED" };
          case "PENDING": return { bg: "#fee2e2", color: "#b91c1c", text: "FAILED" };
          default: return { bg: "#fee2e2", color: "#b91c1c", text: "FAILED" };
      }
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      {history.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "40px" }}><h3>No transaction history found!</h3></Card>
      ) : (
        history.map((order, index) => {
            const statusStyle = getStatusColor(order.status);
            
            const isBuyer = order.buyerId === currentUserId;
            const isSeller = order.sellerId === currentUserId;
            
            let roleLabel = "Unknown";
            let roleStyle = { bg: "#e5e7eb", color: "#374151" }; 

            if (isBuyer) {
                roleLabel = "YOU BOUGHT";
                roleStyle = { bg: "#dbeafe", color: "#1e40af" }; 
            } else if (isSeller) {
                roleLabel = "YOU SOLD";
                roleStyle = { bg: "#f3e8ff", color: "#6b21a8" }; 
            }

            return (
                <Card key={index} style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "20px" }}>
                    <div style={{ width: "60px", height: "60px", borderRadius: "10px", background: order.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                        {isBuyer ? "🛍️" : "💰"}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                             <span style={{ fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px", backgroundColor: roleStyle.bg, color: roleStyle.color }}>
                                {roleLabel}
                             </span>
                             <h4 style={{ margin: 0 }}>{order.name}</h4>
                        </div>
                        <span style={{ fontSize: "12px", color: statusStyle.color, background: statusStyle.bg, padding: "4px 8px", borderRadius: "6px", fontWeight: "bold" }}>
                            {statusStyle.text}
                        </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "bold", color: isSeller ? "#15803d" : "#1f2937" }}>
                            {isSeller ? "+" : "-"}${parseFloat(order.price).toFixed(2)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#9ca3af" }}>{order.date}</div>
                    </div>
                </Card>
            );
        })
      )}
    </div>
  );
}

function Checkout({ transaction, user, onBack, onConfirm }) {
  if (!transaction) return <div>Error: No transaction found. <button onClick={onBack}>Back</button></div>;
  
  const price = parseFloat(transaction.price_snapshot);
  const tax = price * 0.08;
  const total = price + tax;
  const remaining = (user.numericBalance || 0) - total;
  const canAfford = remaining >= 0;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <button onClick={onBack} style={styles.backLink}>← Cancel Order</button>
        <Card style={{ marginTop: "20px", padding: "30px" }}>
          <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Confirm Purchase</h2>
          <div style={{ textAlign: "center", marginBottom: "15px", color: "#f59e0b", fontSize: "14px", background: "#fffbeb", padding: "10px", borderRadius: "8px" }}>
            ⚠ Transaction Created (Pending)
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #eee" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "8px", background: transaction.productColor || "#eee" }}>
                {transaction.productImage && <img src={transaction.productImage} style={{width:"100%", height:"100%", objectFit:"cover", borderRadius:"8px"}} />}
            </div>
            <div>
                <h4 style={{ margin: 0 }}>{transaction.title_snapshot}</h4>
                <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>ID: {transaction.id.slice(0,8)}...</p>
            </div>
            <span style={{ marginLeft: "auto", fontWeight: "600" }}>${price.toFixed(2)}</span>
          </div>

          <div style={styles.summaryRow}><span>Subtotal</span> <span>${price.toFixed(2)}</span></div>
          <div style={styles.summaryRow}><span>Tax (8%)</span> <span>${tax.toFixed(2)}</span></div>
          <div style={{ ...styles.summaryRow, fontSize: "18px", fontWeight: "bold", color: "#2563eb", marginTop: "10px" }}>
              <span>Total Cost</span> <span>${total.toFixed(2)}</span>
          </div>

          <div style={{ background: "#f9fafb", padding: "15px", borderRadius: "8px", marginTop: "20px" }}>
              <div style={styles.summaryRow}><span>Your Wallet Balance</span> <span>${(user.numericBalance || 0).toFixed(2)}</span></div>
              <div style={{ ...styles.summaryRow, fontWeight: "bold", color: canAfford ? "#10b981" : "#ef4444" }}>
                  <span>Remaining after purchase</span> 
                  <span>${remaining.toFixed(2)}</span>
              </div>
          </div>

          <Button 
            onClick={onConfirm} 
            style={{ width: "100%", height: "50px", fontSize: "16px", marginTop: "25px", opacity: canAfford ? 1 : 0.5, cursor: canAfford ? "pointer" : "not-allowed" }}
            disabled={!canAfford}
          >
            {canAfford ? "Complete Payment" : "Insufficient Funds"}
          </Button>
        </Card>
    </div>
  );
}

const styles = {
  appContainer: { display: "flex", height: "100vh", width: "100vw", background: "#f3f4f6", backgroundImage: "radial-gradient(circle at 50% 0%, #e0e7ff 0%, #f3f4f6 70%)", color: "#1f2937", overflow: "hidden" },
  sidebar: { width: "260px", background: "#111827", color: "#f9fafb", display: "flex", flexDirection: "column", padding: "24px", boxShadow: "4px 0 10px rgba(0,0,0,0.1)", zIndex: 10 },
  profileSection: { display: "flex", alignItems: "center", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: "24px" },
  avatar: { width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)" },
  nav: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  sidebarBtn: { display: "flex", alignItems: "center", width: "100%", padding: "12px 16px", border: "none", background: "transparent", color: "#9ca3af", fontSize: "15px", fontWeight: "500", cursor: "pointer", borderRadius: "8px", transition: "all 0.2s ease", textAlign: "left", fontFamily: "inherit" },
  main: { flex: 1, padding: "40px", overflowY: "auto", position: "relative" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" },
  pageTitle: { fontSize: "28px", fontWeight: "700", margin: 0, color: "#111827" },
  headerActions: { display: "flex", gap: "12px" },
  iconButton: { background: "white", border: "1px solid #e5e7eb", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
  gridContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" },
  card: { background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)", border: "1px solid rgba(0,0,0,0.02)" },
  banner: { background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", borderRadius: "16px", padding: "32px", color: "white", boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)" },
  cardTitle: { color: "#6b7280", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px 0" },
  bigNumber: { fontSize: "32px", fontWeight: "700", color: "#111827", margin: 0 },
  button: { border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" },
  btnPrimary: { background: "#2563eb", color: "white", boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)" },
  btnSecondary: { background: "white", border: "1px solid #d1d5db", color: "#374151" },
  input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box", outline: "none", transition: "border-color 0.2s", background: "white" },
  label: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#4b5563" },
  summaryRow: { display: "flex", justifyContent: "space-between", marginBottom: "10px" },
  backLink: { background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "14px", padding: 0, marginBottom: "10px", display: 'block' },
  badgeLabel: { fontSize: "10px", textTransform: "uppercase", fontWeight: "bold", color: "#6366f1", background: "#e0e7ff", padding: "2px 6px", borderRadius: "4px", display: "inline-block", marginBottom: "4px" },
  segmentedControl: { display: "inline-flex", background: "#e5e7eb", borderRadius: "12px", padding: "4px", marginBottom: "24px" },
  segmentActive: { background: "white", color: "#111827", border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "all 0.2s" },
  segmentInactive: { background: "transparent", color: "#6b7280", border: "none", padding: "8px 20px", fontSize: "14px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s" }
};
