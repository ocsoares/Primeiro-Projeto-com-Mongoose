import { Router, Request, Response } from 'express'
import path from 'path';
import { RegisterLoginController } from '../controllers/RegisterLoginController';

const registerLoginRoute = Router();

const __dirname = path.resolve();

const registerLoginEJS = path.join(__dirname, '/src/views/register-login.ejs');

const useRegisterLoginController = new RegisterLoginController();

registerLoginRoute.get('/account', (req: Request, res: Response) => {
    res.render(registerLoginEJS);
})

registerLoginRoute.post('/account', useRegisterLoginController.registerOrLogin, (req: Request, res: Response) => {
})

export default registerLoginRoute;