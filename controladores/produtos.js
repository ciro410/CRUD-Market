const conexao = require('../conexao');
const securePassword = require('secure-password');
const pwd = securePassword();
const jwt = require('jsonwebtoken');
const jwtSecret = require("../jwt-secret")

async function listarProdutos(req, res) {
    try {
        const categoria = req.query.categoria;
        let query = '';
        let produtos = '';

        if (categoria) {
            query = 'select * from produtos where usuario_id = $1 and categoria =$2';
            produtos = await conexao.query(query, [Number(req.usuario.id), categoria]);
        } else {
            query = `select * from produtos where usuario_id = $1`
            produtos = await conexao.query(query, [Number(req.usuario.id)]);
        }

        return res.status(200).json(produtos.rows)
    } catch (error) {
        return res.status(500).json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }
}

async function obterProduto(req, res) {
    const id = Number(req.params.id);
    try {
        const query = `select * from produtos where id = $1 and usuario_id = $2`
        const produtos = await conexao.query(query, [id, Number(req.usuario.id)]);

        if (produtos.rowCount === 0 || req.usuario.id !== produtos.rows[0].usuario_id) {
            return res.status(404).json({ mensagem: `Não existe produto cadastrado com o ID ${id}` })
        }

        return res.status(200).json(produtos.rows)
    } catch (error) {
        return res.status(500).json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }
}

async function cadastrarProduto(req, res) {
    const { nome, quantidade, categoria, preco, descricao, imagem } = req.body;


    if (!nome) {
        return res.status(400).json("O campo nome é obrigatório");
    }
    if (!quantidade) {
        return res.status(400).json("O campo quantidade é obrigatório");
    }
    if (!preco || preco === 0) {
        return res.status(400).json("O campo preço é obrigatório e tem que ser diferente de 0");
    }
    if (!descricao) {
        return res.status(400).json("O campo descrição é obrigatório");
    }

    try {
        const usuario_id = Number(req.usuario.id);
        const query = 'insert into produtos (usuario_id, nome,quantidade,categoria,preco,descricao,imagem) values($1,$2,$3,$4,$5,$6,$7)';
        const produto = await conexao.query(query, [usuario_id, nome, quantidade, categoria, preco, descricao, imagem]);
        return res.status(200).json("Produto Adicionado com sucesso")
    } catch (error) {
        return res.status(500).json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }
}

async function atualizarProduto(req, res) {
    const id = Number(req.params.id);

    if (!id || typeof id !== 'number') {
        return res.status(401).json({ mensagem: `O id informado é inválido` });
    }
    if (!id === req.usuario.id) {
        return res.status(401).json({ mensagem: `Não existe produto cadastrado com o ID ${id}` });
    }

    const produto = await conexao.query("select * from produtos where id = $1", [id]);
    if (produto.rowCount === 0) {
        return res.status(401).json({ mensagem: `Não existe produto cadastrado com o ID ${id}` });
    }

    const nome = req.body.nome ?? produto.rows[0].nome;
    const quantidade = req.body.quantidade ?? produto.rows[0].quantidade;
    const categoria = req.body.categoria ?? produto.rows[0].categoria;
    const preco = req.body.preco ?? produto.rows[0].preco;
    const descricao = req.body.descricao ?? produto.rows[0].descricao;
    const imagem = req.body.imagem ?? produto.rows[0].imagem;

    try {
        const query = "update produtos set nome =$1, quantidade =$2, categoria =$3 , preco =$4 ,descricao = $5, imagem = $6 where id = $7";

        const produtoAtualizado = await conexao.query(query, [nome, quantidade, categoria, preco, descricao, imagem, id])

        return res.status(200).json("Produto Atualizado com sucesso.")
    } catch (error) {
        return res.status(500).json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }

}

async function deletarProduto(req, res) {
    const id = Number(req.params.id);

    if (!id || typeof id !== 'number') {
        return res.status(401).json({ mensagem: `O id informado é inválido` });
    }
    if (!id === req.usuario.id) {
        return res.status(401).json({ mensagem: `Não existe produto cadastrado com o ID ${id}` });
    }

    try {

        const produto = await conexao.query("select * from produtos where id = $1", [id]);
        if (produto.rowCount === 0) {
            return res.status(401).json({ mensagem: `Não existe produto cadastrado com o ID ${id}` });
        };

        const query = "delete from produtos where id =$1";
        const usuarioDeletado = await conexao.query(query, [id]);

        if (usuarioDeletado.rowCount === 0) {
            return res.status(200).json({ mensagem: "Não foi possiível deletar usuario" });
        }
        return res.status(200).json({ mensagem: "Usuario Deletado com sucesso" });
    } catch (error) {
        return res.status(500).json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }

}

module.exports = {
    listarProdutos,
    obterProduto,
    cadastrarProduto,
    atualizarProduto,
    deletarProduto
}