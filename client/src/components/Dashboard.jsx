import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import axios from "../api/axios";
import AuthContext from "../context/AuthContext";
import TransactionForm from "./TransactionForm";
import StatsChart from "./StatsChart";
import { calculateInterest } from "../utils/calculations";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("/transactions");
      setTransactions(response.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load transactions");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // NEW: Handle Image Upload Logic
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (Stay under 2MB for MongoDB performance)
    if (file.size > 2000000) {
      toast.error("Image too large. Please keep it under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64String = reader.result;
      const loadingToast = toast.loading("Uploading image...");
      try {
        await axios.put("/auth/profile-picture", { image: base64String });
        toast.success("Profile updated!", { id: loadingToast });
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        toast.error("Upload failed. Check server limits.", {
          id: loadingToast,
        });
      }
    };
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <span style={{ fontWeight: "bold", color: "#fff" }}>
          Delete this transaction?
        </span>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.delete(`/transactions/${id}`);
                toast.success("Deleted");
                fetchTransactions();
              } catch (err) {
                toast.error("Error deleting");
              }
            }}
            style={{
              padding: "6px 12px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: "6px 12px",
              border: "1px solid #475569",
              background: "transparent",
              borderRadius: "6px",
              cursor: "pointer",
              color: "#fff",
            }}
          >
            No
          </button>
        </div>
      </div>
    ));
  };

  const handleSettle = async (id) => {
    try {
      await axios.patch(`/transactions/${id}/settle`);
      toast.success("Status updated");
      fetchTransactions();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("FinanceFlow Report", 14, 20);
    const rows = filteredTransactions.map((t) => {
      const res = calculateInterest(t.amount, t.interestRate, t.date);
      return [
        new Date(t.date).toLocaleDateString(),
        t.personName,
        t.type,
        `₹${t.amount}`,
        `₹${res.total}`,
      ];
    });
    autoTable(doc, {
      head: [["Date", "Name", "Type", "Principal", "Total"]],
      body: rows,
      startY: 30,
    });
    doc.save("finance_report.pdf");
  };

  const filteredTransactions = transactions.filter((t) =>
    t.personName.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalGiven = filteredTransactions
    .filter((t) => t.type === "Given" && t.status !== "Settled")
    .reduce((a, b) => a + b.amount, 0);
  const totalTaken = filteredTransactions
    .filter((t) => t.type === "Taken" && t.status !== "Settled")
    .reduce((a, b) => a + b.amount, 0);
  const netBalance = totalGiven - totalTaken;
  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "U";

  return (
    <div className="dashboard-wrapper">
      {/* --- LEFT SIDEBAR (STICKY) --- */}
      <motion.div
        className="profile-sidebar"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <div className="profile-card">
          <div className="profile-header">
            {/* Interactive Avatar */}
            <div
              className="profile-avatar"
              onClick={() => document.getElementById("fileInput").click()}
              style={{ cursor: "pointer", overflow: "hidden" }}
              title="Click to upload photo"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                getInitials(user?.name)
              )}
            </div>

            <input
              id="fileInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />

            <h2 className="profile-name">{user?.name || "Anurag"}</h2>
            <p className="profile-email">
              {user?.email || "anuragakn18@gmail.com"}
            </p>
            <div className="profile-badge">Verified Member</div>
            <div className="sidebar-divider"></div>
            <div className="profile-stats-container">
              <div className="sidebar-stat">
                <span>Transactions</span>
                <span>{transactions.length}</span>
              </div>
              <div className="sidebar-stat">
                <span>Net Worth</span>
                <span
                  style={{ color: netBalance >= 0 ? "#10b981" : "#ef4444" }}
                >
                  {netBalance >= 0 ? "+" : ""}₹{netBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <button onClick={logout} className="logout-btn-sidebar">
            Logout
          </button>
        </div>
      </motion.div>

      {/* --- RIGHT CONTENT --- */}
      <div className="main-content">
        <h1 style={{ marginBottom: "20px" }}>
          Dashboard <span style={{ color: "#a855f7" }}>Overview</span>
        </h1>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Lent</h3>
            <p className="amount green">₹{totalGiven.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Borrowed</h3>
            <p className="amount red">₹{totalTaken.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Net Balance</h3>
            <p className="amount blue">₹{netBalance.toLocaleString()}</p>
          </div>
        </div>

        <div className="dashboard-split-row">
          <div className="dashboard-form-section">
            <TransactionForm onTransactionAdded={fetchTransactions} />
          </div>
          <div className="dashboard-chart-section">
            <StatsChart given={totalGiven} taken={totalTaken} />
          </div>
        </div>

        <div className="controls-container">
          <input
            className="search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-primary" onClick={downloadPDF}>
            Download Report
          </button>
        </div>

        <div className="table-container">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Person</th>
                <th>Type</th>
                <th>Principal</th>
                <th>Total Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => {
                const res = calculateInterest(t.amount, t.interestRate, t.date);
                const isSettled = t.status === "Settled";
                return (
                  <tr key={t._id} style={{ opacity: isSettled ? 0.5 : 1 }}>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td>
                      {t.personName}{" "}
                      {isSettled && (
                        <span className="badge badge-paid">PAID</span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          color: t.type === "Given" ? "#10b981" : "#ef4444",
                          fontWeight: "bold",
                        }}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td>₹{t.amount}</td>
                    <td>₹{res.total}</td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => handleSettle(t._id)}
                      >
                        {isSettled ? "Undo" : "Settle"}
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(t._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
