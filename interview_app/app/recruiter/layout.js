import { redirect } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import { getCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

const items = [
  { href: "/recruiter", label: "Overview", exact: true, group: "Work" },
  { href: "/recruiter/jobs", label: "Job posts", group: "Work" },
  { href: "/recruiter/jobs/new", label: "New post", exact: true, group: "Work" },
  { href: "/recruiter/assistant", label: "Assistant", exact: true, group: "Work" },
  { href: "/recruiter/account", label: "Account", exact: true, group: "Account" },
];

export default async function RecruiterLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "recruiter") redirect("/candidate");
  return <AppShell user={user} items={items}>{children}</AppShell>;
}
