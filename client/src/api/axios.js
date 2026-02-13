import axios from 'axios';

// 1. Define the URLs
// "Development" = Your Laptop
// "Production" = The Internet (Vercel)
const LOCAL_URL = 'http://localhost:5000/api';
const LIVE_URL = 'https://interest-calculator-app-cx9o.onrender.com/api';

// 2. Automatically choose based on where the code is running
// Vite sets import.meta.env.MODE to 'development' when you run 'npm run dev'
const BASE_URL = import.meta.env.MODE === 'development' ? LOCAL_URL : LIVE_URL;

const instance = axios.create({
    baseURL: BASE_URL
});

export default instance;