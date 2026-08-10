"use client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  adminLogin,
  authMessageClear,
  setCredentials,
} from "@/store/Auth/authSlice";
import { returnRole } from "@/utils/authUtils";

const AdminLoginForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loader, errorMessage, successMessage, token } = useAppSelector(
    (state) => state.auth,
  );
  const [status, setStatus] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const inputHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus({ ...status, [e.target.name]: e.target.value });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(adminLogin(status));
  };

  useEffect(() => {
    if (successMessage && token) {
      localStorage.setItem("accessToken", token);
      const role = returnRole(token);
      dispatch(setCredentials({ token, role }));
      toast.success(successMessage);
      setStatus({ email: "", password: "" });
      router.push("/admin");
      dispatch(authMessageClear());
    } else if (errorMessage) {
      toast.error(errorMessage);
      dispatch(authMessageClear());
    }
  }, [successMessage, errorMessage, token, dispatch, router]);

  return (
    <div>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex flex-col gap-1 mb-4">
          <Label htmlFor="email" className="text-[#d0d2d6]">
            Email
          </Label>
          <Input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={status.email}
            onChange={inputHandle}
            required
            className="mt-1"
          />
        </div>
        <div className="flex flex-col gap-1 mb-4 relative">
          <Label htmlFor="password" className="text-[#d0d2d6]">
            Password
          </Label>
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            placeholder="Enter your password"
            value={status.password}
            onChange={inputHandle}
            required
            className="mt-1"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 cursor-pointer text-xl text-slate-400"
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600"
          disabled={loader || !status.email || !status.password}
        >
          {loader ? (
            <Loader2 className="animate-spin w-5 h-5 mx-auto" />
          ) : (
            "Login"
          )}
        </Button>
      </form>
    </div>
  );
};

export default AdminLoginForm;
