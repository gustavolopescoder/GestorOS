const bcrypt = require("bcrypt");

async function gerarHash(senha) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(senha, saltRounds);
  console.log(hash);
}

gerarHash("150405");
