const jwt = require('jsonwebtoken');
const jwtSecret = require('../jwt-secret');
const conexao = require('../conexao');


async function validarToken(req, res, next) {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ mensgem: "Para acessar esse recurso o usuário deverá  enviar um token inválido" });
    }

    try {
        const token = authorization.replace('Bearer ', '').trim();

        const usuario = jwt.verify(token, jwtSecret);

        const usuarioVerificado = await conexao.query("select * from usuarios where id = $1", [usuario.id]);

        if (usuarioVerificado.rowCount <= 0) {
            return res.status(401).json({ mensgem: "Usuário não encontrado" });
        }



        req.usuario = usuarioVerificado.rows[0];
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