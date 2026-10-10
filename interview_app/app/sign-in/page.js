import AuthAside from "@/components/AuthAside";
import SignInForm from "@/components/SignInForm";
import Link from "next/link";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="grid min-h-screen bg-[#0c0e12] text-[#f3f0e8] lg:grid-cols-2">
      <AuthAside />
      <main className="flex items-center px-6 py-12">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="text-lg font-semibold lg:hidden">
            DevPilot AI
          </Link>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-2 text-[#9c9890]">Use the email you registered with.</p>
          <div className="mt-8">
            <SignInForm />
          </div>
        </div>
      </main>
    </div>
  );
}
