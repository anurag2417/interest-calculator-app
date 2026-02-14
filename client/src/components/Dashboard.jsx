import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import axios from "../api/axios";
import AuthContext from "../context/AuthContext";
import TransactionForm from "./TransactionForm";
import StatsChart from "./StatsChart";
import { calculateInterest } from "../utils/calculations";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast"; // Import Toast
import "./Dashboard.css";

const Dashboard = () => {
  // 1. Get User Info & Logout function
  const { user, logout } = useContext(AuthContext);

  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 2. Fetch Transactions (With Error Toast)
  const fetchTransactions = async () => {
    try {
      const response = await axios.get("/transactions");
      setTransactions(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load transactions");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 3. Delete Action (With Custom Toast Confirmation)
  const handleDelete = (id) => {
    toast(
      (t) => (
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <span style={{ fontWeight: "bold" }}>Delete this transaction?</span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await axios.delete(`/transactions/${id}`);
                  toast.success("Transaction deleted");
                  fetchTransactions();
                } catch (err) {
                  toast.error("Failed to delete");
                }
              }}
              style={{
                padding: "6px 12px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                padding: "6px 12px",
                border: "1px solid #ccc",
                background: "transparent",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 5000, icon: "⚠️" },
    );
  };

  // 4. Settle Action (With Success/Error Toasts)
  const handleSettle = async (id) => {
    const loadingToast = toast.loading("Updating status...");
    try {
      await axios.patch(`/transactions/${id}/settle`);
      toast.success("Status updated!", { id: loadingToast });
      fetchTransactions();
    } catch (err) {
      toast.error("Could not update status", { id: loadingToast });
    }
  };

  // 5. PDF Generation
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("FinanceFlow Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated for: ${user?.name || "User"}`, 14, 28);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 34);

    // Prepare Data
    const tableColumn = [
      "Date",
      "Name",
      "Type",
      "Amount",
      "Interest",
      "Total Due",
    ];
    const tableRows = [];

    filteredTransactions.forEach((t) => {
      const result = calculateInterest(t.amount, t.interestRate, t.date);
      tableRows.push([
        new Date(t.date).toLocaleDateString(),
        t.personName,
        t.type,
        `Rs. ${t.amount}`,
        `Rs. ${result.interest}`,
        `Rs. ${result.total}`,
      ]);
    });

    // Generate Table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
    });

    doc.save(`finance_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF Downloaded!");
  };

  // 6. Calculations & Helpers
  const filteredTransactions = transactions.filter((t) =>
    t.personName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalGiven = filteredTransactions
    .filter((t) => t.type === "Given" && t.status !== "Settled")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalTaken = filteredTransactions
    .filter((t) => t.type === "Taken" && t.status !== "Settled")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalGiven - totalTaken;

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "U";
  };

  // Animation Variants
  const fadeUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="dashboard-wrapper">
      {/* --- LEFT SIDEBAR (Fixed Width) --- */}
      <motion.div
        className="profile-sidebar"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-card">
          <div className="profile-avatar">{getInitials(user?.name)}</div>
          <h2 className="profile-name">{user?.name || "User"}</h2>
          <p className="profile-email">{user?.email || "user@example.com"}</p>

          <div
            className="badge badge-paid"
            style={{ display: "inline-block", marginBottom: "20px" }}
          >
            Verified Member
          </div>

          <div className="sidebar-divider"></div>

          <div className="sidebar-stat">
            <span>Transactions</span>
            <span>{transactions.length}</span>
          </div>
          <div className="sidebar-stat">
            <span>Active Loans</span>
            <span>
              {transactions.filter((t) => t.status === "Active").length}
            </span>
          </div>
          <div className="sidebar-stat">
            <span>Net Worth</span>
            <span style={{ color: netBalance >= 0 ? "#10b981" : "#ef4444" }}>
              {netBalance >= 0 ? "+" : ""}₹{netBalance}
            </span>
          </div>

          <div className="sidebar-divider"></div>

          <button onClick={logout} className="logout-btn-sidebar">
            Logout
          </button>
        </div>
      </motion.div>

      {/* --- RIGHT MAIN CONTENT (Fills Remaining) --- */}
      <motion.div
        className="main-content"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {/* Header */}
        <motion.div variants={fadeUp} style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "2rem", margin: 0 }}>
            Dashboard <span style={{ color: "#a855f7" }}>Overview</span>
          </h1>
        </motion.div>

        {/* 1. Stats Grid */}
        <div className="stats-grid">
          <motion.div className="stat-card" variants={fadeUp}>
            <h3>Lent (Given)</h3>
            <p className="amount green">₹{totalGiven.toLocaleString()}</p>
          </motion.div>
          <motion.div className="stat-card" variants={fadeUp}>
            <h3>Borrowed (Taken)</h3>
            <p className="amount red">₹{totalTaken.toLocaleString()}</p>
          </motion.div>
          <motion.div className="stat-card" variants={fadeUp}>
            <h3>Net Balance</h3>
            <p className="amount blue">₹{netBalance.toLocaleString()}</p>
          </motion.div>
        </div>

        {/* 2. SPLIT ROW: Form (Middle) & Chart (Right) */}
        <div className="dashboard-split-row">
          {/* Form Section */}
          <motion.div className="dashboard-form-section" variants={fadeUp}>
            <TransactionForm onTransactionAdded={fetchTransactions} />
          </motion.div>

          {/* Chart Section */}
          <motion.div className="dashboard-chart-section" variants={fadeUp}>
            <StatsChart given={totalGiven} taken={totalTaken} />
          </motion.div>
        </div>

        {/* 3. Search & Table Controls */}
        <motion.div className="controls-container" variants={fadeUp}>
          <input
            className="search-input"
            type="text"
            placeholder="Search for a person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-primary" onClick={downloadPDF}>
            Download Report
          </button>
        </motion.div>

        {/* 4. Transaction Table */}
        <motion.div className="table-container" variants={fadeUp}>
          {loading ? (
            <p
              style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}
            >
              Loading...
            </p>
          ) : filteredTransactions.length === 0 ? (
            <p
              style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}
            >
              No transactions found.
            </p>
          ) : (
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Person</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Total Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => {
                  const result = calculateInterest(
                    t.amount,
                    t.interestRate,
                    t.date,
                  );
                  const isSettled = t.status === "Settled";
                  return (
                    <tr key={t._id} style={{ opacity: isSettled ? 0.5 : 1 }}>
                      <td>
                        {new Date(t.date).toLocaleDateString()}
                        {t.dueDate && (
                          <div
                            style={{
                              fontSize: "0.75em",
                              color: "#f59e0b",
                              marginTop: "4px",
                            }}
                          >
                            Due: {new Date(t.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td>
                        {t.personName}
                        {isSettled && (
                          <span
                            className="badge badge-paid"
                            style={{ marginLeft: "8px" }}
                          >
                            PAID
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            color: t.type === "Given" ? "#10b981" : "#ef4444",
                            fontWeight: "600",
                            background:
                              t.type === "Given"
                                ? "rgba(16, 185, 129, 0.1)"
                                : "rgba(239, 68, 68, 0.1)",
                            padding: "4px 8px",
                            borderRadius: "6px",
                          }}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td>₹{t.amount}</td>
                      <td style={{ fontWeight: "bold", color: "#fff" }}>
                        ₹{result.total}
                      </td>
                      <td>
                        <button
                          className="action-btn"
                          onClick={() => handleSettle(t._id)}
                          title={
                            isSettled ? "Mark as Active" : "Mark as Settled"
                          }
                        >
                          {isSettled ? "Undo" : "Settle"}
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(t._id)}
                          title="Delete Transaction"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
