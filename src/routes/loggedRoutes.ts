import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import { LoggedController } from '../controllers/LoggedController';
import axios from 'axios';

const loggedRoute = Router();

const __dirname = path.resolve();

const dashboardEJS = path.join(__dirname, '/src/views/dashboard.ejs');

const useLoggedController = new LoggedController();

loggedRoute.get('/testAPI/:idAccount', async (req: Request, res: Response) => {
    const { idAccount } = req.params;

    const myAxios = axios.put(`http://localhost:5000/editaccount/${idAccount}`, { username: 'teste', email: 'teste@gmail.com' })
        .then(response => {
            return res.json({
                returnFromAPI: {
                    message: response.data.message,
                    statusNumber: response.status,
                    statusText: response.statusText
                }
            });
        })
        .catch(error => {
            return res.json({
                returnFromAPI: {
                    message: error.message,
                    code: error.code
                }
            });
        });

});

loggedRoute.get('/dashboard', useLoggedController.showAllAccounts, (req: Request, res: Response) => {
});

loggedRoute.get('/myaccount/:idAccount', useLoggedController.showMyAccount, (req: Request, res: Response) => {
});

loggedRoute.get('/deleteaccount/:idAccount', (req: Request, res: Response) => {
    res.json({
        message: 'Rota para deletar um Usuário. Utilize algum manipulador de HTTP para efetuar o DELETE..'
    });
});

loggedRoute.delete('/deleteaccount/:idAccount', useLoggedController.deleteAccount, (req: Request, res: Response) => {
});

loggedRoute.get('/editaccount/:idAccount', (req: Request, res: Response) => {
    res.json({
        message: 'Rota para editar um Usuário. Utilize algum manipulador de HTTP para efetuar o POST.',
        toUse: 'Preencha o body com um Objeto e as seguintes propriedades, que serão, por fim, editadas na conta: username, email e password. OBS: Todas as opções são opcionais.'
    });
});

loggedRoute.put('/editaccount/:idAccount', useLoggedController.editAccount, (req: Request, res: Response) => {
});

export default loggedRoute;