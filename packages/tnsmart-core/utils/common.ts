export const isServer = typeof window === "undefined";

export const encodePhoneNumber = (phone: string) => {
  if (!phone) return "";
  return phone.replace(/^0/g, "+84-");
};
