const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db"); // seu arquivo de conexão
require("dotenv").config();

router.post("/", async (req, res) => {
  const { email, senha } = req.body;

  console.log("Recebido login com:", { email, senha }); // Log para ver o que chega

  try {
    // Buscar técnico pelo email + nome da empresa
    const tecnicoResult = await db.query(
      `SELECT tecnicos.*, empresas_ti.nome AS empresa_ti_nome
       FROM tecnicos
       JOIN empresas_ti ON tecnicos.empresa_ti_id = empresas_ti.id
       WHERE tecnicos.email = $1`,
      [email]
    );

    if (tecnicoResult.rowCount === 0) {
      console.log("Técnico não encontrado para o email:", email);
      return res.status(401).json({ erro: "Técnico não encontrado" });
    }

    const tecnico = tecnicoResult.rows[0];
    console.log("Técnico encontrado:", tecnico);

    // Verificar senha
    const senhaOk = await bcrypt.compare(senha, tecnico.senha_hash);
    console.log("Resultado bcrypt.compare:", senhaOk);

    if (!senhaOk) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: tecnico.id,
        nome: tecnico.nome,
        email: tecnico.email,
        empresa_ti_id: tecnico.empresa_ti_id,
        empresa_ti_nome: tecnico.empresa_ti_nome,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Retornar técnico + token
    res.json({
      token,
      tecnico: {
        id: tecnico.id,
        nome: tecnico.nome,
        email: tecnico.email,
        empresa_ti_id: tecnico.empresa_ti_id,
        empresa_ti_nome: tecnico.empresa_ti_nome,
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ erro: "Erro interno no login" });
  }
});

module.exports = router;
