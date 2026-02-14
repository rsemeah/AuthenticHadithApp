const IS_PROD = process.env.APP_ENV === "production";

/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    revenueCatApiKey: IS_PROD
      ? process.env.REVENUECAT_IOS_KEY
      : "test_gngYicqPNakjsEBKvUwfIlFHrUg",
  },
});
