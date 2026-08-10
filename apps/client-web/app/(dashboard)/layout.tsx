import AuthInitializer from "@/components/Wrappers/AuthInitializer";
import DashboardShell from "@/components/Wrappers/DashboardShell";

export const metadata = {
  title: "Dashboard | Nasi-MLM-Store",
  description: "Admin and Seller dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
      <div className="bg-[#161d31] w-full min-h-screen">
        <DashboardShell>
          <AuthInitializer />
          {children}
        </DashboardShell>
      </div>
  );
}