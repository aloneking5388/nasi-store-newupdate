export type CustomerType = "normal" | "subscription";

type CustomerLike = {
  customerType?: CustomerType | null;
  referredBy?: unknown;
  invested?: number;
  referralCount?: number;
  earnings?: number;
};

export const resolveCustomerType = (
  customer?: CustomerLike | null,
): CustomerType => {
  if (customer?.customerType === "normal") return "normal";
  if (customer?.customerType === "subscription") return "subscription";

  if (
    customer?.referredBy ||
    (customer?.invested ?? 0) > 0 ||
    (customer?.referralCount ?? 0) > 0 ||
    (customer?.earnings ?? 0) > 0
  ) {
    return "subscription";
  }

  return "normal";
};
