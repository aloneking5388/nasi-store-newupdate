"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useAppDispatch } from "@/store/hooks";
import {
  oauth_login,
  setCredentials,
  authMessageClear,
} from "@/store/Auth/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { AiOutlineGoogle } from "react-icons/ai";
import { FaFacebookF } from "react-icons/fa";
import toast from "react-hot-toast";

declare global {
  interface Window {
    FB?: {
      init: (opts: object) => void;
      login: (
        cb: (res: { authResponse?: { accessToken: string } }) => void,
        opts: object,
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

interface OAuthButtonsProps {
  redirectTo?: string;
}

const OAuthButtons = ({ redirectTo = "/dashboard" }: OAuthButtonsProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const fbLoaded = useRef(false);
  const { successMessage, errorMessage, token } = useAppSelector((s) => s.auth);

  // Load Facebook SDK once
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!appId || fbLoaded.current) return;
    fbLoaded.current = true;

    window.fbAsyncInit = () => {
      window.FB?.init({ appId, cookie: true, version: "v19.0" });
    };

    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (successMessage && token) {
      toast.success(successMessage);
      dispatch(authMessageClear());
      router.push(redirectTo);
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(authMessageClear());
    }
  }, [successMessage, errorMessage, token, dispatch, router, redirectTo]);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  const googleLogin = useGoogleLogin({
    onSuccess: ({ access_token }) => {
      // access_token is a bearer token, but for id_token we use the tokeninfo approach
      // Fetch id_token via userinfo and then verify server-side
      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
      })
        .then((r) => r.json())
        .then((profile) => {
          // Use sub + email + name directly from profile, pass access_token for server verification
          dispatch(oauth_login({ provider: "google", token: access_token }));
        })
        .catch(() => toast.error("Google login failed"));
    },
    onError: () => toast.error("Google login was cancelled"),
  });

  const facebookLogin = () => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!appId) {
      toast.error("Facebook login is not configured yet");
      return;
    }
    if (!window.FB) {
      toast.error("Facebook SDK not loaded. Try again.");
      return;
    }
    window.FB.login(
      (response) => {
        if (response.authResponse?.accessToken) {
          dispatch(
            oauth_login({
              provider: "facebook",
              token: response.authResponse.accessToken,
            }),
          );
        } else {
          toast.error("Facebook login was cancelled");
        }
      },
      { scope: "email,public_profile" },
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!googleClientId) {
            toast.error("Google login is not configured yet");
            return;
          }
          googleLogin();
        }}
        className="px-8 w-full py-2 bg-orange-500 shadow hover:shadow-orange-500/30 text-white rounded-md flex justify-center items-center gap-2 mb-3"
      >
        <AiOutlineGoogle />
        <span>Continue with Google</span>
      </button>
      <button
        type="button"
        onClick={facebookLogin}
        className="px-8 w-full py-2 bg-indigo-500 shadow hover:shadow-indigo-500/30 text-white rounded-md flex justify-center items-center gap-2 mb-3"
      >
        <FaFacebookF />
        <span>Continue with Facebook</span>
      </button>
    </>
  );
};

export default OAuthButtons;
