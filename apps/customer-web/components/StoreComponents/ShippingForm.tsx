"use client";

import { get_user_info } from "@/store/Auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useRef, useState } from "react";
import { Dispatch, SetStateAction } from "react"; // Import Dispatch and SetStateAction

// Define the props interface
interface ShippingFormProps {
  state: {
    name: string;
    address: string;
    phone: string;
    post: string;
    province: string;
    city: string;
    area: string;
  };
  setState: Dispatch<
    SetStateAction<{
      name: string;
      address: string;
      phone: string;
      post: string;
      province: string;
      city: string;
      area: string;
    }>
  >;
}

const ShippingForm = ({ state, setState }: ShippingFormProps) => {
  const dispatch = useAppDispatch();
  const { userInfo, token, role } = useAppSelector((state) => state.auth);
  const [res, setRes] = useState(false);
  const hasRequestedProfileRef = useRef(false);

  const inputHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { name, address, phone, post, province, city, area } = state;
    if (name && address && phone && post && province && city && area) {
      setRes(true);
    }
  };

  useEffect(() => {
    if (
      userInfo?.shippingInfo &&
      Object.keys(userInfo.shippingInfo).length > 0
    ) {
      setRes(true);
      setState({
        name: userInfo?.name || "",
        address: userInfo.shippingInfo.address || "",
        phone: userInfo.shippingInfo.phone || "",
        post: userInfo.shippingInfo.post || "",
        province: userInfo.shippingInfo.province || "",
        city: userInfo.shippingInfo.city || "",
        area: userInfo.shippingInfo.area || "",
      });
    }
  }, [userInfo?.shippingInfo, setState]);

  useEffect(() => {
    const hasSavedShipping =
      userInfo?.shippingInfo && Object.keys(userInfo.shippingInfo).length > 0;

    if (
      !token ||
      role !== "user" ||
      !userInfo?.id ||
      hasSavedShipping ||
      hasRequestedProfileRef.current
    ) {
      return;
    }

    hasRequestedProfileRef.current = true;
    dispatch(get_user_info());
  }, [dispatch, role, token, userInfo?.id, userInfo?.shippingInfo]);

  return (
    <div className="bg-white p-6 shadow-sm rounded-md">
      {!res && (
        <>
          <h2 className="text-slate-600 font-bold pb-3">
            Shipping Information
          </h2>
          <form onSubmit={save}>
            <div className="flex max-md:flex-col md:gap-2 w-full gap-5 text-slate-600">
              <div className="flex flex-col max-sm:text-sm gap-1 mb-2 w-full">
                <label htmlFor="name">Name</label>
                <input
                  onChange={inputHandle}
                  value={state.name}
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 outline-none focus:border-indigo-500 rounded-md"
                  name="name"
                  placeholder="name"
                  id="name"
                />
              </div>
              <div className="flex flex-col max-sm:text-sm gap-1 mb-2 w-full">
                <label htmlFor="address">Address</label>
                <input
                  onChange={inputHandle}
                  value={state.address}
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 outline-none focus:border-indigo-500 rounded-md"
                  name="address"
                  placeholder="House no / building / street /area"
                  id="address"
                />
              </div>
            </div>
            <div className="flex max-md:flex-col max-sm:text-sm md:gap-2 w-full gap-5 text-slate-600">
              <div className="flex flex-col gap-1 mb-2 w-full">
                <label htmlFor="phone">Phone</label>
                <input
                  onChange={inputHandle}
                  value={state.phone}
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 outline-none focus:border-indigo-500 rounded-md"
                  name="phone"
                  placeholder="phone"
                  id="phone"
                />
              </div>
              <div className="flex flex-col max-sm:text-sm gap-1 mb-2 w-full">
                <label htmlFor="post">Post</label>
                <input
                  onChange={inputHandle}
                  value={state.post}
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 outline-none focus:border-indigo-500 rounded-md"
                  name="post"
                  placeholder="post"
                  id="post"
                />
              </div>
            </div>
            <div className="flex max-md:flex-col max-sm:text-sm md:gap-2 w-full gap-5 text-slate-600">
              <div className="flex flex-col gap-1 mb-2 w-full">
                <label htmlFor="province">Province</label>
                <input
                  onChange={inputHandle}
                  value={state.province}
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 outline-none focus:border-indigo-500 rounded-md"
                  name="province"
                  placeholder="province"
                  id="province"
                />
              </div>
              <div className="flex flex-col max-sm:text-sm gap-1 mb-2 w-full">
                <label htmlFor="city">City</label>
                <input
                  onChange={inputHandle}
                  value={state.city}
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 outline-none focus:border-indigo-500 rounded-md"
                  name="city"
                  placeholder="city"
                  id="city"
                />
              </div>
            </div>
            <div className="flex max-md:flex-col max-sm:text-sm md:gap-2 w-full gap-5 text-slate-600">
              <div className="flex flex-col gap-1 mb-2 w-full">
                <label htmlFor="area">Area</label>
                <input
                  onChange={inputHandle}
                  value={state.area}
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 outline-none focus:border-indigo-500 rounded-md"
                  name="area"
                  placeholder="area"
                  id="area"
                />
              </div>
              <div className="flex flex-col max-sm:text-sm gap-1 max-sm:mt-3 mt-8 w-full">
                <button className="px-3 py-1.5 rounded-sm hover:shadow-indigo-500/20 hover:shadow-lg bg-indigo-500 text-white">
                  Save
                </button>
              </div>
            </div>
          </form>
        </>
      )}
      {res && (
        <div className="flex flex-col gap-1">
          <h2 className="text-slate-600 font-semibold pb-2">
            Deliver to {state.name}
          </h2>
          <p>
            <span className="bg-blue-200 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
              Home
            </span>
            <span className="text-slate-600 text-sm">
              {state.address} {state.province} {state.city} {state.area}
            </span>
            <span
              onClick={() => setRes(false)}
              className="text-indigo-500 cursor-pointer"
            >
              change
            </span>
          </p>
          <p className="text-slate-600 text-sm">Email to {userInfo?.email}</p>
        </div>
      )}
    </div>
  );
};

export default ShippingForm;
