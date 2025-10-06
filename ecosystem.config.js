module.exports = {
  apps: [
    {
      name: 'trevel-backend',
      script: 'src/main.ts',
      cwd: '/www/wwwroot/hurparvaz.com/api',
      interpreter: 'ts-node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'file:/www/wwwroot/hurparvaz.com/database/prod.db'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'file:/www/wwwroot/hurparvaz.com/database/prod.db'
      },
      error_file: '/www/wwwroot/hurparvaz.com/logs/err.log',
      out_file: '/www/wwwroot/hurparvaz.com/logs/out.log',
      log_file: '/www/wwwroot/hurparvaz.com/logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist', 'database'],
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};

