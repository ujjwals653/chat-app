import React from 'react';
import MainLayout from './components/layout/MainLayout';
import SignUpPage from './components/auth/SignUpPage';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in/*" element={
            <>
              <SignedOut>
                <SignUpPage />
              </SignedOut>
              <SignedIn>
                <Navigate to="/chat" replace />
              </SignedIn>
            </>
          } />

        <Route path="/chat/*" element={
          <>
            <SignedIn>
              <MainLayout/>
            </SignedIn>
            <SignedOut>
              <Navigate to="/sign-in" replace />
            </SignedOut>
          </>
          } />

        {/* Redirect to chat or sign-in based on sing-in status */}
        <Route path="*" element={
            <>
              <SignedIn>
                <Navigate to="/chat" replace />
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          } />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
