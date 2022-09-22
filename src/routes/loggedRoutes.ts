import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import { LoggedController } from '../controllers/LoggedController';

const loggedRoute = Router();

const __dirname = path.resolve();

const dashboardEJS = path.join(__dirname, '/src/views/dashboard.ejs');

const useLoggedController = new LoggedController();

loggedRoute.get('/dashboard', useLoggedController.showAllAccounts, (req: Request, res: Response) => {
    // res.render(dashboardEJS);
})

loggedRoute.get('/deleteaccount/:idAccount', (req: Request, res: Response ) => {
    res.json({
        message: 'Rota para deletar um Usuário. Utilize algum manipulador de HTTP para efetuar o POST.'
    })
})

loggedRoute.post('/deleteaccount/:idAccount', useLoggedController.deleteAccount, (req: Request, res: Response) => {
})

loggedRoute.get('/editaccount/:idAccount', (req: Request, res: Response) => {
    res.json({
        message: 'Rota para editar um Usuário. Utilize algum manipulador de HTTP para efetuar o POST.',
        toUse: 'Preencha o body com um Objeto e as seguintes propriedades, que serão, por fim, editadas na conta: username, email e password. OBS: Todas as opções são opcionais.'
    })
})

loggedRoute.post('/editaccount/:idAccount', useLoggedController.editAccount, (req: Request, res: Response) => {
})

export default loggedRoute;