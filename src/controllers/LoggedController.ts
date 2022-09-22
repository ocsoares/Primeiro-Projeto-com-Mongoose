import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { Account } from '../models/Account';
import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt';

const __dirname = path.resolve();

const dashboardEJS = path.join(__dirname, '/src/views/dashboard.ejs');

interface IAccountInfo{
    _id: ObjectId | string;
    username: string;
    email: string;
    password: string;
    type: string;
}

export class LoggedController{
    async showAllAccounts(req: Request, res: Response, next: NextFunction){
        const getAllAccounts = await Account.getAccounts();

        res.render(dashboardEJS, { getAllAccounts });

        next();
    }

    async deleteAccount(req: Request, res: Response, next: NextFunction){
        const { idAccount } = req.params

        try{
            const deleteAccount = await Account.deleteAccountByID(idAccount);

            if(deleteAccount.deletedCount === 0){
                return res.status(400).json({
                    message: 'Não foi possível deletar a conta. Confira se o ID é válido e tente novamente.'
                })
            }

            return res.status(200).json({
                message: `O usuário com o ID ${idAccount} foi deletado com sucesso !`
            });
        }

        catch(error){
            console.log(error);
            return res.status(400).json({
                message: 'Não foi possível deletar a conta. Confira se o ID é válido e tente novamente.'
            })
        }
    }

    async editAccount(req: Request, res: Response, next: NextFunction){
        const { idAccount } = req.params;

        const { username, email, password } = req.body;

        if(!username && !email && !password){
            return res.status(400).json({
                message: 'Edite algum dado.'
            })
        }

        try{
            const searchAccountByID = await Account.searchAccountByID(idAccount) as IAccountInfo;

            const { _id } = searchAccountByID; 

            if(searchAccountByID === null){
                return res.status(400).json({
                    message: 'Não foi possível editar a conta. Confira se o ID é válido e tente novamente.'
                })
            }

                // Fiz esse if para EVITAR que faça OUTRO Hash se a Senha for a MESMA !! <<
            if(password) {
                const checkIfPasswordAreEquals = await bcrypt.compare(password, searchAccountByID.password);
                console.log('SENHA ENCRYPT:', checkIfPasswordAreEquals);

                    // Se for false, a Senha é DIFERENTE, então Encripta essa Senha !!
                if(checkIfPasswordAreEquals === false) {
                    const encryptPassword = await bcrypt.hash(password, 10);
                    console.log('SENHA ENCRYPT:', encryptPassword);

                    req.outCondition = encryptPassword;
                    console.log('outCondition no IF:', req.outCondition);
                }

            }

            console.log('outCondition FORA do if:', req.outCondition);

                // OBS: Precisa mandar o ID em STRING, porque lá eu vou converter para ObjectID !!
            const updateAccount = await Account.updateAccountByID(
                _id as string,
                username ? username : searchAccountByID.username,
                email ? email : searchAccountByID.email,
                req.outCondition ? req.outCondition : searchAccountByID.password // Password
            )

            console.log('UPDATE:', updateAccount);

            return res.status(200).json({
                message: 'Conta atualizada com sucesso !'
            })
        }
        catch(error){
            console.log(error);
            return res.status(400).json({
                message: 'Não foi possível editar a conta. Confira se o ID é válido e tente novamente.'
            })
        }
    }
}