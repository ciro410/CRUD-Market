const express = require('express');
const { listarProdutos, obterProduto, cadastrarProduto, atualizarProduto, deletarProduto } = require('./controladores/produtos');
const { listarUsuarios,
    cadastrarUsuario,
    loginUsuario,
    detalharUsuario,
    atualizarUsuario,
    apagarConta
} = require('./controladores/usuarios');
const { validarToken } = require('./middleware/autenticacao');
const rotas = express();



// usuarios
rotas.post('/usuarios/cadastro', cadastrarUsuario);
rotas.post('/usuarios/login', loginUsuario);

rotas.use(validarToken);
rotas.get('/usuarios', detalharUsuario);
rotas.patch('/usuarios/editar', atualizarUsuario);
rotas.delete('/usuario/apagar', apagarConta)

// produtos

rotas.get('/usuario/produtos', listarProdutos);
rotas.get('/usuario/produtos/:id', obterProduto);
rotas.post('/usuario/produto/cadastrar', cadastrarProduto);
rotas.patch('/usuario/produto/atualizar/:id', atualizarProduto);
rotas.delete('/usuario/produto/excluir/:id', deletarProduto)





module.exports = { rotas }