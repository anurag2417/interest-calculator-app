import axios from 'axios';

// CHANGE THIS: Use the Render URL you just copied
const instance = axios.create({
    baseURL: 'https://interest-calculator-app-cx9o.onrender.com' 
});

export default instance;