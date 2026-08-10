'use client';
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { returnUserInfo } from "@/utils/authUtils";
import { setCredentials } from "@/store/Auth/authSlice";

const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("accessToken");

    if (!token) {
      dispatch(setCredentials({ token: "" }));
      return;
    }

    const userInfo = returnUserInfo(token);
    if (userInfo && userInfo.id) {
      dispatch(setCredentials({ token }));
    } else {
      localStorage.removeItem("accessToken");
      dispatch(setCredentials({ token: "" }));
    }
  }, []);

  return null;
};

export default AuthInitializer;