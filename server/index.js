const express = require('express');
const morgan = require('morgan');
const requestId = require('express-request-id')();
const bodyParser = require('body-parser')

const logger = require('./config/logger');
const api = require('./api/v1');


//Init app
const app=express();

//Setup middleware
app.use(requestId);
app.use(logger.requests);

//Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

//Setup router and routes
app.use('/api', api);
app.use('/api/v1', api);

app.use
    (morgan('combined', {stream: {write: (message) => logger.info(message) } })
    );

app.get('/', (req, res, next) => {
    res.json({
        message: 'Welcome to the API'
    });
});

//No route found handler
app.use((req, res, next) => {
    next({
        message: 'Route not found',
        statusCode: 404,
        level: 'warn'
    });
});

// Error handler
app.use((err, req, res, next) => {
    const { message, statusCode = 500, level= 'error' } = err;
    const log = `${logger.header(req)} ${statusCode} ${message}`;

    logger[level](log);

    res.status(statusCode);
    res.json({
        message,
    });
});

module.exports = app;