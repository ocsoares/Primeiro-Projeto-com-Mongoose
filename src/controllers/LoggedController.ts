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

        res.render(dashboardEJS, { getAllAccounts });

        next();
    }

    async showMyAccount(req: Request, res: Response, next: NextFunction) {
        const { idAccount } = req.params;

        try {
            // Nesse caso, NÃO precisa converter o ID para ObjectID, porque o Mongoose faz isso Automaticamente !! <<
            const showMyAccount = await Account.findById(idAccount) as IAccountInfo;
            console.log('ACCOUNT:', showMyAccount);

            if (showMyAccount === null) {
                return res.status(400).json({
                    message: 'Não foi possível encontrar sua conta. Tente novamente.'
                });
            }

            return res.json({
                message: 'Sua conta foi encontrada com sucesso !',
                account: showMyAccount,
                brazilianUTC: {
                    createdAt: showMyAccount.createdAt.toLocaleString('pt-BR'),
                    updatedAt: showMyAccount.updatedAt.toLocaleString('pt-BR')
                }
            });

        }
        catch (error) {
            console.log(error);
            return res.status(400).json({
                message: 'Não foi possível encontrar sua conta. Tente novamente.'
            });
        }
    }

    async deleteAccount(req: Request, res: Response, next: NextFunction) {
        const { idAccount } = req.params;

        try {
            // Usei findByIDAndDelete porque ele PROCURA o ID ANTES de Deletar !! <<
            // OBS: Nesse caso, TEM QUE SER o _id como Propriedade e o ID como STRING no Valor !! <<
            const deleteAccount = await Account.findByIdAndDelete({ _id: idAccount });

            if (deleteAccount === null) {
                return res.status(400).json({
                    message: 'Conta não encontrada. Confira o ID e tente novamente. !'
                });
            }

            return res.status(200).json({
                message: `O usuário '${deleteAccount.username}' com o ID ${idAccount} foi deletado com sucesso !`
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

                // Se for false, a Senha é DIFERENTE, então Encripta essa Senha !!
                if (checkIfPasswordAreEquals === false) {
                    const encryptPassword = await bcrypt.hash(password, 10);

                    encryptedPassword = encryptPassword;
                }

            }

            // Nesse caso, TEM QUE SER o _id como Propriedade e o ID como STRING no Valor !! <<
            const updateAccount = await Account.updateOne({ _id: idAccount }, {
                username: username ? username : searchAccountByID.username,
                email: email ? email : searchAccountByID.email,
                password: encryptedPassword ? encryptedPassword : searchAccountByID.password
            });

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