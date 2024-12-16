const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

// Conexão com o banco de dados
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

const app = express(); // Certifique-se de que app está definido aqui
const port = 3000;

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API da Bíblia',
      version: '1.0.0',
      description: 'Documentação interativa da API da Bíblia',
    },
    servers: [
      {
        url: 'http://apibiblia.com.br:3000',
        description: 'Servidor de Produção',
      },
    ],
  },
  apis: ['./server.js'], // Ajuste conforme necessário
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware para servir arquivos estáticos
app.use('/api-docs/static', express.static(path.join(__dirname, 'node_modules', 'swagger-ui-dist')));

// Middleware do Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



// Configurar CORS
const allowedOrigins = [
  'http://apibiblia.com.br',
  'https://apibiblia.com.br',
  'http://www.apibiblia.com.br',
  'https://www.apibiblia.com.br',
  'http://localhost:3000',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Origin não permitida pelo CORS'));
    }
  },
}));

// Middleware para interpretar JSON
app.use(express.json());

// Middleware global para capturar erros
app.use((err, req, res, next) => {
  console.error('Erro global capturado:', err.message);
  res.status(500).send({ error: 'Erro interno do servidor' });
});

// Rota inicial
app.get('/', (req, res) => {
  res.send('API da Bíblia está funcionando!');
});

/**
 * @swagger
 * /livros:
 *   get:
 *     summary: Retorna todos os livros da Bíblia
 *     description: Obtém uma lista com todos os livros, incluindo seus detalhes.
 *     responses:
 *       200:
 *         description: Lista de livros retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   liv_id:
 *                     type: integer
 *                     description: ID do livro.
 *                   liv_nome:
 *                     type: string
 *                     description: Nome do livro.
 *                   liv_abreviado:
 *                     type: string
 *                     description: Abreviação do livro.
 */

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

/**
 * @swagger
 * /livros/{id}:
 *   get:
 *     summary: Retorna um livro específico
 *     description: Obtém os detalhes de um livro específico pelo seu ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do livro.
 *     responses:
 *       200:
 *         description: Livro retornado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liv_id:
 *                   type: integer
 *                   description: ID do livro.
 *                 liv_nome:
 *                   type: string
 *                   description: Nome do livro.
 *                 liv_abreviado:
 *                   type: string
 *                   description: Abreviação do livro.
 *       404:
 *         description: Livro não encontrado.
 */

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

/**
 * @swagger
 * /livros/{id}/capitulos:
 *   get:
 *     summary: Retorna os capítulos de um livro específico
 *     description: Obtém os capítulos de um livro pelo seu ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do livro.
 *     responses:
 *       200:
 *         description: Capítulos retornados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   capitulo_id:
 *                     type: integer
 *                     description: ID do capítulo.
 *                   numero:
 *                     type: integer
 *                     description: Número do capítulo.
 *       404:
 *         description: Livro não encontrado.
 */

