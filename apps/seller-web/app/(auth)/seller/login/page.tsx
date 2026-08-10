import SellerLoginForm from "@/components/SellerComponents/SellerLoginForm";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

const SellerLoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#161d31]">
      <Card className="w-full text-[#d0d2d6] max-w-md bg-[#283046] p-6 rounded-lg shadow-md">
        <CardContent>
          <Link href={"/"} className="flex justify-center items-center mb-6">
            <Image src="/images/logo.png" alt="Logo" width={160} height={40} />
          </Link>
          <SellerLoginForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerLoginPage;
