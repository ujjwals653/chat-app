import { SignUpButton } from "@clerk/clerk-react"
import { Button } from "../ui/button"
import { MailOpen } from "lucide-react"

const SignUpPage = () => {

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
        <Button variant="ghost" className="text-gray-400 hover:text-gray-200">
          Sign in Anonymously            
        </Button>
      </div>
    </div>
  )
}

export default SignUpPage