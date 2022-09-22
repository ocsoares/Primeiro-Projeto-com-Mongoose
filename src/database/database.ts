import 'dotenv/config'
import { MongoClient } from 'mongodb'

// Tive que mudar o localhost na uri para 127.0.0.1 porque estava dando ERRO !! <<

                    // URI + Nome do Banco !!
const uri = process.env.MONGO_URI as string; 
const AppMongoClient = new MongoClient(uri);

const ConnectMongo = async () => {
    try{
        await AppMongoClient.connect();
        console.log('Conectado com sucesso ao MongoDB remoto !');
    }
    catch(error){
        console.log(error);
        console.log('Falha na conexão com o MongoDB Remoto !');
    }
}

ConnectMongo();

    // Vai importar JÁ CONECTADO, porque a Função ASSÍNCRONA que conecta é chamada ACIMA !! << 
export default AppMongoClient;