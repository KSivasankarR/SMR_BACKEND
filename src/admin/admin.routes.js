const handler = require('./admin.handler');

exports.routesConfig = (app) => {
    app.post('/api/v1/admin', [handler.signIn]);
}