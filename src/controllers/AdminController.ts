import { Request, Response } from 'express';

export class AdminController{
    async loginAdmin(req: Request, res: Response){
        res.cookie('session_admin', 'admin', {signed: true});

        const { session_admin } = req.signedCookies;
        console.log('SESSION ADMIN:', session_admin);

        req.flash('successFlash', 'Logado com sucesso !');
        return res.redirect('/admin');
    }
}