import { IncomingMessage, ServerResponse } from 'http';

type RouteHandler = (req: IncomingMessage, res: ServerResponse, params?: Record<string, string>) => void;

export type NextFunction = () => void;

export type Middleware = (req: IncomingMessage, res: ServerResponse, next: NextFunction) => void;

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
    const path = decodeURIComponent(url.pathname);

    const routeEntries = this.routes.get(method);
    if (!routeEntries) {
      this.sendResponse(res, 404, { error: 'Route not found' });
      return;
    }

    for (const [routePath, { handler, middlewares, regex }] of routeEntries.entries()) {
      const match = regex.exec(path);

      if (match) {
        const params: Record<string, string> = {};

        if (regex.exec(path)?.groups) {
          Object.assign(params, match.groups);
        } else {
          const paramNames = Array.from(routePath.matchAll(/:([^/]+)/g)).map(m => m[1]);
          const paramValues = match.slice(1);

          paramNames.forEach((name, index) => {
            params[name] = paramValues[index];
          });
        }

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