# Biscord - Real-time Chat Application

A Discord-inspired chat application with real-time messaging, voice chat, and user authentication.

## Features

- Real-time messaging with Socket.IO
- Voice channels with Agora RTC
- User authentication with Clerk
- Anonymous user creation
- Message deletion and management
- Online/Offline user status
- Multiple text channels
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**:
  - React.js with Vite
  - Tailwind CSS
  - Socket.IO Client
  - Agora RTC SDK
  - Clerk Authentication

- **Backend**:
  - Node.js with Express
  - MongoDB with Mongoose
  - Socket.IO
  - Clerk SDK
  - Agora SDK

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chat-app
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Create `.env` files:

   **Backend (.env)**:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_uri
   CLERK_SECRET_KEY=your_clerk_secret_key
   AGORA_APP_ID=your_agora_app_id
   AGORA_APP_CERTIFICATE=your_agora_app_certificate
   ```

   **Frontend (.env)**:
   ```
   VITE_BACKEND_URL=http://localhost:5000
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_AGORA_APP_ID=your_agora_app_id
   ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm start

   # Start frontend development server
   cd frontend
   npm run dev
   ```

## Environment Setup

Ensure you have the following accounts and credentials:
- MongoDB Atlas account for database
- Clerk account for authentication
- Agora account for voice chat

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request
