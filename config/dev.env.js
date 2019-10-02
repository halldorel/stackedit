var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  GOOGLE_CLIENT_ID: '"411923424241-pn899vvjtpmevnr5bpq3dbscaan8u7rr.apps.googleusercontent.com"',
  GITHUB_CLIENT_ID: '"cbf0cf25cfd026be23e1"',
});

