export const getHostName = (ctx: any = null) => {
  if (ctx && ctx.isServer) {
    return ctx?.req?.headers["host"];
  }
  if (typeof window !== "undefined") {
    return window.location.hostname;
  }
  return "";
};
