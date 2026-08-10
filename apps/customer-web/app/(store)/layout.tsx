import Footer from "@/components/StoreComponents/Footer";
import Header from "@/components/StoreComponents/Header";
import AuthInitializer from "@/components/Wrappers/AuthInitializer";
import UserDashboardShell from "@/components/Wrappers/UserDashboardShell";

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full min-h-screen">
      <UserDashboardShell>
        <AuthInitializer />
        <Header />
        <main>{children}</main>
        <Footer />
      </UserDashboardShell>
    </div>
  );
};

export default StoreLayout;
