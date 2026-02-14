🚀 FinanceFlow: Professional Debt & Interest Tracker

FinanceFlow is a production-grade, multi-tenant SaaS application built to manage informal lending and borrowing with automated interest calculations. Designed for clarity and security, it features a modern Glassmorphism UI, real-time data visualization, and a robust backend architecture.

🌟 Key Features

-> Secure Authentication: Implemented JWT (JSON Web Tokens) for secure user sessions and complete data isolation between accounts.
-> Zod Schema Validation: Every API request is strictly validated using Zod, preventing malformed data and enhancing backend security.
-> Professional Glassmorphism UI: A high-end interface featuring a Sticky Profile Sidebar that stays fixed while the dashboard overview scrolls naturally.
-> Automated Interest Logic: Real-time calculation of total due amounts based on principal, interest rates, and transaction dates.
-> Financial Reporting: One-click PDF generation using jsPDF and autoTable to export transaction ledgers.
-> Interactive Analytics: Visual portfolio breakdown using Chart.js to track the ratio of Lent vs. Borrowed funds.
-> Real-time Notifications: Integrated React Hot Toasts for non-intrusive, professional user feedback during all CRUD operations.
-> Profile Customization: Support for Base64 image uploads, allowing users to personalize their profile directly from the dashboard.

🛠️ Technical Stack

Frontend

React.js: Functional components with Hooks (useContext, useEffect, useState).
Framer Motion: Smooth, high-performance animations and transitions.
Chart.js: Real-time data visualization for financial insights.
React Hot Toast: Elegant notification system.

Backend

Node.js & Express: Scalable RESTful API architecture.
Zod: Strict schema-based data validation middleware.
Bcrypt.js: Industry-standard salt-based password hashing.
JWT: Stateless authentication for secure access control.

Database

MongoDB: Flexible NoSQL storage for multi-tenant data structures.

🚀 Getting Started

Prerequisites

Node.js (v16+)
MongoDB Atlas Account
npm or yarn

1. Clone & Install

   git clone https://github.com/AnuragKumar/financeflow.git
   cd financeflow
        # Install Backend
           cd server && npm install
        # Install Frontend
           cd ../client && npm install
   
2. Environment Configuration
   Create a .env file in the server directory:

   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_secret_key
   
4. Run the Application
   # In the /server directory
   npm run dev

   # In the /client directory
   npm run dev

   
👨‍💻 Author

Anurag Kumar
First-year Student
Scaler School of Technology
Bengaluru, India
