const jwt = require("jsonwebtoken");

function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ erro: "Token não fornecido" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ erro: "Token inválido" });

    req.user = user; // user contém os dados do token, ex: {id, nome, empresa_ti_id...}
    next();
  });
}

module.exports = autenticarToken;
