import { SignUpButton, useSignIn } from "@clerk/clerk-react"
import { Button } from "../ui/button"
import { MailOpen, Loader2 } from "lucide-react"
import { useState } from "react"
import axios from "axios"

const SignUpPage = () => {
  const [failCounter, setFailCounter] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const { signIn, setActive } = useSignIn();

  const handleAnonymousSignin = async (email, password) => {
    try {
      const signInAttemp = await signIn.create({
        identifier: email,
        password: password,
      });

      if (signInAttemp.status === 'complete') {
        await setActive({ session: signInAttemp.createdSessionId });
        console.log("Sign in Successfull.");
      } else {
        console.log("Status: ", signInAttemp.status);
      }
    } catch (error) {
      console.error("Error Signing in guest user: ", error);
    }
  }

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/anonymous`);
      const { email, password } = response.data;
      await handleAnonymousSignin(email, password);
    } catch (error) {
      console.log("Getting anonymous data server failed: ", error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="lg:p-32 max-md:p-10 p-5 flex items-center justify-center h-screen bg-[#1f1f23]">
      <div className="flex flex-col gap-4 items-center justify-center w-96 max-md:w-full">
        <SignUpButton>
          <button className=" bg-[#e0e0e0] hover:bg-[#eee] text-gray-900 inset-shadow-sm hover:inset-shadow-lg rounded-md px-auto py-2 w-full flex align-center justify-center font-medium font-inter =">
            <MailOpen className="mr-2"/>
            SignIn / SignUp
            <svg className="h-6 w-6 relative top-2 left-1.5" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m7.25 5-3.5-2.25v4.5L7.25 5Z"></path>
            </svg>
          </button>
        </SignUpButton>
        {error ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-red-500">Failed to sign in anonymously</p>
            <Button 
              variant="destructive" 
              onClick={handleAnonymousLogin}
              className="bg-red-600 hover:bg-red-700"
            >
              Retry
            </Button>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-gray-200" 
            onClick={handleAnonymousLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                Signing in...
              </>
            ) : (
              "Sign in Anonymously"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export default SignUpPage