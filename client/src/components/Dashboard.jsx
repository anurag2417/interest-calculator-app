import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import TransactionForm from "./TransactionForm"; // Import the new form
import "./Dashboard.css";
import { calculateInterest } from "../utils/calculations";
import StatsChart from "./StatsChart";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState(""); // New State
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch data (we moved this out so we can call it again later)
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

  // Initial Load
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Function to delete a transaction
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      await axios.delete(`/transactions/${id}`);
      fetchTransactions(); // Refresh the list after deleting
    } catch (err) {
      alert("Error deleting transaction");
    }
  };

  // Function to toggle status (Active <-> Settled)
  const handleSettle = async (id) => {
    try {
      await axios.patch(`/transactions/${id}/settle`);
      fetchTransactions(); // Refresh data to update the UI
    } catch (err) {
      alert("Error updating status");
    }
  };

  // Calculate Totals (Only count ACTIVE transactions)
  // FILTER LOGIC:
  // If searchTerm is empty, use all transactions.
  // If searchTerm has text, only show transactions where the name matches.
  const filteredTransactions = transactions.filter((t) =>
    t.personName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate Totals based on the FILTERED list
  const totalGiven = filteredTransactions
    .filter((t) => t.type === "Given" && t.status !== "Settled")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalTaken = filteredTransactions
    .filter((t) => t.type === "Taken" && t.status !== "Settled")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalGiven - totalTaken;

  // PDF GENERATION FUNCTION
  const downloadPDF = () => {
    const doc = new jsPDF();

    // 1. Add Title
    doc.setFontSize(18);
    doc.text("Interest Calculator Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // 2. Add Summary
    doc.text(`Total Given: Rs. ${totalGiven}`, 14, 40);
    doc.text(`Total Taken: Rs. ${totalTaken}`, 14, 46);
    doc.text(`Net Balance: Rs. ${totalGiven - totalTaken}`, 14, 52);

    // 3. Prepare Table Data
    // We use the 'filteredTransactions' so the PDF matches what is on screen
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
      const transactionData = [
        new Date(t.date).toLocaleDateString(),
        t.personName,
        t.type,
        `Rs. ${t.amount}`,
        `Rs. ${result.interest}`,
        `Rs. ${result.total}`,
      ];
      tableRows.push(transactionData);
    });

    // 4. Generate Table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 60,
    });

    // 5. Save the File
    doc.save(`Interest_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="dashboard-container">
      <h1>Interest Calculator Dashboard</h1>

      {/* Search Bar */}
      <div
        className="search-container"
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Search for a person..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            fontSize: "16px",
            border: "2px solid #ddd",
            borderRadius: "8px",
          }}
        />

        <button
          onClick={downloadPDF}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c5ce7",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Download PDF
        </button>
      </div>

      <div className="stats-grid">
        <div className="card given">
          <h3>Total Given (Lent)</h3>
          <p>₹{totalGiven}</p>
        </div>
        <div className="card taken">
          <h3>Total Taken (Borrowed)</h3>
          <p>₹{totalTaken}</p>
        </div>
        <div className="card balance">
          <h3>Net Balance</h3>
          <p style={{ color: totalGiven - totalTaken >= 0 ? "green" : "red" }}>
            ₹{totalGiven - totalTaken}
          </p>
        </div>
      </div>

      {/* NEW: Chart Section */}
      <div style={{ marginBottom: "40px" }}>
        <StatsChart given={totalGiven} taken={totalTaken} />
      </div>

      {/* Pass the refresh function to the form */}
      <TransactionForm onTransactionAdded={fetchTransactions} />

      <h2>Recent Transactions</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Rate (%)</th>
              <th>Time</th> {/* NEW */}
              <th>Interest</th> {/* NEW */}
              <th>Total Due</th> {/* NEW */}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => {
              // Check for Overdue
              const today = new Date();
              const due = t.dueDate ? new Date(t.dueDate) : null;
              const isOverdue = due && due < today && t.status === "Active";
              const result = calculateInterest(
                t.amount,
                t.interestRate,
                t.date,
              );
              const isSettled = t.status === "Settled"; // Check status

              return (
                <tr
                  key={t._id}
                  style={{
                    opacity: isSettled ? 0.5 : 1,
                    background: isSettled ? "#f9f9f9" : "transparent",
                  }}
                >
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>
                    {new Date(t.date).toLocaleDateString()}
                    {/* Show Due Date if exists */}
                    {t.dueDate && (
                      <div style={{ fontSize: "0.75rem", color: "#888" }}>
                        Due: {new Date(t.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    {/* Show OVERDUE Badge */}
                    {isOverdue && (
                      <span
                        style={{
                          backgroundColor: "red",
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "0.7rem",
                          marginLeft: "5px",
                        }}
                      >
                        OVERDUE!
                      </span>
                    )}
                  </td>
                  <td>
                    {t.personName}
                    {isSettled && (
                      <span
                        style={{
                          marginLeft: "10px",
                          fontSize: "0.8em",
                          color: "green",
                        }}
                      >
                        (PAID)
                      </span>
                    )}
                  </td>
                  <td
                    className={t.type === "Given" ? "text-green" : "text-red"}
                  >
                    {t.type}
                  </td>

                  {/* If settled, strike through the amounts */}
                  <td
                    style={{
                      textDecoration: isSettled ? "line-through" : "none",
                    }}
                  >
                    ₹{t.amount}
                  </td>
                  <td>{t.interestRate}%</td>

                  <td>{result.days} days</td>
                  <td>₹{result.interest}</td>
                  <td
                    style={{
                      fontWeight: "bold",
                      textDecoration: isSettled ? "line-through" : "none",
                    }}
                  >
                    ₹{result.total}
                  </td>

                  <td>
                    {/* New Button: Mark as Paid / Undo */}
                    <button
                      className="settle-btn"
                      style={{
                        marginRight: "5px",
                        backgroundColor: isSettled ? "#fab1a0" : "#55efc4",
                        border: "none",
                        padding: "5px",
                        cursor: "pointer",
                        borderRadius: "4px",
                      }}
                      onClick={() => handleSettle(t._id)}
                    >
                      {isSettled ? "Undo" : "Settle"}
                    </button>

                    <button
                      className="delete-btn"
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
      )}
    </div>
  );
};

export default Dashboard;
