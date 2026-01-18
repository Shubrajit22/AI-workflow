import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-[#111111]">
      <SignIn 
        appearance={{
          baseTheme: dark,
          elements: {
            rootBox: "mx-auto",
            card: "bg-[#171717] border border-white/10 shadow-xl",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            formFieldLabel: "text-gray-300",
            formFieldInput: "bg-[#0a0a0a] border-white/10 text-white",
            footerActionText: "text-gray-400",
            footerActionLink: "text-blue-400 hover:text-blue-300"
          }
        }} 
      />
    </div>
  );
}