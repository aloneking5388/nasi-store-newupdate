"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store/store";
import { returnUserInfo } from "@/utils/authUtils";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineGithub,
  AiOutlineGooglePlus,
} from "react-icons/ai";
import { CiTwitter } from "react-icons/ci";
import { FiFacebook } from "react-icons/fi";
import {
  authMessageClear,
  seller_login,
  setCredentials,
} from "@/store/Auth/authSlice";

const SellerLoginForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    loader: loading,
    errorMessage: error,
    successMessage: success,
    token,
  } = useAppSelector((state: RootState) => state.auth);

  const [status, setStatus] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const inputHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus({ ...status, [e.target.name]: e.target.value });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(seller_login(status));
  };

  const parseErrorMessage = (error: any) => {
    if (typeof error === "string") return error;
    return error?.message || "An unknown error occurred";
  };

  useEffect(() => {
    if (error) {
      toast.error(parseErrorMessage(error));
      dispatch(authMessageClear());
    }

    if (success && token) {
      localStorage.setItem("accessToken", token);
      dispatch(setCredentials({ token }));
      const userInfo = returnUserInfo(token);
      if (!userInfo || !userInfo.id || !userInfo.role) {
        dispatch(authMessageClear());
        return;
      }
      dispatch(setCredentials({ token }));
      toast.success(success);
      setStatus({ email: "", password: "" });
      router.push(userInfo.status === "active" ? "/seller" : "/seller/profile");
      dispatch(authMessageClear());
    }
  }, [error, success, dispatch, router, token]);

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
          disabled={loading || !status.email || !status.password}
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5 mx-auto" />
          ) : (
            "Login"
          )}
        </Button>
        <div className="flex items-center text-xs font-semibold mb-3 gap-3 justify-center">
          <p>
            Already Have An Account ?{" "}
            <Link
              href="/seller/register"
              className="text-blue-500 hover:underline"
            >
              SignUp Here
            </Link>
          </p>
        </div>
        <div className="w-full flex justify-center items-center mb-3">
          <div className="w-[45%] bg-slate-700 h-px"></div>
          <div className="w-[10%] flex justify-center items-center">
            <span className="pb-1">Or</span>
          </div>
          <div className="w-[45%] bg-slate-700 h-px"></div>
        </div>
        <div className="flex justify-center items-center gap-3">
          <div className="w-8.75 h-8.75 flex rounded-md bg-orange-700 shadow-lg hover:shadow-orange-700/50 justify-center cursor-pointer items-center overflow-hidden">
            <span>
              <AiOutlineGooglePlus />
            </span>
          </div>
          <div className="w-8.75 h-8.75 flex rounded-md bg-indigo-700 shadow-lg hover:shadow-indigo-700/50 justify-center cursor-pointer items-center overflow-hidden">
            <span>
              <FiFacebook />
            </span>
          </div>
          <div className="w-8.75 h-8.75 flex rounded-md bg-cyan-700 shadow-lg hover:shadow-cyan-700/50 justify-center cursor-pointer items-center overflow-hidden">
            <span>
              <CiTwitter />
            </span>
          </div>
          <div className="w-8.75 h-8.75 flex rounded-md bg-purple-700 shadow-lg hover:shadow-purple-700/50 justify-center cursor-pointer items-center overflow-hidden">
            <span>
              <AiOutlineGithub />
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SellerLoginForm;
