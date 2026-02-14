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
  // 1. Get User Info & Logout function from AuthContext
  const { user, logout } = useContext(AuthContext);

  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 2. Fetch Transactions (Only for logged-in user)
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

  // 3. Delete Transaction
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;
    try {
      await axios.delete(`/transactions/${id}`);
      fetchTransactions(); // Refresh list
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  // 4. Mark as Settled/Active
  const handleSettle = async (id) => {
    try {
      await axios.patch(`/transactions/${id}/settle`);
      fetchTransactions(); // Refresh list
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // 5. Generate PDF Report
  // 5. Generate PDF Report
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Interest Calculator Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated for: ${user?.name || "User"}`, 14, 28);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 34);

    // Table Data
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
      const rowData = [
        new Date(t.date).toLocaleDateString(),
        t.personName,
        t.type,
        `Rs. ${t.amount}`,
        `Rs. ${result.interest}`,
        `Rs. ${result.total}`,
      ];
      tableRows.push(rowData);
    });

    // FIXED: Use the imported function directly
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
    });

    doc.save(`finance_report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // 6. Filter & Calculate Totals
  const filteredTransactions = transactions.filter((t) =>
    t.personName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalGiven = filteredTransactions
    .filter((t) => t.type === "Given" && t.status !== "Settled")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalTaken = filteredTransactions
    .filter((t) => t.type === "Taken" && t.status !== "Settled")
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Animation Configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="dashboard-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* --- HEADER SECTION --- */}
      <div
        className="dashboard-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1>
            Finance<span style={{ color: "#a855f7" }}>Flow</span>
          </h1>
          <p style={{ color: "#94a3b8", margin: "5px 0 0 0" }}>
            Welcome back,{" "}
            <span style={{ color: "#fff", fontWeight: "bold" }}>
              {user?.name}
            </span>
          </p>
        </div>

        <button
          onClick={logout}
          style={{
            padding: "10px 20px",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid #ef4444",
            color: "#ef4444",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.9rem",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) =>
            (e.target.style.background = "rgba(239, 68, 68, 0.25)")
          }
          onMouseOut={(e) =>
            (e.target.style.background = "rgba(239, 68, 68, 0.15)")
          }
        >
          Logout
        </button>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="stats-grid">
        <motion.div className="stat-card" variants={itemVariants}>
          <h3>Lent (Given)</h3>
          <p className="amount green">₹{totalGiven.toLocaleString()}</p>
        </motion.div>
        <motion.div className="stat-card" variants={itemVariants}>
          <h3>Borrowed (Taken)</h3>
          <p className="amount red">₹{totalTaken.toLocaleString()}</p>
        </motion.div>
        <motion.div className="stat-card" variants={itemVariants}>
          <h3>Net Balance</h3>
          <p className="amount blue">
            ₹{(totalGiven - totalTaken).toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* --- CHART SECTION --- */}
      <motion.div variants={itemVariants} style={{ marginBottom: "40px" }}>
        <StatsChart given={totalGiven} taken={totalTaken} />
      </motion.div>

      {/* --- CONTROLS & SEARCH --- */}
      <motion.div className="controls-container" variants={itemVariants}>
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

      {/* --- ADD TRANSACTION FORM --- */}
      <motion.div variants={itemVariants}>
        <TransactionForm onTransactionAdded={fetchTransactions} />
      </motion.div>

      {/* --- TRANSACTIONS TABLE --- */}
      <motion.div className="table-container" variants={itemVariants}>
        {loading ? (
          <p style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
            Loading transactions...
          </p>
        ) : filteredTransactions.length === 0 ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
            No transactions found.
          </p>
        ) : (
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Person</th>
                <th>Type</th>
                <th>Principal</th>
                <th>Interest</th>
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
                    <td style={{ color: "#94a3b8" }}>₹{result.interest}</td>
                    <td style={{ fontWeight: "bold", color: "#fff" }}>
                      ₹{result.total}
                    </td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => handleSettle(t._id)}
                        title={isSettled ? "Mark as Active" : "Mark as Settled"}
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
  );
};

export default Dashboard;
