module.exports = {
  apps : [{
    name: 'Ritill - Stackedit',
    exec_interpreter: "~/.nvm/versions/node/v10.12.0/bin/node",
    script: '.',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
      user : 'halldor',
      host : '134.209.20.39',
      ref  : 'origin/master',
      repo : 'git@github.com:halldorel/stackedit.git',
      path : '/var/www/stackedit',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
