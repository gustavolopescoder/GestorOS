const jwt = require("jsonwebtoken");
require("dotenv").config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ erro: "Token não fornecido" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ erro: "Token mal formatado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Exemplo: { id: 1, empresa_ti_id: 5, email: '...' }
    next();
  } catch (err) {
    return res.status(401).json({ erro: "Token inválido" });
  }
}

module.exports = authMiddleware;
