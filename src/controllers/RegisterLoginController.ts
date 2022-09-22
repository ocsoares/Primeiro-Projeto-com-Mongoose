import { Request, Response, NextFunction } from 'express'
import path from 'path';
import { Account } from '../models/Account';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb'
import AppMongoClient from '../database/database';

const __dirname = path.resolve();
const registerLoginEJS = path.join(__dirname, '/src/views/register-login.ejs');
interface IAccountInfo{
    _id: ObjectId | string; // ObjectID porque o ID vem dentro de um Objeto BSON (do Mongo) !! <<
    username: string;
    email: string;
    password: string;
    type: string;
}
export class RegisterLoginController{
    async registerOrLogin(req: Request, res: Response, next: NextFunction){

        const { 
            registerUsername,
            registerEmail,
            registerPassword,
            registerConfirmPassword
         } = req.body

        const {
            loginEmail,
            loginPassword
        } = req.body

        if (registerUsername && registerEmail && registerPassword && registerConfirmPassword) {
            if (typeof (registerUsername) !== 'string' || typeof (registerEmail) !== 'string' || typeof (registerPassword) !== 'string' ||
                typeof (registerConfirmPassword) !== 'string') {
                req.flash('errorFlash', 'Formato dos dados inválidos !');
                return res.redirect('/account');
            }

            if(registerPassword !== registerConfirmPassword){
                req.flash('errorFlash', 'As senhas não coincidem !');
                return res.redirect('/account');
            }
            
            try {
                const encryptPassword = await bcrypt.hash(registerPassword, 10);

                const createAccount = new Account(registerUsername, registerEmail, encryptPassword, 'user');

                createAccount.saveInMongo();

                req.flash('successFlash', 'Conta criada com sucesso !');
                return res.redirect('/account');
            }
            catch (error) {
                console.log(error);
                req.flash('errorFlash', 'Não foi possível criar sua conta !');
                return res.redirect('/account');
            }
        }

        else if(loginEmail && loginPassword){

                    // Try catch só para mais Segurança, porque não precisava necessariamente...
            try{
                const verifyLogin = await Account.loginAccount(loginEmail, loginPassword) as unknown as false & IAccountInfo;

                    // Precisa converter o ID para STRING, com o .toString() !! <<
                const { _id, username, email, type } = verifyLogin;

                if(!verifyLogin){
                    req.flash('errorFlash', 'Usuário ou senha inválida !');
                    console.log('Inválido.');
                    return res.redirect('/account');
                }

                const createJWT = jwt.sign({
                    id: _id.toString(),
                    username,
                    email,
                    type
                }, "" + process.env.JWT_HASH, {
                    expiresIn: '12h'
                });

                // Cookie assinado com o Segredo passado no Cookie Parser (app.ts) !!
                //  OBS: Colocar secure true no DEPLOY !! <<
                res.cookie('session_auth', createJWT, { signed: true, httpOnly: true });

                // Pega o Cookie SEM a Assinatura !! <<
                const { session_auth } = req.signedCookies;
                console.log('COOKIE:', session_auth);

                const searchUserByID = await AppMongoClient.db().collection('accounts').findOne({_id: _id}) as IAccountInfo;
                console.log('BY ID:', searchUserByID);

                req.flash('successFlash', 'Logado com sucesso !');

                return res.redirect('/dashboard');
            }
            catch(error){
                console.log(error);
                req.flash('errorFlash', 'Usuário ou senha inválida !');
                return res.redirect('/account');
            }

        }
        
        else{
            req.flash('errorFlash', 'Dados inválidos !');
            return res.render(registerLoginEJS);
        }

        // next();
    }
}