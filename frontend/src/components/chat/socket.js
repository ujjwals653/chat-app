import axios from 'axios';
import { io } from 'socket.io-client';

// For API requests
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('authToken')}`;

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
    auth: {
      token: localStorage.getItem('authToken'),
      username: localStorage.getItem('username') || `Guest${Math.floor(Math.random*9999)}`, // Use username from localStorage or fallback to 'Guest'
    }
});

export default socket;