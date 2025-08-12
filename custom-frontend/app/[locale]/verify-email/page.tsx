import { Suspense } from "react";
import { AmbientColor } from "@/components/decorations/ambient-color";
import { EmailVerification } from "@/components/email-verification";

export default function VerifyEmailPage() {
  return (
    <div className="relative overflow-hidden">
      <AmbientColor />
      <Suspense fallback={
        <div className="px-4 md:px-10 xl:px-4 h-screen max-w-lg mx-auto flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4">Loading...</h1>
          </div>
        </div>
      }>
        <EmailVerification />
      </Suspense>
    </div>
  );
}