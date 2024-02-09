module.exports = {
  apps: [
    {
      name: "byteblaze",
      script: "dist/index.js",
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
