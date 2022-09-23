import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { Account } from '../models/Account';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const __dirname = path.resolve();

const dashboardEJS = path.join(__dirname, '/src/views/dashboard.ejs');
interface IAccountInfo {
    _id: ObjectId;
    id: String;
    username: string;
    email: string;
    password: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
}

export class LoggedController {
    async showAllAccounts(req: Request, res: Response, next: NextFunction) {
        const getAllAccounts = await Account.find(); // Percorre TODOS os Documentos !! << // OBS: No handdlebars precisa do .lean APÓS o .find() !! <<
        console.log('getAllAccounts:', getAllAccounts);

        res.render(dashboardEJS, { getAllAccounts });

        next();
    }

    async showMyAccount(req: Request, res: Response, next: NextFunction) {
        const { idAccount } = req.params;

        try {
            // Nesse caso, NÃO precisa converter o ID para ObjectID, porque o Mongoose faz isso Automaticamente !! <<
            const showMyAccount = await Account.findById(idAccount) as IAccountInfo;

            if (showMyAccount === null) {
                return res.json({
                    message: 'Não foi possível encontrar sua conta. Tente novamente.'
                });
            }

            return res.json({
                message: 'Sua conta foi encontrada com sucesso !',
                account: showMyAccount,
                currentUTC: {
                    createdAt: showMyAccount.createdAt.toLocaleString('pt-BR'),
                    updatedAt: showMyAccount.updatedAt.toLocaleString('pt-BR')
                }
            });

        }
        catch (error) {
            return res.json({
                message: 'Não foi possível encontrar sua conta. Tente novamente.'
            });
        }
    }

    async deleteAccount(req: Request, res: Response, next: NextFunction) {
        const { idAccount } = req.params;

        try {
            // Nesse caso, TEM QUE SER o _id como Propriedade e o ID como STRING no Valor !! <<
            const deleteAccount = await Account.deleteOne({ _id: idAccount });
            console.log('deleteAccount:', deleteAccount);

            if (deleteAccount.deletedCount === 0) {
                return res.status(400).json({
                    message: 'Não foi possível deletar a conta. Confira se o ID é válido e tente novamente.'
                });
            }

            return res.status(200).json({
                message: `O usuário com o ID ${idAccount} foi deletado com sucesso !`
            });
        }

        catch (error) {
            console.log(error);
            return res.status(400).json({
                message: 'Não foi possível deletar a conta. Confira se o ID é válido e tente novamente.'
            });
        }
    }

    async editAccount(req: Request, res: Response, next: NextFunction) {
        const { idAccount } = req.params;

        const { username, email, password } = req.body;

        if (!username && !email && !password) {
            return res.status(400).json({
                message: 'Edite algum dado.'
            });
        }

        try {
            // Aqui nesse caso tem DOIS ID acessáveis no Método;
            // id = ID em String
            // _id = ID em ObjectID !! << 
            const searchAccountByID = await Account.findById(idAccount) as IAccountInfo;

            if (searchAccountByID === null) {
                return res.status(400).json({
                    message: 'Não foi possível editar a conta. Confira se o ID é válido e tente novamente.'
                });
            }

            let encryptedPassword;

            // Fiz esse if para EVITAR que faça OUTRO Hash se a Senha for a MESMA !! <<
            if (password) {
                const checkIfPasswordAreEquals = await bcrypt.compare(password, searchAccountByID.password);
                console.log('SENHA ENCRYPT:', checkIfPasswordAreEquals);

                // Se for false, a Senha é DIFERENTE, então Encripta essa Senha !!
                if (checkIfPasswordAreEquals === false) {
                    const encryptPassword = await bcrypt.hash(password, 10);
                    console.log('SENHA ENCRYPT:', encryptPassword);

                    encryptedPassword = encryptPassword;
                    console.log('encryptedPassword no IF:', encryptedPassword);
                }

            }

            console.log('encryptedPassword FORA do if:', encryptedPassword);

            // Nesse caso, TEM QUE SER o _id como Propriedade e o ID como STRING no Valor !! <<
            const updateAccount = await Account.updateOne({ _id: idAccount }, {
                username: username ? username : searchAccountByID.username,
                email: email ? email : searchAccountByID.email,
                password: encryptedPassword ? encryptedPassword : searchAccountByID.password
            });

            console.log('UPDATE:', updateAccount);

            return res.status(200).json({
                message: 'Conta atualizada com sucesso !'
            });
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({
                message: 'Não foi possível editar a conta. Confira se o ID é válido e tente novamente.'
            });
        }
    }
}