
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const expressPino = require('express-pino-logger');
const { logging } = require('./helper/logging');
const expressLogger = expressPino({ logging });
const { MaxFileSizeMB } = require('./helper/constants');
const apiRoutes = require("./api");


const app = express();


exports.start_server = async () => {
    try {
      app.use(expressLogger);
      morgan.token('body', (req, res) => JSON.stringify(req.body));
      app.use(morgan('[:date[clf]] :remote-addr - :method :url :status :response-time ms - :body'));
  
      app.use(express.json({ limit: MaxFileSizeMB }));
      app.use(express.urlencoded({ limit: MaxFileSizeMB, extended: true }));
      app.use(express.static(path.join(__dirname, 'public')));
      app.use(cors());

  
      app.use('/api', apiRoutes);
      app.get('/health', function (req, res) {
        return res.send('Ok, Working fine.');
      });
  
      app.listen(process.env.PORT || 5000, function (error) {
        if (error) {
          logging.error('An error occured while staring node app', error);
          return;
        }
        logging.info('Server started on ' + process.env.PORT || 5000);
      });
    } catch (error) {
      logging.error(`Error Occured! - start_server - ${error}`);
      logging.error(`Error stack - start_server - ${error.stack}`);
    }
  };

