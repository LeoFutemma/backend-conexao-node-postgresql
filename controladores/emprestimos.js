const conexao = require('../conexao');

async function listarEmprestimos(req, res) {
  try {
    const insertQuery = `select e.id, u.nome as usuario, u.telefone, u.email, l.nome as livro, e.status from emprestimos e
    left join usuarios u on e.usuario_id = u.id
    left join livros l on e.livro_id = l.id`

    const { rows: emprestimos } = await conexao.query(insertQuery);

    return res.json(emprestimos);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

async function obterEmprestimo(req, res) {
  const { id } = req.params;

  try {
    const insertQuery = `select e.id, u.nome as usuario, u.telefone, u.email, l.nome as livro, e.status from emprestimos e
    left join usuarios u on e.usuario_id = u.id
    left join livros l on e.livro_id = l.id
    where e.id = $1`

    const emprestimo = await conexao.query(insertQuery, [id]);

    if (emprestimo.rowCount === 0) {
      return res.status(404).json('Empréstimo não encontrado!');
    }

    return res.json(emprestimo.rows[0]);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

async function cadastrarEmprestimo(req, res) {
  const { usuario_id, livro_id, status } = req.body;

  if (!usuario_id || !livro_id || !status) {
    return res.status(400).json('O ID de usuário, o ID do livro e o status são obrigatórios!');
  }

  if (status !== 'devolvido' && status !== 'pendente') {
    return res.status(400).json('Status inválido! O status deve ser declarado apenas como devolvido ou pendente!');
  }

  try {
    const insertQuery = 'insert into emprestimos (usuario_id, livro_id, status) values ($1, $2, $3)';
    const emprestimo = await conexao.query(insertQuery, [usuario_id, livro_id, status]);

    if (emprestimo.rowCount === 0) {
      return res.status(400).json('Não foi possível cadastrar o empréstimo');
    }

    return res.json('Empréstimo cadastrado com sucesso');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

async function atualizarEmprestimo(req, res) {
  const { id } = req.params;
  const { usuario_id, livro_id, status } = req.body;

  if (usuario_id || livro_id) {
    return res.status(400).json('Só é possível alterar o status de um empréstimo. Forneça apenas o status!');
  }

  if (!status) {
    return res.status(400).json('É preciso fornecer o status para ser atualizado!');
  }

  if (status !== 'devolvido' && status !== 'pendente') {
    return res.status(400).json('Status inválido! O status deve ser declarado apenas como devolvido ou pendente!');
  }

  try {
    const emprestimo = await conexao.query('select * from emprestimos where id = $1', [id]);

    if (emprestimo.rowCount === 0) {
      return res.status(404).json('Empréstimo não encontrado!');
    }

    const insertQuery = 'update emprestimos set status = $1 where id = $2';
    const emprestimoAtualizado = await conexao.query(insertQuery, [status, id]);

    if (emprestimoAtualizado.rowCount === 0) {
      return res.status(400).json('Não foi possível atualizar o status do empréstimo');
    }

    return res.json('Status do empréstimo atualizado com sucesso!');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

async function excluirEmprestimo(req, res) {
  const { id } = req.params;

  try {
    const emprestimo = await conexao.query('select * from emprestimos where id = $1', [id]);

    if (emprestimo.rowCount === 0) {
      return res.status(404).json('Empréstimo não encontrado!');
    }

    const insertQuery = 'delete from emprestimos where id = $1';
    const emprestimoExcluido = await conexao.query(insertQuery, [id]);

    if (emprestimoExcluido.rowCount === 0) {
      return res.status(400).json('Não foi possível excluir o empréstimo');
    }

    return res.json('Empréstimo excluído com sucesso!');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

module.exports = {
  listarEmprestimos,
  obterEmprestimo,
  cadastrarEmprestimo,
  atualizarEmprestimo,
  excluirEmprestimo
}