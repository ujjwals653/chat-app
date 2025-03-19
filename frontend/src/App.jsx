import React from 'react';
import MainLayout from './components/layout/MainLayout';
import SignUpPage from './components/auth/SignUpPage';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

function App() {
  return (
    <>
      <SignedIn>
        <MainLayout />
      </SignedIn>
      <SignedOut>
        <SignUpPage />
      </SignedOut>
    </>
  );
}

export default App;
