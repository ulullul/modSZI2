if (process.env.BROWSER) {
  throw new Error(
    'Do not import `config.js` from inside the client-side code.',
  );
}

const DEFAULT_PORT = 3000;

module.exports = {
  // Node.js app
  analytics: {
    // https://analytics.google.com/
    googleTrackingId: process.env.GOOGLE_TRACKING_ID, // UA-XXXXX-X
  },

  // https://expressjs.com/en/guide/behind-proxies.html
  api: {
    // API URL to be used in the client-side code
    clientUrl: process.env.API_CLIENT_URL || '',
    // API URL to be used in the server-side code
    serverUrl:
      process.env.API_SERVER_URL ||
      `http://localhost:${process.env.PORT || DEFAULT_PORT}`,
  },

  // API Gateway
  auth: {
    facebook: {
      id: process.env.FACEBOOK_APP_ID,
      secret: process.env.FACEBOOK_APP_SECRET,
    },

    // https://developers.facebook.com/
    google: {
      id: process.env.GOOGLE_CLIENT_ID,
      secret: process.env.GOOGLE_CLIENT_SECRET,
    },

    // https://cloud.google.com/console/project
    jwt: { secret: process.env.JWT_SECRET },

    // https://apps.twitter.com/
    twitter: {
      key: process.env.TWITTER_CONSUMER_KEY,
      secret: process.env.TWITTER_CONSUMER_SECRET,
    },
  },

  // Web analytics
  port: process.env.PORT || DEFAULT_PORT,

  // Authentication
  trustProxy: process.env.TRUST_PROXY || 'loopback',
};
