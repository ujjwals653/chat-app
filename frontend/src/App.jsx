import React from 'react';
import MainLayout from './components/layout/MainLayout';
import SignUpPage from './components/auth/SignUpPage';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { UserProvider } from './components/contexts/UserContext';
import { ChannelProvider } from './components/contexts/ChannelContext';

function App() {
  return (
    <>
      <SignedIn>
        <UserProvider>
          <ChannelProvider>
            <MainLayout />
          </ChannelProvider>
        </UserProvider>
      </SignedIn>
      <SignedOut>
        <SignUpPage />
      </SignedOut>
    </>
  );
}

export default App;
