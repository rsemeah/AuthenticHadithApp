// Dynamic config — extends app.json and injects EAS secrets at build time
const appJson = require('./app.json');

module.exports = ({ config }) => {
  return {
    ...config,
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      // RevenueCat keys — set via: eas secret:create --name REVENUECAT_IOS_KEY --value appl_...
      revenueCatApiKeyIos: process.env.REVENUECAT_IOS_KEY || '',
      revenueCatApiKeyAndroid: process.env.REVENUECAT_ANDROID_KEY || '',
    },
  };
};
