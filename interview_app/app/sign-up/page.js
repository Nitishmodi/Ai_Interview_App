import Link from "next/link";
import AuthAside from "@/components/AuthAside";
import SignUpForm from "@/components/SignUpForm";

export const metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen bg-[#0c0e12] text-[#f3f0e8] lg:grid-cols-2">
      <AuthAside />
      <main className="flex items-center px-6 py-12">
        <div className="mx-auto w-full max-w-xl">
          <Link href="/" className="text-lg font-semibold lg:hidden">
            DevPilot AI
          </Link>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">Create account</h1>
          <p className="mt-2 text-[#9c9890]">One account is either a recruiter or a candidate.</p>
          <div className="mt-8">
            <SignUpForm />
          </div>
        </div>
      </main>
    </div>
  );
}
