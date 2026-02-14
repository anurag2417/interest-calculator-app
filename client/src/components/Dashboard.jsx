import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import axios from "../api/axios";
import AuthContext from "../context/AuthContext";
import TransactionForm from "./TransactionForm";
import StatsChart from "./StatsChart";
import { calculateInterest } from "../utils/calculations";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (e) {}
  };

  const handleSettle = async (id) => {
    try {
      await axios.patch(`/transactions/${id}/settle`);
      fetchTransactions();
    } catch (e) {}
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("FinanceFlow Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`User: ${user?.name || "User"}`, 14, 28);
    const rows = filteredTransactions.map((t) => {
      const res = calculateInterest(t.amount, t.interestRate, t.date);
      return [
        new Date(t.date).toLocaleDateString(),
        t.personName,
        t.type,
        `Rs. ${t.amount}`,
        `Rs. ${res.total}`,
      ];
    });
    autoTable(doc, {
      head: [["Date", "Name", "Type", "Amount", "Total"]],
      body: rows,
      startY: 35,
    });
    doc.save("report.pdf");
  };

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
  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "U";

  const fadeUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="dashboard-wrapper">
      {/* LEFT SIDEBAR */}
      <motion.div
        className="profile-sidebar"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <div className="profile-card">
          <div className="profile-avatar">{getInitials(user?.name)}</div>
          <h2 className="profile-name">{user?.name}</h2>
          <p className="profile-email">{user?.email}</p>
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

      {/* RIGHT MAIN CONTENT */}
      <motion.div
        className="main-content"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div variants={fadeUp} style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "2rem", margin: 0 }}>
            Dashboard <span style={{ color: "#a855f7" }}>Overview</span>
          </h1>
        </motion.div>

        {/* 1. STATS */}
        <div className="stats-grid">
          <motion.div className="stat-card" variants={fadeUp}>
            <h3>Lent</h3>
            <p className="amount green">₹{totalGiven.toLocaleString()}</p>
          </motion.div>
          <motion.div className="stat-card" variants={fadeUp}>
            <h3>Borrowed</h3>
            <p className="amount red">₹{totalTaken.toLocaleString()}</p>
          </motion.div>
          <motion.div className="stat-card" variants={fadeUp}>
            <h3>Net Balance</h3>
            <p className="amount blue">₹{netBalance.toLocaleString()}</p>
          </motion.div>
        </div>

        {/* 2. SPLIT ROW (Form & Chart) */}
        <div className="dashboard-split-row">
          <motion.div className="dashboard-form-section" variants={fadeUp}>
            <TransactionForm onTransactionAdded={fetchTransactions} />
          </motion.div>
          <motion.div className="dashboard-chart-section" variants={fadeUp}>
            <StatsChart given={totalGiven} taken={totalTaken} />
          </motion.div>
        </div>

        {/* 3. TABLE CONTROLS */}
        <motion.div className="controls-container" variants={fadeUp}>
          <input
            className="search-input"
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-primary" onClick={downloadPDF}>
            Download Report
          </button>
        </motion.div>

        {/* 4. TABLE */}
        <motion.div className="table-container" variants={fadeUp}>
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
                    <td style={{ fontWeight: "bold" }}>₹{res.total}</td>
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
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
