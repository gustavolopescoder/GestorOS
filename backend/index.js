const express = require("express");
const cors = require("cors");

const app = express();
const port = 8080;

// Middleware global
app.use(cors());
app.use(express.json());

// Rotas
const perfilRouter = require("./routes/perfil");
app.use("/api/perfil", perfilRouter);

const empresaTiRouter = require("./routes/empresas-ti");
app.use("/empresas-ti", empresaTiRouter);

const loginRoutes = require("./routes/login");
app.use("/login", loginRoutes);

app.use("/uploads", express.static("uploads"));
app.use("/empresas", require("./routes/empresas"));
app.use("/tecnicos", require("./routes/tecnicos"));
app.use("/ordens", require("./routes/ordens"));

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
