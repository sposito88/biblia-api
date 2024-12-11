require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

// Conexão com o banco de dados
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

// Middleware para logs detalhados de todas as requisições
app.use((req, res, next) => {
  console.log(`Requisição recebida: ${req.method} ${req.url}`);
  next();
});

// Middleware global para capturar erros
app.use((err, req, res, next) => {
  console.error('Erro global capturado:', err.message);
  res.status(500).send({ error: 'Erro interno do servidor' });
});

// Rota inicial
app.get('/', (req, res) => {
  res.send('API da Bíblia está funcionando!');
});

// Rota para listar todos os livros
app.get('/livros', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM livros');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar os livros:', error.message);
    res.status(500).send('Erro ao buscar os livros');
  }
});

// Rota para obter um livro por ID
app.get('/livros/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM livros WHERE liv_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).send({ error: 'Livro não encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar o livro:', error.message);
    res.status(500).send('Erro ao buscar o livro');
  }
});

// Rota para listar todos os testamentos
app.get('/testamentos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM testamentos');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar os testamentos:', error.message);
    res.status(500).send('Erro ao buscar os testamentos');
  }
});

// Rota para buscar versículos
app.get('/versiculos', async (req, res) => {
  const { liv_id, capitulo, versiculo, abreviacao } = req.query;

  try {
    let query = `
      SELECT v.*
      FROM versiculos v
      JOIN versoes vs ON v.ver_vrs_id = vs.vrs_id
      WHERE 1=1
    `;
    const params = [];

    if (abreviacao) {
      query += ' AND LOWER(vs.vrs_abreviacao) = LOWER(?)';
      params.push(abreviacao);
    }
    if (liv_id) {
      query += ' AND v.ver_liv_id = ?';
      params.push(liv_id);
    }
    if (capitulo) {
      query += ' AND v.ver_capitulo = ?';
      params.push(capitulo);
    }
    if (versiculo) {
      query += ' AND v.ver_versiculo = ?';
      params.push(versiculo);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar os versículos:', error.message);
    res.status(500).send('Erro ao buscar os versículos');
  }
});

// Rota para pesquisar versículos por texto
app.get('/pesquisar', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).send({ error: "O parâmetro de busca 'q' é obrigatório" });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM versiculos WHERE MATCH(ver_texto) AGAINST(?)', [q]);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar os versículos:', error.message);
    res.status(500).send('Erro ao buscar os versículos');
  }
});

// Rota para listar versões disponíveis
app.get('/versoes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT vrs_id, vrs_abreviacao FROM versoes');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar as versões:', error.message);
    res.status(500).send('Erro ao buscar as versões');
  }
});

// Rota para obter um versículo aleatório por abreviação
app.get('/:abreviacao/random', async (req, res) => {
  const { abreviacao } = req.params;

  try {
    console.log(`Requisição recebida com a abreviação: ${abreviacao}`);

    const query = `
      SELECT v.*
      FROM versiculos v
      JOIN versoes vs ON v.ver_vrs_id = vs.vrs_id
      WHERE LOWER(vs.vrs_abreviacao) = LOWER(?)
      ORDER BY RAND()
      LIMIT 1
    `;
    console.log(`Executando query SQL: ${query} com parâmetro: ${abreviacao}`);

    const [rows] = await pool.query(query, [abreviacao]);
    console.log('Resultado da query:', rows);

    if (rows.length === 0) {
      console.log(`Nenhum resultado encontrado para a abreviação: ${abreviacao}`);
      return res.status(404).send({ error: 'Nenhum versículo encontrado para esta abreviação' });
    }

    // Personaliza a resposta
    const versiculo = {
      livro: rows[0].ver_liv_id,
      capitulo: rows[0].ver_capitulo,
      versiculo: rows[0].ver_versiculo,
      texto: rows[0].ver_texto,
    };

    console.log('Versículo encontrado:', versiculo);
    res.json(versiculo);
  } catch (error) {
    console.error('Erro ao buscar o versículo aleatório:', error.message);
    res.status(500).send({ error: 'Erro interno do servidor' });
  }
});


// Inicie o servidor
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
