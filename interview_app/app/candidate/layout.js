import { redirect } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import { ScreenRailProvider } from "@/components/shell/ScreenRail";
import { getCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

const items = [
  { href: "/candidate", label: "Overview", exact: true, group: "Work" },
  { href: "/candidate/jobs", label: "Roles for you", group: "Work" },
  { href: "/candidate/results", label: "Results", exact: true, group: "Work" },
  { href: "/candidate/assistant", label: "Assistant", exact: true, group: "Work" },
  { href: "/candidate/profile", label: "Profile", exact: true, group: "Account" },
];

export default async function CandidateLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "candidate") redirect("/recruiter");
  return (
    <ScreenRailProvider>
      <AppShell user={user} items={items}>{children}</AppShell>
    </ScreenRailProvider>
  );
}
