import DashboardNavbar from "@/components/StoreComponents/DashboardNavbar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
        <DashboardNavbar>
          {children}
        </DashboardNavbar>
  );
};

export default DashboardLayout;
