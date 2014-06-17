/**
 * @module shught
 */
'use strict';

var shught = require('./shught');



module.exports = function create(config) {
    var template, shut;

    config = config || {};
    template = config.template;
    shut = shught(config);

    return function shught(req, res, next) {

        function json() {
            res.send('Server is shutting down.');
        }

        function html() {
            template ? res.render(template) : json();
        }

        if (shut.state !== shut.State.CONNECTED) {
            res.status(503);
            res.setHeader('Connection', 'close');
            res.format({
                json: json,
                html: html
            });
            return;
        }

        shut.watch.apply(shut, arguments);
    }
};