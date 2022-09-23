import mongoose from "mongoose";
import { Schema } from 'mongoose';

// OBS: De acordo com o tipo de Date especificada, o MongoDB converte AUTOMATICAMENTE !! <<

export const Account = mongoose.model(
    'accounts', // Nome da Collection !! <<
    new Schema({
        username: { type: String, required: true, unique: true }, // A String PRECISA ser a Maíscula !! <<
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        type: { type: String, required: true, enum: ['user', 'admin'], default: 'user' }, // enum = Valores aceitos !! // Se NÃO for informado, será 'user' !! <<
        // created_at: { type: String, default: new Date().toLocaleString('pt-BR') } // OBS: Se for a data Padrão (objeto), passar apenas Date.now (SEM () ), porque o Mongoose Retorna a Própria Função AUTOMATICAMENTE !! <<
        // created_at: { type: Date, required: true, default: Date.now}
    },
        { timestamps: true } // Cria AUTOMATICAMENTE um Schema createdAt (Fixo) e updateAt (Altera quando ALTERADO), no formato UTC, o que é uma Boa Prática para TODOS os Horários globais.
        // OBS: Como ele é salvo em UTC, basta converter para o Padrão de Horário desejado, Tipando como Date e usando as Funções .toLocale... !! <<
    )
);