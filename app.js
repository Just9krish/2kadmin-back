const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('morgan');
const ErrorMiddleware = require('./middleware/error');
const ErrorHandler = require('./utils/errorHandler');
const app = express();

// if (process.env.NODE_ENV !== 'PRODUCTION') {
//   require('dotenv').config({
//     path: './config/.env',
//   });
// }

app.use(express.json());
// Allow requests from the specified frontend domain
app.use(cors());
app.use(logger('dev'));
app.use('/', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Import routes
const admin = require('./routes/admin.routes');
const user = require('./routes/user.routes');
const transaction = require('./routes/transaction.routes');

// default check route
app.get('/', (_, res) => {
  res.send('API Running');
});

// Routes
app.use('/api/v1/admin', admin);
app.use('/api/v1/users', user);
app.use('/api/v1/transactions', transaction);

// Catch-all route handler for unmatched routes
app.use((req, res, next) => {
  throw new ErrorHandler(`Can't find ${req.originalUrl} on this server!`, 404);
});

// If error
app.use(ErrorMiddleware);

module.exports = app;
