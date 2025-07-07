const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middlewares/authMiddleware");

// Todas as rotas abaixo precisam do token válido
router.use(authMiddleware);

// Listar técnicos da empresa do usuário logado
router.get("/", async (req, res) => {
  try {
    const empresaTiId = req.user.empresa_ti_id;

    const result = await db.query(
      "SELECT id, nome, telefone, email, ativo FROM tecnicos WHERE empresa_ti_id = $1",
      [empresaTiId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar técnicos:", error);
    res.status(500).json({ erro: "Erro interno ao buscar técnicos" });
  }
});

// Criar técnico vinculado à empresa do usuário logado
router.post("/", async (req, res) => {
  const { nome, telefone, email, senha } = req.body;
  const empresaTiId = req.user.empresa_ti_id;

  try {
    // Verifica email duplicado
    const tecnicoExistente = await db.query(
      "SELECT id FROM tecnicos WHERE email = $1",
      [email]
    );
    if (tecnicoExistente.rowCount > 0) {
      return res.status(400).json({ erro: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const insertResult = await db.query(
      `INSERT INTO tecnicos (nome, telefone, email, senha_hash, ativo, empresa_ti_id)
       VALUES ($1, $2, $3, $4, true, $5) RETURNING id, nome, telefone, email, ativo`,
      [nome, telefone, email, senhaHash, empresaTiId]
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error("Erro ao cadastrar técnico:", error);
    res.status(500).json({ erro: "Erro interno ao cadastrar técnico" });
  }
});

// Deletar técnico apenas da empresa do usuário logado
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const empresaTiId = req.user.empresa_ti_id;

  try {
    const result = await db.query(
      "DELETE FROM tecnicos WHERE id = $1 AND empresa_ti_id = $2 RETURNING *",
      [id, empresaTiId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: "Técnico não encontrado" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar técnico:", err);
    res.status(500).json({ erro: "Erro ao excluir técnico" });
  }
});

// Desativar técnico (empresa filtro)
router.patch("/:id/desativar", async (req, res) => {
  const { id } = req.params;
  const empresaTiId = req.user.empresa_ti_id;

  try {
    const result = await db.query(
      "UPDATE tecnicos SET ativo = false WHERE id = $1 AND empresa_ti_id = $2 RETURNING *",
      [id, empresaTiId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: "Técnico não encontrado" });
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("Erro ao desativar técnico:", error);
    res.status(500).send("Erro ao desativar técnico");
  }
});

// Ativar/desativar técnico
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { ativo } = req.body;
  const empresaTiId = req.user.empresa_ti_id;

  try {
    const result = await db.query(
      "UPDATE tecnicos SET ativo = $1 WHERE id = $2 AND empresa_ti_id = $3 RETURNING *",
      [ativo, id, empresaTiId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: "Técnico não encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar status do técnico:", error);
    res.status(500).json({ erro: "Erro ao atualizar status" });
  }
});

// Atualizar técnico (com filtro empresa)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, senha } = req.body;
  const empresaTiId = req.user.empresa_ti_id;

  try {
    let senhaHash;
    if (senha && senha.trim() !== "") {
      senhaHash = await bcrypt.hash(senha, 10);
    }

    const query = senhaHash
      ? `UPDATE tecnicos SET nome = $1, email = $2, telefone = $3, senha_hash = $4
         WHERE id = $5 AND empresa_ti_id = $6 RETURNING *`
      : `UPDATE tecnicos SET nome = $1, email = $2, telefone = $3
         WHERE id = $4 AND empresa_ti_id = $5 RETURNING *`;

    const values = senhaHash
      ? [nome, email, telefone, senhaHash, id, empresaTiId]
      : [nome, email, telefone, id, empresaTiId];

    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: "Técnico não encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao editar técnico:", error);
    res.status(500).json({ erro: "Erro interno ao editar técnico" });
  }
});

module.exports = router;
