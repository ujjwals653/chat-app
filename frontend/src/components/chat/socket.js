import axios from 'axios';
import { io } from 'socket.io-client';

// For API requests
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('authToken')}`;

// For socket.io
const socket = io('http://localhost:5000', {
    auth: {
      token: localStorage.getItem('authToken') // Same token used for HTTP requests
    }
});

export default socket;