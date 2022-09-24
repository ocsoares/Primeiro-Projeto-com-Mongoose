import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import path from 'path';
import cookieParser from 'cookie-parser';
import connectFlash from 'connect-flash';
import bodyParser from 'body-parser';
import cors from 'cors';
import MongooseDatabase from './database/database';
import registerLoginRoute from './routes/registerLoginRoute';
import adminRoute from './routes/adminRoute';
import loggedRoute from './routes/loggedRoutes';

// Por algum motivo, estava instalando a versão do mongodb ERRADA, (3. algo), que não tinha suporte a TS, então tive que baixar manual-
// -mente a mais atualizada (que tem suporte a TS).

// Na pasta Helpers, colocar Códigos que Auxiliam os Controllers (exemplo: Verificar se um Usuário pode Acessar a Rota) !! <<

const __dirname = path.resolve();


// Daqui pra baixo colocar tudo no Inicializador do Banco de Dados !!
MongooseDatabase; // No vídeo ele NÃO colocou isso, mas TIVE que colocar porque NÃO estava Executando !! <<

const server = express();

const localhost = 'http://localhost';
const port = 5000;

server.set('view engine', 'ejs');

server.use(cookieParser(process.env.COOKIE_SECRET));

server.use(session({
    name: 'session_app',
    secret: process.env.COOKIE_SECRET as string,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false, // Não vou por em produção, então não preciso verificar o NODE_ENV.
        httpOnly: true
    }
}));

server.use(connectFlash());

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(bodyParser.text({ type: 'text/json' }));

server.use(cors());
server.use(express.static(__dirname + '/src/views'));
server.use(express.static(__dirname + '/src/public'));
server.use(express.static(__dirname + '/dist'));

server.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.errorFlash = req.flash('errorFlash');
    res.locals.successFlash = req.flash('successFlash');

    next();
});

server.use(registerLoginRoute);
server.use(adminRoute);
server.use(loggedRoute);

server.get('/', (req: Request, res: Response) => {
    res.redirect('/account');
});

server.listen(port, () => {
    console.log(`Servidor rodando remotamente em ${localhost}:${port}`);
});