const express = require("express");
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

// Buscar todas as empresas da empresa_ti do usuário logado
router.get("/", async (req, res) => {
  try {
    const empresaTiId = req.user.empresa_ti_id;
    const result = await db.query(
      "SELECT * FROM empresas WHERE empresa_ti_id = $1",
      [empresaTiId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar empresas:", err);
    res.status(500).json({ error: "Erro ao buscar empresas" });
  }
});

// Criar nova empresa vinculada à empresa_ti do usuário logado
router.post("/", async (req, res) => {
  const { nome, cnpj, endereco } = req.body;
  const empresaTiId = req.user.empresa_ti_id;

  try {
    const result = await db.query(
      "INSERT INTO empresas (nome, cnpj, endereco, ativo, empresa_ti_id) VALUES ($1, $2, $3, true, $4) RETURNING *",
      [nome, cnpj, endereco, empresaTiId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao adicionar empresa:", err);
    res.status(500).json({ error: "Erro ao adicionar empresa" });
  }
});

// Buscar empresa por ID (somente da empresa_ti do usuário logado)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const empresaTiId = req.user.empresa_ti_id;

  try {
    const result = await db.query(
      "SELECT * FROM empresas WHERE id = $1 AND empresa_ti_id = $2",
      [id, empresaTiId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empresa não encontrada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar empresa:", err);
    res.status(500).json({ error: "Erro ao buscar empresa" });
  }
});

// Excluir empresa da empresa_ti do usuário logado
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const empresaTiId = req.user.empresa_ti_id;

  try {
    const result = await db.query(
      "DELETE FROM empresas WHERE id = $1 AND empresa_ti_id = $2 RETURNING *",
      [id, empresaTiId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Empresa não encontrada" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar empresa:", err);

    if (err.code === "23503") {
      return res.status(409).json({
        error:
          "Não é possível excluir a empresa pois existem registros relacionados",
      });
    }

    res.status(500).json({ error: "Erro ao excluir empresa" });
  }
});

// Atualizar ativo/inativo da empresa da empresa_ti do usuário logado
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { ativo } = req.body;
  const empresaTiId = req.user.empresa_ti_id;

  if (typeof ativo !== "boolean") {
    return res
      .status(400)
      .json({ error: "O campo 'ativo' deve ser true ou false" });
  }

  try {
    const result = await db.query(
      "UPDATE empresas SET ativo = $1 WHERE id = $2 AND empresa_ti_id = $3 RETURNING *",
      [ativo, id, empresaTiId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Empresa não encontrada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar empresa:", err);
    res.status(500).json({ error: "Erro ao atualizar empresa" });
  }
});

module.exports = router;
