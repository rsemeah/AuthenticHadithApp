const IS_PROD = process.env.APP_ENV === "production";

/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    revenueCatApiKey: process.env.REVENUECAT_IOS_KEY || "",
  },
});
