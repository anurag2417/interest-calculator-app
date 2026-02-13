import axios from 'axios';

// CHANGE THIS: Use the Render URL you just copied
const instance = axios.create({
    baseURL: 'https://interest-calculator-api.onrender.com/api' 
});

export default instance;