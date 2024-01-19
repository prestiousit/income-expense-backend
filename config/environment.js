const { config } = require('dotenv');
config({ path: '.env' });

module.exports = {
    config
    // port : process.env.PORT
};
