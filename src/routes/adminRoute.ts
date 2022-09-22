import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import { AdminController } from '../controllers/AdminController';

const adminRoute = Router();

const __dirname = path.resolve();
const adminPanelEJS = path.join(__dirname, '/src/views/admin-panel.ejs');

const useAdminController = new AdminController();

adminRoute.get('/admin', (req: Request, res: Response) => {
    res.render(adminPanelEJS);
})

adminRoute.post('/admin', useAdminController.loginAdmin, (req: Request, res: Response) => {
})


export default adminRoute;