// lib/momo.ts
import axios from "axios";

const momoBaseURL = "https://sandbox.momodeveloper.mtn.com";
const momoHttp = axios.create({
  baseURL: momoBaseURL,
  timeout: 15000,
});

const getMomoConfig = () => {
  const subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY;
  const apiUser = process.env.MOMO_API_USER;
  const apiKey = process.env.MOMO_API_KEY;

  if (!subscriptionKey || !apiUser || !apiKey) {
    throw new Error("MoMo credentials are missing in environment variables");
  }

  return { subscriptionKey, apiUser, apiKey };
};

export const getAccessToken = async () => {
  const { subscriptionKey, apiUser, apiKey } = getMomoConfig();
  const res = await momoHttp.post(
    "/collection/token/",
    {},
    {
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        Authorization: `Basic ${Buffer.from(`${apiUser}:${apiKey}`).toString("base64")}`,
      },
    },
  );
  return res.data.access_token;
};

export const checkPaymentStatus = async (
  referenceId: string,
  token: string,
) => {
  const { subscriptionKey } = getMomoConfig();
  const res = await momoHttp.get(
    `/collection/v1_0/requesttopay/${referenceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Target-Environment": "sandbox",
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
    },
  );
  return res.data as { status: "SUCCESSFUL" | "FAILED" | "PENDING" };
};

export const requestToPay = async ({
  amount,
  externalId,
  phone,
  token,
}: {
  amount: string;
  externalId: string;
  phone: string;
  token: string;
}) => {
  const { subscriptionKey } = getMomoConfig();
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Invalid payment amount");
  }

  const uuid = crypto.randomUUID();
  const res = await momoHttp.post(
    "/collection/v1_0/requesttopay",
    {
      amount: numericAmount.toFixed(0),
      currency: "UGX",
      externalId,
      payer: {
        partyIdType: "MSISDN",
        partyId: phone,
      },
      payerMessage: "Payment for goods",
      payeeNote: "Thank you for your purchase",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": uuid,
        "X-Target-Environment": "sandbox",
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Content-Type": "application/json",
      },
    },
  );
  return { uuid, res: res.data };
};
