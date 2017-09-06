var env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
  var config = require('./config.json');
  var currConfig = config[env];

  Object.keys(currConfig).forEach((key) => {
    process.env[key] = currConfig[key];
  });
}
