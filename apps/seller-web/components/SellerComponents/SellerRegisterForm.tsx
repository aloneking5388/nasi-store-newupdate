"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { returnRole } from "@/utils/authUtils";
import { Label } from "@radix-ui/react-label";
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
  seller_register,
  setCredentials,
} from "@/store/Auth/authSlice";

const SellerRegisterForm = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loader, errorMessage, successMessage, token } = useAppSelector(
    (state) => state.auth,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState({
    name: "",
    email: "",
    password: "",
    method: "email",
  });

  const inputHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(seller_register(state));
  };

  useEffect(() => {
    if (successMessage && token) {
      localStorage.setItem("accessToken", token);
      const role = returnRole(token);
      dispatch(setCredentials({ token, role }));
      toast.success(successMessage);
      dispatch(authMessageClear());
      setState({ name: "", email: "", password: "", method: "email" });
      router.push("/seller");
    } else if (errorMessage) {
      toast.error(errorMessage);
      dispatch(authMessageClear());
    }
  }, [successMessage, errorMessage, dispatch, router, token]);

  return (
    <div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-[#d0d2d6]">
            Name
          </Label>
          <Input
            type="name"
            name="name"
            id="name"
            placeholder="Enter your name"
            value={state.name}
            onChange={inputHandle}
            required
            className="mt-1"
          />
        </div>
        <div className="flex flex-col gap-1 mb-4">
          <Label htmlFor="email" className="text-[#d0d2d6]">
            Email
          </Label>
          <Input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={state.email}
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
            value={state.password}
            onChange={inputHandle}
            required
            className="mt-1"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 cursor-pointer text-xl text-slate-400"
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600"
          disabled={loader || !state.email || !state.password}
        >
          {loader ? (
            <Loader2 className="animate-spin w-5 h-5 mx-auto" />
          ) : (
            "SignUp"
          )}
        </Button>
        <div className="flex items-center text-xs font-semibold mb-3 gap-3 justify-center">
          <p>
            Already Have An Account ?{" "}
            <Link
              href="/seller/login"
              className="text-blue-500 hover:underline"
            >
              Login Here
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

export default SellerRegisterForm;
