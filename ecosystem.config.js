module.exports = {
  apps: [
    {
      name: 'payotp',
      script: 'node_modules/.bin/next',
      args: 'start --port 3000',
      cwd: '/var/www/payotp',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Set these in .env or system environment:
        // JWT_SECRET: 'your-random-secret-here',
      },
      error_file: '/var/log/payotp/error.log',
      out_file: '/var/log/payotp/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
