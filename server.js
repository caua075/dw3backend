const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();

app.use(express.json());

const db = new sqlite3.Database(':memory:');

// Criando a tabela
db.serialize(() => {
  db.run(`CREATE TABLE salasdeaula (
    salasdeaulaid INTEGER PRIMARY KEY,
    descricao TEXT,
    localizacao TEXT,
    capacidade INTEGER,
    removido BOOLEAN DEFAULT 0
  )`);
});

// Rota para testar o servidor
app.get('/', (req, res) => {
  res.send('API de Salas de Aula');
});

// Rota para listar todas as salas de aula
app.get('/salasdeaula', (req, res) => {
  db.all('SELECT * FROM salasdeaula WHERE removido = 0', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

// Rota para buscar uma sala de aula por ID
app.get('/salasdeaula/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM salasdeaula WHERE salasdeaulaid = ? AND removido = 0', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: row });
  });
});

// Rota para inserir uma nova sala de aula
app.post('/salasdeaula', (req, res) => {
  const { descricao, localizacao, capacidade } = req.body;
  const sql = `INSERT INTO salasdeaula (descricao, localizacao, capacidade) VALUES (?, ?, ?)`;
  db.run(sql, [descricao, localizacao, capacidade], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ salasdeaulaid: this.lastID });
  });
});

// Rota para atualizar uma sala de aula
app.put('/salasdeaula/:id', (req, res) => {
  const { id } = req.params;
  const { descricao, localizacao, capacidade } = req.body;
  const sql = `UPDATE salasdeaula SET descricao = ?, localizacao = ?, capacidade = ? WHERE salasdeaulaid = ? AND removido = 0`;
  db.run(sql, [descricao, localizacao, capacidade, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Sala de aula atualizada' });
  });
});

// Rota para remover uma sala de aula (soft delete)
app.delete('/salasdeaula/:id', (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE salasdeaula SET removido = 1 WHERE salasdeaulaid = ?`;
  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Sala de aula removida' });
  });
});

// Iniciando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});