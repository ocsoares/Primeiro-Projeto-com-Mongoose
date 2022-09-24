import 'dotenv/config';
import mongoose from "mongoose";

const connectMongoose = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Mongoose conectado remotamente !');
    }
    catch (error) {
        console.log(error);
        console.log('Não foi possível acessar o Mongoose remotamente !');
    }
};

connectMongoose();

export default mongoose; // Exporta o Mongoose !! <<