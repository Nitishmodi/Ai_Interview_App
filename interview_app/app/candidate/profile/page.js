import ProfileForm from "@/components/profile/ProfileForm";
import { getCurrentUser } from "@/lib/current-user";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#5d6d7e]">
        Update your name, the email you sign in with, and the details used to order open roles.
      </p>
      <div className="mt-8">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
