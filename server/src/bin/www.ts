/**
 * Module dependencies.
 */
import http = require('http');

import { logger } from '../controllers/logger.service';
import { App } from '../app';
import { db } from '../controllers/db.service';

init().catch(console.error.bind(console));

async function init(): Promise<void> {
  let express = new App();
  await express.mainStartupSequence();

  /**
   * Get port from environment and store in Express.
   */
  const port = normalizePort(process.env.PORT || 3000);
  express.app.set('port', port);

  /**
   * Create HTTP server.
   */
  const server = http.createServer(express.app);

  /**
   * Listen on provided port, on all network interfaces.
   */
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

  process.stdin.resume();
  process.on('SIGINT', exitHandler.bind(null, { cleanup: true }));
  process.on('uncaughtException', exitHandler.bind(null, { cleanup: true }));
  process.on('unhandledRejection', function(reason, p) {
    console.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
  });

  /**
   * Normalize a port into a number, string, or false.
   */
  function normalizePort(val: any): boolean | number {

    const normalizedPort = parseInt(val, 10);

    if (isNaN(normalizedPort)) {
      // named pipe
      return val;
    }

    if (normalizedPort >= 0) {
      // port number
      return normalizedPort;
    }

    return false;
  }

  /**
   * Event listener for HTTP server 'error' event.
   */
  function onError(error: any): void {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        logger.error(bind + ' requires elevated privileges');
        throw error;
      case 'EADDRINUSE':
        logger.error(bind + ' is already in use');
        throw error;
      default:
        throw error;
    }
  }

  /**
   * Event listener for HTTP server 'listening' event.
   */
  function onListening(): void {
    const addr = server.address();
    const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    logger.info('Listening on ' + bind);
  }

  /**
   * Function that gets executed when the app shuts down
   */
  function exitHandler(options: Object, err: any): void {
    // Ensure the app shuts down when there is an exception during shutdown
    process.on('uncaughtException', () => {
      process.exit(0);
    });
    if (options['cleanup']) {
      logger.info('Got shutdown command, executing cleanup tasks.');
      let cleanup = function (done: Function): void {
        // Destroy all sessions on server shutdown
        express.sessionStore.clear((sessionStoreError) => {
          if (sessionStoreError) {
            logger.error('Error while clearing session store');
            logger.error(sessionStoreError);
          } else {
            logger.info('Session store closed');
          }
          // Close Sequelize DB pool
          db.seq.close();
          // Close DB connection after session store is done
          db.get().end((databaseError) => {
            if (databaseError) {
              logger.error('Error while closing Database connection');
              logger.error(databaseError);
            } else {
              logger.info('Database connection closed');
            }
            return done();
          });
        });
      };
      cleanup(function (): void {
        logger.info('Cleanup tasks done');
        if (err) {
          logger.error('Shutdown was the result of an uncaught error, more details below');
          logger.error(err);
        } else {
          logger.info('Shutdown complete, goodbye!');
        }
        process.exit(0);
      });
    }
  }
}
