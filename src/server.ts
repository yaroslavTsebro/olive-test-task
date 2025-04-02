import http from 'node:http';
import RouteManager from './routes/route-manager';
import logger from './system/logger';
import router from './system/router';
import config from './system/configs/config.service';

export function createServer() {
  const routeManager = new RouteManager();

  routeManager.initializeRoutes();

  const server = http.createServer((req, res) => {
    router.handle(req, res);
  });

  server.listen(config.port, config.host, () => {
    logger.info(`App is running on ${config.host}:${config.port}`);
  });
}