const knex = require('../conexao');

async function listarProdutos(req, res) {
    try {
        const categoria = req.query.categoria;
        let produtos = '';
        const id = Number(req.usuario.id)

        if (categoria) {
            produtos = await knex('produtos').where({ usuario_id: id, categoria });
        } else {
            produtos = await knex('produtos').where('usuario_id', id);
        }

        return res.status(200).json(produtos)
    } catch (error) {
        return res.status(500).json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }
}

async function obterProduto(req, res) {
    const id = Number(req.params.id);
    try {
        const produtos = await knex('produtos').where({ id, usuario_id: Number(req.usuario.id) });

        if (produtos.length === 0 || req.usuario.id !== produtos[0].usuario_id) {
            return res.status(404).json({ mensagem: `Não existe produto cadastrado com o ID ${id}` })
        }

        return res.status(200).json(produtos[0])
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
        const dadosDoProduto = {
            usuario_id, nome, quantidade, categoria, preco, descricao, imagem
        }
        const produto = await knex('produtos').insert(dadosDoProduto)
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

    const produto = await knex('produtos').where('id', id);
    if (produto.length === 0) {
        return res.status(401).json({ mensagem: `Não existe produto cadastrado com o ID ${id}` });
    }

    const nome = req.body.nome ?? produto[0].nome;
    const quantidade = req.body.quantidade ?? produto[0].quantidade;
    const categoria = req.body.categoria ?? produto[0].categoria;
    const preco = req.body.preco ?? produto[0].preco;
    const descricao = req.body.descricao ?? produto[0].descricao;
    const imagem = req.body.imagem ?? produto[0].imagem;

    try {
        const dadosDoProduto = {
            nome, quantidade, categoria, preco, descricao, imagem
        }
        const produtoAtualizado = await knex('produtos').update(dadosDoProduto).where('id', id)

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
        const produto = await knex('produtos').where('id', id)
        if (produto.length === 0) {
            return res.status(401).json({ mensagem: `Não existe produto cadastrado com o ID ${id}` });
        };

        const usuarioDeletado = await knex('produtos').del().where('id', id)

        if (usuarioDeletado.length === 0) {
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