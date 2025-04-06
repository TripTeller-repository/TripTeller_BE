module.exports = {
  apps: [
    {
      name: 'tripteller',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
