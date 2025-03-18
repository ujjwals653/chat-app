import { SignUpButton, useSignIn } from "@clerk/clerk-react"
import { Button } from "../ui/button"
import { MailOpen } from "lucide-react"
import { useState } from "react"
import axios from "axios"

const SignUpPage = () => {
  const [failCounter, setFailCounter] = useState(0);
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
    try {
      const response = await axios.post('http://localhost:5000/api/auth/anonymous');
      const { email, password } = response.data;

      handleAnonymousSignin(email, password);

      // localStorage.setItem('authToken', response.data.token);
      // localStorage.setItem('email', email);
      // localStorage.setItem('userId', userId);
      // localStorage.setItem('isAnonymous', 'true');

      // window.location.href = '/chat';
    } catch (error) {
      console.log("Getting anonymous data server failed: ", error);
      if (failCounter === 0) {
        alert("Well, that didn't work try again maybe?");
        setFailCounter(failCounter + 1);
      } else if (failCounter === 1) {
        alert("Once More?");
        setFailCounter(failCounter + 1);
      } else if (failCounter === 2) {
        alert("ok, you can leave.")
        setFailCounter(failCounter + 1);
      } else {
        alert("Something is broken (check the logs).");
      }
    }
  }

  return (
    <div className="lg:p-32 max-md:p-10 p-5 flex items-center justify-center h-screen bg-[#1f1f23]">
      <div className="flex flex-col gap-4 items-center justify-center w-96 max-md:w-full">
      <SignUpButton>
        <button className=" bg-[#e0e0e0] hover:bg-[#eee] text-gray-900 inset-shadow-sm hover:inset-shadow-lg rounded-md px-auto py-2 w-full flex align-center justify-center font-medium font-inter =">
          <MailOpen className="mr-2"/>
          SignIn / SignUp
          <svg class="h-6 w-6 relative top-2 left-1.5" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m7.25 5-3.5-2.25v4.5L7.25 5Z"></path>
            </svg>
        </button>
      </SignUpButton>
        <Button variant="ghost" className="text-gray-400 hover:text-gray-200" onClick={handleAnonymousLogin}>
          Sign in Anonymously            
        </Button>
      </div>
    </div>
  )
}

export default SignUpPage