// Rota para listar os capítulos de um livro
app.get('/livros/:id/capitulos', async (req, res) => {
  const { id } = req.params; // ID do livro
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT ver_capitulo AS capitulo_numero
       FROM versiculos
       WHERE ver_liv_id = ?
       ORDER BY ver_capitulo`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).send({ error: 'Nenhum capítulo encontrado para o livro especificado' });
    }

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar capítulos:', error.message);
    res.status(500).send('Erro ao buscar capítulos');
  }
});

/**
 * @swagger
 * /livros/{id}/capitulos/{capituloId}/versiculos:
 *   get:
 *     summary: Retorna os versículos de um capítulo específico
 *     description: Obtém os versículos de um capítulo específico pelo ID do livro e ID do capítulo.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do livro.
 *       - in: path
 *         name: capituloId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do capítulo.
 *     responses:
 *       200:
 *         description: Versículos retornados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   versiculo_id:
 *                     type: integer
 *                     description: ID do versículo.
 *                   texto:
 *                     type: string
 *                     description: Texto do versículo.
 *       404:
 *         description: Capítulo não encontrado.
 */

// Rota para listar os versículos de um capítulo
app.get('/livros/:id/capitulos/:capituloId/versiculos', async (req, res) => {
  const { id, capituloId } = req.params;
  const { versao } = req.query; // Parâmetro da versão da Bíblia (opcional)

  try {
    let query = `
      SELECT v.ver_versiculo, v.ver_texto, vs.vrs_abreviacao AS versao
      FROM versiculos v
      JOIN versoes vs ON v.ver_vrs_id = vs.vrs_id
      WHERE v.ver_liv_id = ? AND v.ver_capitulo = ?
    `;
    const params = [id, capituloId];

    // Adiciona filtro pela versão se o parâmetro 'versao' for enviado
    if (versao) {
      query += ' AND LOWER(vs.vrs_abreviacao) = LOWER(?)';
      params.push(versao);
    }

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).send({ error: 'Nenhum versículo encontrado para o capítulo e versão especificados' });
    }

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar versículos:', error.message);
    res.status(500).send('Erro ao buscar versículos');
  }
});


/**
 * @swagger
 * /testamentos:
 *   get:
 *     summary: Retorna todos os testamentos
 *     description: Obtém uma lista com todos os testamentos disponíveis.
 *     responses:
 *       200:
 *         description: Lista de testamentos retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tes_id:
 *                     type: integer
 *                     description: ID do testamento.
 *                   tes_nome:
 *                     type: string
 *                     description: Nome do testamento.
 */

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


/**
 * @swagger
 * /versiculos:
 *   get:
 *     summary: Busca versículos
 *     description: Retorna versículos com base em critérios de busca como livro, capítulo, versículo e abreviação.
 *     parameters:
 *       - in: query
 *         name: liv_id
 *         schema:
 *           type: integer
 *         description: ID do livro.
 *       - in: query
 *         name: capitulo
 *         schema:
 *           type: integer
 *         description: Número do capítulo.
 *       - in: query
 *         name: versiculo
 *         schema:
 *           type: integer
 *         description: Número do versículo.
 *       - in: query
 *         name: abreviacao
 *         schema:
 *           type: string
 *         description: Abreviação da versão da Bíblia.
 *     responses:
 *       200:
 *         description: Versículos retornados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ver_liv_id:
 *                     type: integer
 *                     description: ID do livro.
 *                   ver_capitulo:
 *                     type: integer
 *                     description: Número do capítulo.
 *                   ver_versiculo:
 *                     type: integer
 *                     description: Número do versículo.
 *                   ver_texto:
 *                     type: string
 *                     description: Texto do versículo.
 */
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

/**
 * @swagger
 * /pesquisar:
 *   get:
 *     summary: Pesquisa versículos
 *     description: Realiza uma pesquisa por texto completo nos versículos.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Termo de busca.
 *     responses:
 *       200:
 *         description: Resultados da pesquisa retornados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ver_id:
 *                     type: integer
 *                     description: ID do versículo.
 *                   ver_texto:
 *                     type: string
 *                     description: Texto do versículo.
 *       400:
 *         description: Parâmetro de busca 'q' não fornecido.
 */

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


/**
 * @swagger
 * /versoes:
 *   get:
 *     summary: Lista as versões disponíveis
 *     description: Retorna todas as versões da Bíblia disponíveis na API.
 *     responses:
 *       200:
 *         description: Versões retornadas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   vrs_id:
 *                     type: integer
 *                     description: ID da versão.
 *                   vrs_abreviacao:
 *                     type: string
 *                     description: Abreviação da versão.
 */
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

/**
 * @swagger
 * /{abreviacao}/random:
 *   get:
 *     summary: Retorna um versículo aleatório
 *     description: Obtém um versículo aleatório baseado na abreviação fornecida.
 *     parameters:
 *       - in: path
 *         name: abreviacao
 *         required: true
 *         schema:
 *           type: string
 *         description: Abreviação da versão da Bíblia.
 *     responses:
 *       200:
 *         description: Versículo retornado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 livro:
 *                   type: integer
 *                   description: ID do livro.
 *                 capitulo:
 *                   type: integer
 *                   description: Número do capítulo.
 *                 versiculo:
 *                   type: integer
 *                   description: Número do versículo.
 *                 texto:
 *                   type: string
 *                   description: Texto do versículo.
 *       404:
 *         description: Nenhum versículo encontrado para a abreviação fornecida.
 */

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
