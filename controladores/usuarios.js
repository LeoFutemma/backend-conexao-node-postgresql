const conexao = require('../conexao');

async function listarUsuarios(req, res) {
  try {
    const { rows: usuarios } = await conexao.query('select * from usuarios order by id');
    const insertQuery = `select e.id, e.usuario_id, e.livro_id, e.status, l.nome as livro from emprestimos e
    left join livros l on e.livro_id = l.id
    where usuario_id = $1`

    for (const usuario of usuarios) {
      const { rows: emprestimos } = await conexao.query(insertQuery, [usuario.id]);
      usuario.emprestimos = emprestimos;
    }

    return res.json(usuarios);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

async function obterUsuario(req, res) {
  const { id } = req.params;

  try {
    const usuario = await conexao.query('select * from usuarios where id = $1', [id]);

    if (usuario.rowCount === 0) {
      return res.status(404).json('Usuário não encontrado!');
    }

    const insertQuery = `select e.id, e.usuario_id, e.livro_id, e.status, l.nome as livro from emprestimos e
    left join livros l on e.livro_id = l.id
    where usuario_id = $1`

    const { rows: emprestimos } = await conexao.query(insertQuery, [id]);
    usuario.rows[0].emprestimos = emprestimos;

    return res.json(usuario.rows[0]);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

async function cadastrarUsuario(req, res) {
  const { nome, idade, email, telefone, cpf } = req.body;

  if (!nome || !email || !cpf) {
    return res.status(400).json('Os campos Nome, Email e CPF são obrigatórios!');
  }

  try {
    const insertQuery = 'insert into usuarios (nome, idade, email, telefone, cpf) values ($1, $2, $3, $4, $5)';
    const usuario = await conexao.query(insertQuery, [nome, idade, email, telefone, cpf]);

    if (usuario.rowCount === 0) {
      return res.status(400).json('Não foi possível cadastrar o usuário');
    }

    return res.json('Usuário cadastrado com sucesso');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

async function atualizarUsuario(req, res) {
  const { id } = req.params;
  const { nome, idade, email, telefone, cpf } = req.body;

  try {
    const usuario = await conexao.query('select * from usuarios where id = $1', [id]);

    if (usuario.rowCount === 0) {
      return res.status(404).json('Usuário não encontrado!');
    }

    if (!nome || !email || !cpf) {
      return res.status(400).json('Os campos Nome, Email e CPF são obrigatórios!');
    }

    const insertQuery = 'update usuarios set nome = $1, idade = $2, email = $3, telefone = $4, cpf = $5 where id = $6';
    const usuarioAtualizado = await conexao.query(insertQuery, [nome, idade, email, telefone, cpf, id]);

    if (usuarioAtualizado.rowCount === 0) {
      return res.status(400).json('Não foi possível atualizar o usuário');
    }

    return res.json('Usuário atualizado com sucesso!');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

async function excluirUsuario(req, res) {
  const { id } = req.params;

  try {
    const usuario = await conexao.query('select * from usuarios where id = $1', [id]);
    const { rows: emprestimos } = await conexao.query('select * from emprestimos where usuario_id = $1', [id]);

    if (usuario.rowCount === 0) {
      return res.status(404).json('Usuário não encontrado!');
    }

    if (emprestimos[0]) {
      return res.status(400).json('Não é possível excluir um usuario que possui empréstimos atrelados ao seu ID');
    }

    const insertQuery = 'delete from usuarios where id = $1';
    const usuarioExcluido = await conexao.query(insertQuery, [id]);

    if (usuarioExcluido.rowCount === 0) {
      return res.status(400).json('Não foi possível excluir o usuário');
    }

    return res.json('Usuário excluído com sucesso!');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

module.exports = {
  listarUsuarios,
  obterUsuario,
  cadastrarUsuario,
  atualizarUsuario,
  excluirUsuario
}