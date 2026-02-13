import axios from 'axios';

// Automatically choose the right URL
// If running 'npm run dev' -> Use Localhost
// If running on Vercel -> Use Render URL
const BASE_URL = import.meta.env.MODE === 'development' 
    ? 'http://localhost:5000/api' 
    : 'https://interest-calculator-app-cx9o.onrender.com';

const instance = axios.create({
    baseURL: BASE_URL
});

export default instance;