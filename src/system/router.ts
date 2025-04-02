import { IncomingMessage, ServerResponse } from 'http';

type RouteHandler = (req: IncomingMessage, res: ServerResponse, params?: Record<string, string>) => void;
type Middleware = (req: IncomingMessage, res: ServerResponse, next: Function) => void;

type RouteMap = Map<string, Map<string, { handler: RouteHandler, middlewares: Middleware[], regex: RegExp }>>;

const pathToRegex = (path: string) => new RegExp(
  `^${path.replace(/:([^/]+)/g, '(?<$1>[^/]+)')}$`
);

class Router {
  private routes: RouteMap;
  private globalMiddlewares: Middleware[];

  constructor() {
    this.routes = new Map();
    this.globalMiddlewares = [];
  }

  public use(middleware: Middleware): void {
    this.globalMiddlewares.push(middleware);
  }

  public addRoute(method: string, path: string, handler: RouteHandler, middlewares: Middleware[] = []): void {
    if (!this.routes.has(method)) {
      this.routes.set(method, new Map());
    }

    const routeRegex = pathToRegex(path);
    this.routes.get(method)?.set(path, { handler, middlewares, regex: routeRegex });
  }

  public get(path: string, handler: RouteHandler, middlewares: Middleware[] = []): void {
    this.addRoute('GET', path, handler, middlewares);
  }

  public post(path: string, handler: RouteHandler, middlewares: Middleware[] = []): void {
    this.addRoute('POST', path, handler, middlewares);
  }

  public put(path: string, handler: RouteHandler, middlewares: Middleware[] = []): void {
    this.addRoute('PUT', path, handler, middlewares);
  }

  public delete(path: string, handler: RouteHandler, middlewares: Middleware[] = []): void {
    this.addRoute('DELETE', path, handler, middlewares);
  }

  public handle(req: IncomingMessage, res: ServerResponse): void {
    const method = req.method || '';
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const path = url.pathname;

    const routeEntries = this.routes.get(method);
    if (!routeEntries) {
      this.sendResponse(res, 404, { error: 'Route not found' });
      return;
    }

    for (const [routePath, { handler, middlewares, regex }] of routeEntries.entries()) {
      const match = path.match(regex);

      if (match) {
        const params = match.groups || {};
        (req as any).params = params;

        let middlewareIndex = 0;
        const next = () => {
          if (middlewareIndex < middlewares.length) {
            const middleware = middlewares[middlewareIndex++];
            middleware(req, res, next);
          } else {
            handler(req, res, params);
          }
        };

        if (this.globalMiddlewares.length > 0) {
          let index = 0;
          const globalNext = () => {
            if (index < this.globalMiddlewares.length) {
              const middleware = this.globalMiddlewares[index++];
              middleware(req, res, globalNext);
            } else {
              next();
            }
          };
          globalNext();
        } else {
          next();
        }

        return;
      }
    }

    this.sendResponse(res, 404, { error: 'Route not found' });
  }

  private sendResponse(res: ServerResponse, statusCode: number, message: object): void {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(message));
  }
}

export default new Router();