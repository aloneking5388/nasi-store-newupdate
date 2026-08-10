import ChangePassword from "@/components/SellerComponents/ChangePassword";
import UserProfile from "@/components/SellerComponents/UserProfile";

const Profile = () => {
  return (
    <div className="px-2 lg:px-7 py-5">
      <div className="w-full flex flex-wrap">
        {/* Left Side */}
        <div className="w-full md:w-6/12">
          <div className="bg-[#283046] text-[#d0d2d6] p-4 rounded-md">
            {/* Image */}
            <UserProfile />
          </div>
        </div>
        {/* Right Side - Change Password */}
        <div className="w-full md:w-6/12">
          <div className="md:pl-7 mt-6 md:mt-0">
            <div className="bg-[#283046] text-[#d0d2d6] p-4 rounded-md">
              <h1 className="text-lg font-semibold mb-3">Change Password</h1>
              <ChangePassword />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
