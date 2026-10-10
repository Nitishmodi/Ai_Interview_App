import { signOut } from "@/lib/actions/auth";
import ProfileForm from "@/components/profile/ProfileForm";
import { getCurrentUser } from "@/lib/current-user";

export const metadata = { title: "Account" };

export default async function RecruiterAccountPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#5d6d7e]">
        Update the name and email on this hiring desk. The email is also what you use to sign in.
      </p>
      <div className="mt-8">
        <ProfileForm user={user} />
      </div>
      <form action={signOut} className="mt-8">
        <button type="submit" className="rounded-full border border-[#d5e0ea] bg-white px-4 py-2.5 text-sm font-semibold">
          Sign out
        </button>
      </form>
    </div>
  );
}
