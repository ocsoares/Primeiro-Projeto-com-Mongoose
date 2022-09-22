import AppMongoClient from "../database/database";
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

export class Account{
    username: string
    email: string
    password: string
    // confirm_password: string   // NÃO precisa disso, porque NÃO tem sentido Armazenar a Confirmação da Senha, APENAS a Senha !! <<
    type: string

    constructor(username: string, email: string, password: string, type: 'user' | 'admin'){
        this.username = username,
        this.email = email,
        this.password = password,
        this.type = type
    }

    saveInMongo(){
        const accountsCollection = AppMongoClient.db().collection('accounts').insertOne({
            username: this.username,
            email: this.email,
            password: this.password,
            type: this.type 
        })

        return accountsCollection;
    }

        // Usei static nesse caso porque torna esse Método ESTÁTICO, ou seja, NÃO precisa INSTANCIAR novamente a Classe para usar esse Método (que
        // nesse caso, teria que criar uma NOVA Conta para poder usar esse Método) !! << 
    static getAccounts(){                                       // PRECISA transformar em Array, se não da ERRO !!
        const accountsCollection = AppMongoClient.db().collection('accounts').find().toArray();

        return accountsCollection;
    }

    static async searchAccountByID(id: string){
        const idToBSON = new ObjectId(id);

        const searchAccountByID = await AppMongoClient.db().collection('accounts').findOne({_id: idToBSON})

        return searchAccountByID;
    }

    static async loginAccount(email: string, password: string){

        const searchUserByEmail = await AppMongoClient.db().collection('accounts').findOne({email});

        if(searchUserByEmail === null){
            return false;
        }

        const decryptPassword = await bcrypt.compare(password, searchUserByEmail.password)

        if(decryptPassword !== true){
            return false;
        }
        
        return searchUserByEmail;
    }

    static async deleteAccountByID(id: string){
        const idToBSON = new ObjectId(id);

        const deleteAccountByID = await AppMongoClient.db().collection('accounts').deleteOne({_id: idToBSON});

        return deleteAccountByID
    }

    static async updateAccountByID(id: string, username?: string, email?: string, password?: string){

            // Esse $set é responsável por EDITAR os Valores existentes na Collection !!
        const updateAccountByID =  await AppMongoClient.db().collection('accounts').updateOne({_id: new ObjectId(id)}, {$set: {
            username,
            email,
            password
        }})

        return updateAccountByID;
    }
}