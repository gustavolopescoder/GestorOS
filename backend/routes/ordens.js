const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

// Buscar ordens com filtros
router.get("/", async (req, res) => {
  const { empresa_id, tecnico_id } = req.query;

  try {
    let query = `
      SELECT
        o.id,
        o.hora_inicio,
        o.hora_fim,
        o.local,
        o.data_inicio,
        o.data_fim,
        o.solicitado,
        o.prestado,
        o.data_criacao,
        o.imagem,
        e.nome AS empresa_nome,
        t.nome AS tecnico_nome
      FROM ordens_servico o
      JOIN empresas e ON o.empresa_id = e.id
      JOIN tecnicos t ON o.tecnico_id = t.id
    `;

    const conditions = [];
    const params = [];

    if (empresa_id) {
      params.push(empresa_id);
      conditions.push(`o.empresa_id = $${params.length}`);
    }

    if (tecnico_id) {
      params.push(tecnico_id);
      conditions.push(`o.tecnico_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }

    query += ` ORDER BY o.data_criacao DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar ordens:", error);
    res.status(500).json({ error: "Erro ao buscar ordens" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM ordens_servico WHERE id = $1", [
      id,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: "Ordem não encontrada" });
    }
    res.sendStatus(204);
  } catch (erro) {
    console.error("Erro ao deletar ordem:", erro);
    res.status(500).json({ erro: "Erro interno ao deletar ordem" });
  }
});

// Buscar ordem por ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `
      SELECT
        o.id,
        o.hora_inicio,
        o.hora_fim,
        o.local,
        o.data_inicio,
        o.data_fim,
        o.solicitado,
        o.prestado,
        o.data_criacao,
        o.imagem,
        e.nome AS empresa_nome,
        t.nome AS tecnico_nome
      FROM ordens_servico o
      JOIN empresas e ON o.empresa_id = e.id
      JOIN tecnicos t ON o.tecnico_id = t.id
      WHERE o.id = $1
      LIMIT 1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ordem não encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar ordem por id:", error);
    res.status(500).json({ error: "Erro ao buscar ordem" });
  }
});

// Criar nova ordem (com imagem)
router.post("/", upload.single("imagem"), async (req, res) => {
  try {
    const {
      empresa_id,
      tecnico_id,
      hora_inicio,
      hora_fim,
      local,
      data_inicio,
      data_fim,
      solicitado,
      prestado,
      data_criacao,
    } = req.body;

    const imagem = req.file ? req.file.filename : null;

    const result = await db.query(
      `
      INSERT INTO ordens_servico 
      (empresa_id, tecnico_id, hora_inicio, hora_fim, local, data_inicio, data_fim, solicitado, prestado, data_criacao, imagem)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `,
      [
        empresa_id,
        tecnico_id,
        hora_inicio,
        hora_fim,
        local,
        data_inicio,
        data_fim,
        solicitado,
        prestado,
        data_criacao,
        imagem,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar ordem:", error);
    res.status(500).json({ error: "Erro ao criar ordem" });
  }
});

module.exports = router;
