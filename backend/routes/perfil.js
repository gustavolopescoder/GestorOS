const express = require("express");
const router = express.Router();
const db = require("../db");
const autenticarToken = require("./auth");

router.get("/", autenticarToken, async (req, res) => {
  try {
    const tecnicoId = req.user.id;
    const empresaTiId = req.user.empresa_ti_id;

    // Buscar técnico (excluir senha e dados sensíveis)
    const tecnicoQuery = await db.query(
      "SELECT id, nome, email FROM tecnicos WHERE id = $1",
      [tecnicoId]
    );
    if (tecnicoQuery.rowCount === 0)
      return res.status(404).json({ erro: "Técnico não encontrado" });
    const tecnico = tecnicoQuery.rows[0];

    // Buscar empresa de TI
    const empresaQuery = await db.query(
      "SELECT id, nome FROM empresas_ti WHERE id = $1",
      [empresaTiId]
    );
    if (empresaQuery.rowCount === 0)
      return res.status(404).json({ erro: "Empresa TI não encontrada" });
    const empresa = empresaQuery.rows[0];

    res.json({ tecnico, empresa });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro interno" });
  }
});

module.exports = router;
