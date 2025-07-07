// backend/routes/empresa-ti.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

// POST /empresas-ti
router.post("/", async (req, res) => {
  try {
    const {
      nome,
      email_admin,
      senha_empresa,
      nome_tecnico,
      email_tecnico,
      senha_tecnico,
    } = req.body;

    if (
      !nome ||
      !email_admin ||
      !senha_empresa ||
      !nome_tecnico ||
      !email_tecnico ||
      !senha_tecnico
    ) {
      return res.status(400).json({ error: "Preencha todos os campos" });
    }

    // Verificar se empresa já existe
    const empresaExistente = await pool.query(
      "SELECT * FROM empresas_ti WHERE email_admin = $1",
      [email_admin]
    );
    if (empresaExistente.rows.length > 0) {
      return res.status(409).json({ error: "Empresa já cadastrada" });
    }

    // Verificar se técnico já existe
    const tecnicoExistente = await pool.query(
      "SELECT * FROM tecnicos WHERE email = $1",
      [email_tecnico]
    );
    if (tecnicoExistente.rows.length > 0) {
      return res.status(409).json({ error: "Técnico já cadastrado" });
    }

    const senhaHashEmpresa = await bcrypt.hash(senha_empresa, 10);
    const senhaHashTecnico = await bcrypt.hash(senha_tecnico, 10);

    const empresaResult = await pool.query(
      "INSERT INTO empresas_ti (nome, email_admin, senha_hash) VALUES ($1, $2, $3) RETURNING id",
      [nome, email_admin, senhaHashEmpresa]
    );

    const empresa_ti_id = empresaResult.rows[0].id;

    const tecnicoResult = await pool.query(
      `INSERT INTO tecnicos (nome, email, ativo, empresa_ti_id, senha_hash)
       VALUES ($1, $2, true, $3, $4)
       RETURNING id, nome, email`,
      [nome_tecnico, email_tecnico, empresa_ti_id, senhaHashTecnico]
    );

    res.status(201).json({
      empresa: {
        id: empresa_ti_id,
        nome,
        email_admin,
      },
      tecnico_admin: tecnicoResult.rows[0],
    });
  } catch (err) {
    console.error("Erro ao cadastrar empresa:", err);
    res.status(500).json({ error: "Erro ao cadastrar empresa de TI" });
  }
});

module.exports = router;
