const express = require('express');
// This essentially provides the controllers for the routes
const apiv1 = require('../../../api/v0.1');

const cors = require('../../shared/middlewares/api/cors');

module.exports = function apiRoutes() {
    const apiRouter = express.Router();

    // alias delete with del
    apiRouter.del = apiRouter.delete;

    // ## CORS pre-flight check
    apiRouter.options('*', cors);

    // ## Configuration
    apiRouter.get('/configuration', apiv1.http(apiv1.configuration.read));

    return apiRouter;
};
