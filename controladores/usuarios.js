const conexao = require('../conexao');
const securePassword = require('secure-password');
const pwd = securePassword();
const jwt = require('jsonwebtoken');
const jwtSecret = require("../jwt-secret")

async function listarUsuarios(req, res) {
    const usuarios = await conexao.query("select * from usuarios");
    return res.status(200).json(usuarios.rows)
}

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha, nome_loja } = req.body;

    if (!nome) {
        return res.status(400).json('O campo nome é obrigatório')
    }
    if (!email) {
        return res.status(400).json('O campo email é obrigatório')
    }
    if (!senha) {
        return res.status(400).json('O campo senha é obrigatório')
    }
    if (!nome_loja) {
        return res.status(400).json('O campo nome_loja é obrigatório')
    }

    const query = "select * from usuarios where email =$1"
    const emailVerificado = await conexao.query(query, [email]);

    if (emailVerificado.rowCount > 0) {
        return res.status(400).json('O email cadastrado já existe')
    }

    try {
        const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
        const query = `insert into usuarios (nome,  email, senha, nome_loja) 
        values ($1, $2, $3, $4)`;
        const usuarioCadastrado = await conexao.query(query, [nome, email, hash, nome_loja]);

        if (usuarioCadastrado.rowCount === 0) {
            return res.status(400).json('Não foi possivel cadastar o Usuario');
        }

        return res.status(200).json('Usuario cadastrado com sucesso.');
    } catch (error) {
        return res.status(500).json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }
}

async function loginUsuario(req, res) {
    const { email, senha } = req.body;

    if (!email) {
        return res.status(404).json('O campo e-mail é obrgatório');
    }

    if (!senha) {
        return res.status(404).json('O campo senha é obrigatório');
    }

    try {
        const usuarios = await conexao.query('select * from usuarios where email = $1', [email]);

        if (usuarios.rowCount === 0) {
            return res.status(404).json('E-mail ou senha inválidos');
        }

        const usuario = usuarios.rows[0];
        const result = await pwd.verify(Buffer.from(senha), Buffer.from(usuario.senha, "hex"))

        switch (result) {
            case securePassword.INVALID_UNRECOGNIZED_HASH:
            case securePassword.INVALID:
                return res.status(404).json('E-mail ou senha inválidos');
            case securePassword.VALID:
                break;
            case securePassword.VALID_NEEDS_REHASH:
                try {
                    const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
                    const query = `update usuarios set senha = $1 where email = $2`;
                    const usuarioAtualizado = await conexao.query(query, [hash, email]);
                } catch {
                }
                break;
        }

        const token = jwt.sign({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        }, jwtSecret)
        return res.status(200).json(token)



    } catch (error) {
        return res.status(500).json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }
}

async function detalharUsuario(req, res) {
    try {
        const { id, nome, email, nome_loja } = req.usuario
        return res.status(200).json({ id, nome, email, nome_loja })
    } catch (error) {
        return res.status(500).json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }
}


async function atualizarUsuario(req, res) {

    const nome = req.body.nome ?? req.usuario.nome;
    let email = "";
    let senha = req.body.senha ?? req.usuario.senha;
    const nome_loja = req.body.nome_loja ?? req.usuario.nome_loja;



    if (!req.body.email || req.body.email === req.usuario.email) {
        email = req.usuario.email;
    } else {
        email = req.body.email;
        const emailVerificado = await conexao.query("select * from usuarios where email = $1", [email]);

        if (emailVerificado.rowCount > 0) {
            return res.status(400).json({ mensagem: "O e-mail informado já está sendo utilizado por outro usuário." })
        }
    }
    try {
        const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
        const query = `update  usuarios set nome = $1, email =$2, senha = $3, nome_loja = $4 where id = $5`;
        const usuarioCadastrado = await conexao.query(query, [nome, email, hash, nome_loja, Number(req.usuario.id)]);

        if (usuarioCadastrado.rowCount === 0) {
            return res.status(400).json('Não foi possivel editar o Usuario');
        }

        return res.status(200).json('Usuario editado com sucesso.');

    } catch (error) {
        return res.status(500).json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }

}




module.exports = {
    listarUsuarios,
    cadastrarUsuario,
    loginUsuario,
    detalharUsuario,
    atualizarUsuario
}