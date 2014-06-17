'use strict';

var Rx = require('rx');
var debug = require('debuglog')('shught');


var proto = {

    State: {
        CONNECTED: 0,
        DISCONNECTING: 1,
        DISCONNECTED: 2
    },

    /**
     * Instruments application to await shutdown and respond accordingly.
     * @public
     * @param req
     * @param res
     * @param next
     */
    watch: function watch(req, res, next) {
        var server, address, observable;

        if (!this.app) {
            this.app = req.app;
            process.once('SIGTERM', this.close.bind(this));
            process.once('SIGINT', this.close.bind(this));
        }

        server = req.socket.server || req.socket.socket.server;
        if (server && this.servers.indexOf(server) === -1) {
            address = server.address();
            observable = Rx.Observable.fromEvent(server, 'close', function () { return address; }).take(1);
            this.observable = this.observable.concat(observable);
            this.servers.push(server);
        }

        next();
    },

    /**
     * @private
     */
    close: function close() {
        var self, app;

        if (this.state !== this.State.CONNECTED) {
            debug('Application already shutting down.');
            return;
        }

        debug('Closing %s server(s)', this.servers.length);
        this.state = this.State.DISCONNECTING;

        self = this;
        app = this.app;
        app.emit('shutdown');

        this.observable.timeout(this.timeout).subscribe(
            function next(address) {
                debug('Server %s:%d closed.', address.address, address.port);
            },
            function error(err) {
                debug(err.message.match(/Timeout/) ? 'Server close timed out.' : 'An error occurred while closing the server.', 'Exiting.');
                self.state = self.State.DISCONNECTED;
                app.emit('close');
                process.exit(1);
            },
            function complete() {
                debug('Application shutdown complete.');
                self.state = self.State.DISCONNECTED;
                app.emit('close');
            }
        );

        this.servers.forEach(function (server) {
            server.close();
        });
    }

};


module.exports = function create(config) {

    return Object.create(proto, {

        app: {
            value: null,
            enumerable: true,
            writable: true
        },

        servers: {
            value: [],
            enumerable: true
        },

        state: {
            value: proto.State.CONNECTED,
            enumerable: true,
            writable: true
        },

        observable: {
            value: Rx.Observable.empty(),
            enumerable: true,
            writable: true
        },

        timeout: {
            value: config.timeout || 10 * 1000,
            enumerable: true
        }

    });

};