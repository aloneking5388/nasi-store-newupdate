import ChangePassword from "@/components/SellerComponents/ChangePassword";
import UserProfile from "@/components/StoreComponents/UserProfile";

const ChangePasswordPage = () => {
  return (
     <div className="px-2 lg:px-7">
      <div className="w-full flex flex-wrap">
        {/* Left Side */}
        <div className="w-full md:w-6/12">
          <div className="bg-white text-[#212225] p-4 rounded-md">
            {/* Image */}
            <UserProfile />
          </div>
        </div>
        {/* Right Side - Change Password */}
        <div className="w-full md:w-6/12">
          <div className="md:pl-7 mt-6 md:mt-0">
            <div className="bg-white text-[#212225] p-4 rounded-md">
              <h1 className="text-lg font-semibold mb-3">Change Password</h1>
              <ChangePassword />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
