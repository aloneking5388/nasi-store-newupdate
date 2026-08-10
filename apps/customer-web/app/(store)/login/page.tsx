"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import FadeLoader from "react-spinners/FadeLoader";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Link from "next/link";
import {
  authMessageClear,
  customer_login,
  setCredentials,
} from "@/store/Auth/authSlice";
import OAuthButtons from "@/components/StoreComponents/OAuthButtons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { returnRole } from "@/utils/authUtils";

const LoginPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { loader, successMessage, errorMessage, token } = useAppSelector(
    (state) => state.auth,
  );
  const returnUrl = searchParams?.get("returnUrl");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState({
    email: "",
    password: "",
  });

  const inputHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(customer_login(state));
  };

  useEffect(() => {
    if (successMessage && token) {
      localStorage.setItem("accessToken", token);
      const role = returnRole(token);
      dispatch(setCredentials({ token, role }));
      toast.success(successMessage);
      dispatch(authMessageClear());
      setState({
        email: "",
        password: "",
      });
      if (returnUrl && returnUrl.startsWith("/")) {
        router.push(returnUrl);
      } else {
        router.push("/dashboard");
      }
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(authMessageClear());
      setState({
        email: "",
        password: "",
      });
    }
  }, [successMessage, errorMessage, token, router, dispatch, returnUrl]);

  return (
    <div>
      {loader && (
        <div className="w-screen h-screen flex justify-center items-center fixed left-0 top-0 bg-[#38303033] z-999">
          <FadeLoader />
        </div>
      )}
      <div className="bg-slate-200 mt-4">
        <div className="max-w-360 mx-auto px-5 lg:px-16 md:px-12 justify-center items-center md:p-10 p-5">
          <div className="grid lg:grid-cols-2 grid-cols-1 md:grid-cols-1 w-full md:w-full sm:w-full mx-auto bg-white rounded-md">
            <div className="px-8 py-8 md-lg:w-full md:w-full sm:w-full">
              <h2 className="text-center w-full text-xl text-slate-600 font-bold">
                Login
              </h2>
              <div>
                <form onSubmit={login} className="text-slate-600">
                  <div className="flex flex-col gap-1 mb-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      onChange={inputHandle}
                      value={state.email}
                      type="email"
                      className="w-full px-3 py-2 border border-slate-200 outline-none focus:border-indigo-500 rounded-md"
                      id="email"
                      name="email"
                      placeholder="email"
                    />
                  </div>
                  <div className="flex flex-col gap-1 mb-4 relative">
                    <Label htmlFor="password">Passoword</Label>
                    <Input
                      onChange={inputHandle}
                      value={state.password}
                      type={showPassword ? "text" : "password"}
                      className="w-full px-3 py-2 border border-slate-200 outline-none focus:border-indigo-500 rounded-md"
                      id="password"
                      name="password"
                      placeholder="password"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-7 cursor-pointer text-xl text-slate-600"
                    >
                      {showPassword ? (
                        <AiOutlineEyeInvisible />
                      ) : (
                        <AiOutlineEye />
                      )}
                    </span>
                  </div>
                  <Button className="px-8 w-full py-2 bg-purple-500 shadow-lg hover:shadow-indigo-500/30 text-white rounded-md">
                    {loader ? <Loader2 className="animate-spin" /> : "Login"}
                  </Button>
                </form>
                <div className="flex justify-center items-center py-2">
                  <div className="h-px bg-slate-300 w-[95%]"></div>
                  <span className="px-3 text-slate-600">or</span>
                  <div className="h-px bg-slate-300 w-[95%]"></div>
                </div>
                <OAuthButtons
                  redirectTo={
                    returnUrl && returnUrl.startsWith("/")
                      ? returnUrl
                      : "/dashboard"
                  }
                />
              </div>
              <div className="text-center text-slate-600 pt-1">
                <p>
                  You have no account?{" "}
                  <Link className="text-blue-500" href="/register">
                    {" "}
                    Register
                  </Link>{" "}
                </p>
              </div>
            </div>
            <div className="md:w-full md:h-full py-4 pr-4 md:block hidden">
              <Image
                className="flex justify-center items-center mx-auto w-150 h-95"
                src="/images/login.jpg"
                alt="login"
                width={600}
                height={380}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  return (
    <Suspense fallback={<div className="bg-slate-200 mt-4 min-h-50" />}>
      <LoginPageContent />
    </Suspense>
  );
};

export default LoginPage;
