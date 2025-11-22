import React, { useState, useEffect } from "react";

/**
 * UserFunctionPage
 * A React component to interact with the FastAPI User/Address microservice.
 * Includes User creation/listing and Address creation/listing capabilities.
 */
const UserFunctionPage = () => {
  // --- State Management ---

  // API Base URL
  const [apiUrl, setApiUrl] = useState("http://127.0.0.1:8000");

  // Data Lists
  const [users, setUsers] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // Selected User ID (for creating address)
  const [selectedUserId, setSelectedUserId] = useState("");

  // Logs
  const [logs, setLogs] = useState([]);

  // Form State - Create User
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone: "",
  });

  // Form State - Create Address
  const [addrForm, setAddrForm] = useState({
    country: "",
    city: "",
    street: "",
    postal_code: "",
  });

  // --- Utility Functions ---

  // Add Log
  const addLog = (msg, data = null) => {
    const time = new Date().toLocaleTimeString();
    const logEntry = `[${time}] ${msg} ${data ? JSON.stringify(data) : ""}`;
    setLogs((prev) => [logEntry, ...prev].slice(0, 50)); // Keep only last 50 logs
  };

  // Construct URL
  const getUrl = (path) => {
    const base = apiUrl.replace(/\/$/, ""); // Remove trailing slash
    return `${base}${path}`;
  };

  // --- API Interaction Logic ---

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch(getUrl("/users?limit=10"));
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setUsers(data);
      addLog("Successfully fetched user list");
    } catch (e) {
      addLog("Failed to fetch users: " + e.message);
    }
  };

  // Fetch Addresses
  const fetchAddresses = async () => {
    try {
      const res = await fetch(getUrl("/addresses?limit=10"));
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setAddresses(data);
      addLog("Successfully fetched address list");
    } catch (e) {
      addLog("Failed to fetch addresses: " + e.message);
    }
  };

  // Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(getUrl("/users"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));

      addLog("User created successfully!", data);
      fetchUsers(); // Refresh list
      // Reset form
      setUserForm({
        username: "",
        email: "",
        password: "",
        full_name: "",
        phone: "",
      });
    } catch (e) {
      addLog("Error creating user: " + e.message);
    }
  };

  // Delete User
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(getUrl(`/users/${id}`), { method: "DELETE" });
      addLog(`User ${id} deleted`);
      fetchUsers();
    } catch (e) {
      addLog("Delete failed: " + e.message);
    }
  };

  // Create Address
  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      alert("Please select a User ID from the list on the left first!");
      return;
    }

    const payload = {
      user_id: selectedUserId,
      ...addrForm,
    };

    try {
      const res = await fetch(getUrl("/addresses"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));

      addLog("Address created successfully!", data);
      fetchAddresses();
      // Reset form, but keep UserID for continuous addition
      setAddrForm({ country: "", city: "", street: "", postal_code: "" });
    } catch (e) {
      addLog("Error creating address: " + e.message);
    }
  };

  // --- Input Handlers ---
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddrInputChange = (e) => {
    const { name, value } = e.target;
    setAddrForm((prev) => ({ ...prev, [name]: value }));
  };

  // Initial Load
  useEffect(() => {
    // fetchUsers();
  }, []);

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 text-center">
          <h2>Microservice Client Console</h2>
          <p className="text-muted">React Client for User & Address Service</p>
        </div>
        <div className="col-md-8 offset-md-2">
          <div className="input-group">
            <span className="input-group-text">API Base URL</span>
            <input
              type="text"
              className="form-control"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
            />
          </div>
          <small className="text-muted d-block mt-1 text-center">
            *Ensure backend has CORS enabled (allow_origins=["*"])*
          </small>
        </div>
      </div>

      <div className="row">
        {/* Left Side: User Area */}
        <div className="col-md-6 mb-3">
          {/* Create User Card */}
          <div className="card mb-3 shadow-sm">
            <div className="card-header bg-primary text-white">Create User</div>
            <div className="card-body">
              <form onSubmit={handleCreateUser}>
                <div className="mb-2">
                  <input
                    name="username"
                    value={userForm.username}
                    onChange={handleUserInputChange}
                    className="form-control"
                    placeholder="Username"
                    required
                  />
                </div>
                <div className="mb-2">
                  <input
                    name="email"
                    value={userForm.email}
                    onChange={handleUserInputChange}
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="mb-2">
                  <input
                    name="password"
                    value={userForm.password}
                    onChange={handleUserInputChange}
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    required
                  />
                </div>
                <div className="mb-2">
                  <input
                    name="full_name"
                    value={userForm.full_name}
                    onChange={handleUserInputChange}
                    className="form-control"
                    placeholder="Full Name"
                  />
                </div>
                <div className="mb-2">
                  <input
                    name="phone"
                    value={userForm.phone}
                    onChange={handleUserInputChange}
                    className="form-control"
                    placeholder="Phone"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Create User
                </button>
              </form>
            </div>
          </div>

          {/* User List Card */}
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>User List</span>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={fetchUsers}
              >
                Refresh
              </button>
            </div>
            <div
              className="card-body p-0"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <table
                className="table table-hover mb-0"
                style={{ fontSize: "0.9rem" }}
              >
                <thead className="table-light">
                  <tr>
                    <th>Username</th>
                    <th>ID (Click to Select)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">
                        No data, please refresh
                      </td>
                    </tr>
                  )}
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={
                        selectedUserId === user.id ? "table-active" : ""
                      }
                    >
                      <td>{user.username}</td>
                      <td
                        style={{
                          cursor: "pointer",
                          color: "#0d6efd",
                          textDecoration: "underline",
                        }}
                        onClick={() => {
                          setSelectedUserId(user.id);
                          addLog(`Selected User: ${user.username}`);
                        }}
                        title="Click ID to create address for this user"
                      >
                        {user.id.substring(0, 8)}...
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger py-0"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Del
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Address Area */}
        <div className="col-md-6">
          {/* Create Address Card */}
          <div className="card mb-3 shadow-sm">
            <div className="card-header bg-success text-white">
              Create Address
            </div>
            <div className="card-body">
              <form onSubmit={handleCreateAddress}>
                <div className="mb-2">
                  <label className="form-label small text-muted">
                    User ID (Select from Left)
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={selectedUserId}
                    readOnly
                    placeholder="Click a User ID on the left"
                    required
                  />
                </div>
                <div className="row">
                  <div className="col-6 mb-2">
                    <input
                      name="country"
                      value={addrForm.country}
                      onChange={handleAddrInputChange}
                      className="form-control"
                      placeholder="Country"
                      required
                    />
                  </div>
                  <div className="col-6 mb-2">
                    <input
                      name="city"
                      value={addrForm.city}
                      onChange={handleAddrInputChange}
                      className="form-control"
                      placeholder="City"
                      required
                    />
                  </div>
                </div>
                <div className="mb-2">
                  <input
                    name="street"
                    value={addrForm.street}
                    onChange={handleAddrInputChange}
                    className="form-control"
                    placeholder="Street"
                    required
                  />
                </div>
                <div className="mb-2">
                  <input
                    name="postal_code"
                    value={addrForm.postal_code}
                    onChange={handleAddrInputChange}
                    className="form-control"
                    placeholder="Postal Code"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success w-100">
                  Create Address
                </button>
              </form>
            </div>
          </div>

          {/* Address List Card */}
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Address List</span>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={fetchAddresses}
              >
                Refresh
              </button>
            </div>
            <div
              className="card-body p-0"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <table
                className="table table-hover mb-0"
                style={{ fontSize: "0.9rem" }}
              >
                <thead className="table-light">
                  <tr>
                    <th>City/Country</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {addresses.length === 0 && (
                    <tr>
                      <td colSpan="2" className="text-center text-muted">
                        No data, please refresh
                      </td>
                    </tr>
                  )}
                  {addresses.map((addr) => (
                    <tr key={addr.id}>
                      <td>
                        {addr.city}, {addr.country}
                      </td>
                      <td>
                        <small
                          className="d-block text-truncate"
                          style={{ maxWidth: "150px" }}
                        >
                          {addr.street}
                        </small>
                        <span className="badge bg-secondary">
                          {addr.postal_code}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Log Area */}
      <div className="row mt-4">
        <div className="col-12">
          <h5>Operation Logs</h5>
          <div
            className="bg-dark text-light p-3 rounded font-monospace"
            style={{ height: "150px", overflowY: "auto", fontSize: "0.85rem" }}
          >
            {logs.length === 0 ? (
              <span className="text-muted">Waiting for action...</span>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className="border-bottom border-secondary pb-1 mb-1"
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFunctionPage;
