const { start_server } = require('./server');
require('./config/environment')
// dbService().start().then(() => {
  start_server();
// });
