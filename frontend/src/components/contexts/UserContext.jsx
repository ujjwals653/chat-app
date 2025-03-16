import { useUser } from "@clerk/clerk-react";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(); // Creating the context

export function UserProvider({ children }) {
  const { user } = useUser(); // Getting the user from the ClerkProvider
  console.log(user); 

  return (
    <UserContext.Provider value={{user}}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserCon() {
  return useContext(UserContext);
}