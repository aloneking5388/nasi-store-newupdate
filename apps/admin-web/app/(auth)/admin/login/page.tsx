import AdminLoginForm from '@/components/AdminComponents/AdminLoginForm'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

const AdminLogin = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#161d31]">
      <Card className="w-full max-w-md bg-[#283046] p-6 rounded-lg shadow-md">
        <CardContent>
          <Link href={"/"} className="flex justify-center items-center mb-6">
            <Image src="/images/logo.png" alt="Logo" width={160} height={40} />
          </Link>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminLogin
