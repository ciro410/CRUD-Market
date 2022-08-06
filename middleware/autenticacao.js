const jwt = require('jsonwebtoken');
const jwtSecret = require('../jwt-secret');
const knex = require('../conexao');


async function validarToken(req, res, next) {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ mensgem: "Para acessar esse recurso o usuário deverá  enviar um token válido" });
    }

    try {
        const token = authorization.replace('Bearer ', '').trim();

        const usuario = jwt.verify(token, jwtSecret);

        const usuarioVerificado = await knex('usuarios').where('id', usuario.id);

        if (usuarioVerificado.length === 0) {
            return res.status(401).json({ mensgem: "Usuário não encontrado" });
        }

        req.usuario = usuarioVerificado[0];

        next();


    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ mensgem: "Para acessar esse recurso o usuário deverá  enviar um token inválido" });
        }
        return res.status(500).json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }
}

module.exports = {
    validarToken
}