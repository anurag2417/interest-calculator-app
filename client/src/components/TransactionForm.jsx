import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "../api/axios";
import toast from "react-hot-toast"; // 1. Import Toast
import "./TransactionForm.css";

const TransactionForm = ({ onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    personName: "",
    type: "Given",
    amount: "",
    interestRate: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 2. Validation with Toast
    if (!formData.personName || !formData.amount || !formData.interestRate) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      await axios.post("/transactions", formData);

      // 3. Success Toast (Replaces window.alert)
      toast.success("Transaction Added Successfully!");

      setFormData({
        personName: "",
        type: "Given",
        amount: "",
        interestRate: "",
        date: new Date().toISOString().split("T")[0],
        dueDate: "",
      });

      // Refresh the dashboard list
      onTransactionAdded();
    } catch (err) {
      if (err.response && err.response.data.errors) {
        // Loop through Zod errors and show them in toasts
        err.response.data.errors.forEach((error) => {
          toast.error(`${error.field}: ${error.message}`);
        });
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="transaction-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 style={{ color: "white", marginBottom: "20px" }}>
        Add New Transaction
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <input
            type="text"
            placeholder="Person Name"
            value={formData.personName}
            onChange={(e) =>
              setFormData({ ...formData, personName: e.target.value })
            }
            required
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            style={{
              background:
                formData.type === "Given"
                  ? "rgba(16, 185, 129, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
              color: formData.type === "Given" ? "#10b981" : "#ef4444",
              fontWeight: "bold",
            }}
          >
            <option value="Given">Given (Lend)</option>
            <option value="Taken">Taken (Borrow)</option>
          </select>
        </div>

        <div className="form-row">
          <input
            type="number"
            placeholder="Amount (₹)"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Interest Rate (%)"
            value={formData.interestRate}
            onChange={(e) =>
              setFormData({ ...formData, interestRate: e.target.value })
            }
            required
          />
        </div>

        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontSize: "0.8rem",
                color: "#94a3b8",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Transaction Date:
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontSize: "0.8rem",
                color: "#ef4444",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Due Date (Optional):
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
          </div>
        </div>

        <button type="submit" className="add-btn" disabled={loading}>
          {loading ? "Adding..." : "Add Transaction"}
        </button>
      </form>
    </motion.div>
  );
};

export default TransactionForm;
