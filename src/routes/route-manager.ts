import router from '../system/router'
import fileController from '../controllers/file.controller'
import { validateContentTypeMiddleware } from '../middlewares/validate-content-type';
import { multipartParser } from '../middlewares/multipart-parser';

class RouteManager {

    public initializeRoutes() {
        router.post('/files', fileController.upload.bind(fileController), [multipartParser, validateContentTypeMiddleware]);
        router.put('/files/:key', fileController.replace.bind(fileController), [multipartParser, validateContentTypeMiddleware]);
        router.get('/files/:key', fileController.retrieve.bind(fileController));
        router.delete('/files/:key', fileController.delete.bind(fileController));
    }
}

export default RouteManager;
