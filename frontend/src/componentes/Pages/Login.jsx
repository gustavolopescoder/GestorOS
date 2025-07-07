import { useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

function Login({ onLogin }) {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [erro, setErro] = useState("");

  // Login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Cadastro
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [emailCadastro, setEmailCadastro] = useState("");
  const [senhaCadastro, setSenhaCadastro] = useState("");

  const [nomeTecnico, setNomeTecnico] = useState("");
  const [emailTecnico, setEmailTecnico] = useState("");
  const [senhaTecnico, setSenhaTecnico] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/login", {
        email,
        senha,
      });

      const token = res.data.token;
      localStorage.setItem("token", token);

      if (onLogin) onLogin(res.data.tecnico);
    } catch (err) {
      console.error(err);
      setErro("Login inválido");
    }
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/empresas-ti", {
        nome: nomeEmpresa,
        email_admin: emailCadastro,
        senha_empresa: senhaCadastro,
        nome_tecnico: nomeTecnico,
        email_tecnico: emailTecnico,
        senha_tecnico: senhaTecnico,
      });

      alert("Cadastro realizado com sucesso!");
      setModoCadastro(false);

      // Limpar campos
      setNomeEmpresa("");
      setEmailCadastro("");
      setSenhaCadastro("");
      setNomeTecnico("");
      setEmailTecnico("");
      setSenhaTecnico("");
      setErro("");
    } catch (err) {
      console.error(err);
      setErro("Erro ao cadastrar empresa");
    }
  };

  const trocarModo = () => {
    setModoCadastro(!modoCadastro);
    setErro("");
    setEmail("");
    setSenha("");
    setNomeEmpresa("");
    setEmailCadastro("");
    setSenhaCadastro("");
    setNomeTecnico("");
    setEmailTecnico("");
    setSenhaTecnico("");
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-slate-50">
      <div className="flex w-4/5 h-5/6 relative overflow-hidden rounded-3xl shadow-xl">
        {/* Lado direito fixo */}
        <div className="relative w-2/4 flex flex-col text-center bg-gradient-to-br from-white to-[#e7e0f8] overflow-hidden justify-center items-center p-5 z-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {modoCadastro ? "Já tem uma conta?" : "Não tem uma conta?"}
          </h1>
          <p className="text-gray-600 text-sm max-w-xs">
            {modoCadastro
              ? "Faça login e gerencie suas ordens de serviço."
              : "Cadastre sua empresa agora e comece a usar o sistema em minutos."}
          </p>
          <button
            onClick={trocarModo}
            className="mt-6 px-6 py-2 rounded-md border border-gray-300 text-gray-800 font-medium hover:bg-gray-100 transition"
          >
            {modoCadastro ? "Voltar ao Login" : "Cadastre-se"}
          </button>
          <div className="pointer-events-none absolute top-60 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500 opacity-50 rounded-full blur-[100px] z-0" />
        </div>

        {/* Lado esquerdo com formulário */}
        <div className="w-2/4 bg-slate-800 rounded-s-xl p-8 flex items-center justify-center relative overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={modoCadastro ? "cadastro" : "login"}
              initial={{ x: modoCadastro ? 100 : -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: modoCadastro ? -100 : 100, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full max-w-md space-y-5"
            >
              {modoCadastro ? (
                <>
                  <h1 className="text-white font-bold text-3xl text-center">
                    Criar conta
                  </h1>
                  <form
                    onSubmit={handleCadastro}
                    className="flex flex-col gap-3"
                  >
                    <input
                      type="text"
                      value={nomeEmpresa}
                      onChange={(e) => setNomeEmpresa(e.target.value)}
                      required
                      placeholder="Nome da empresa"
                      className="bg-zinc-600 p-2 rounded-xl text-white"
                    />
                    <input
                      type="email"
                      value={emailCadastro}
                      onChange={(e) => setEmailCadastro(e.target.value)}
                      required
                      placeholder="E-mail da empresa"
                      className="bg-zinc-600 p-2 rounded-xl text-white"
                    />
                    <input
                      type="password"
                      value={senhaCadastro}
                      onChange={(e) => setSenhaCadastro(e.target.value)}
                      required
                      placeholder="Senha da empresa"
                      className="bg-zinc-600 p-2 rounded-xl text-white"
                    />
                    <hr className="border-zinc-500" />
                    <h1 className="text-white font-bold text-3xl text-center">
                      Técnico Administrador
                    </h1>
                    <input
                      type="text"
                      value={nomeTecnico}
                      onChange={(e) => setNomeTecnico(e.target.value)}
                      required
                      placeholder="Nome do técnico"
                      className="bg-zinc-600 p-2 rounded-xl text-white"
                    />
                    <input
                      type="email"
                      value={emailTecnico}
                      onChange={(e) => setEmailTecnico(e.target.value)}
                      required
                      placeholder="E-mail do técnico"
                      className="bg-zinc-600 p-2 rounded-xl text-white"
                    />
                    <input
                      type="password"
                      value={senhaTecnico}
                      onChange={(e) => setSenhaTecnico(e.target.value)}
                      required
                      placeholder="Senha do técnico"
                      className="bg-zinc-600 p-2 rounded-xl text-white"
                    />
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-indigo-500 to-violet-300 p-2 rounded-xl font-bold hover:scale-105 transition-all duration-700 hover:shadow-indigo-300 hover:shadow-md"
                    >
                      Cadastrar
                    </button>
                    {erro && <p className="text-red-500">{erro}</p>}
                  </form>
                </>
              ) : (
                <>
                  <h1 className="text-white font-bold text-3xl text-center">
                    Fazer login
                  </h1>
                  <form onSubmit={handleLogin} className="flex flex-col gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="E-mail"
                      className="bg-zinc-600 p-2 rounded-xl text-white"
                    />
                    <input
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                      placeholder="Senha"
                      className="bg-zinc-600 p-2 rounded-xl text-white"
                    />
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-indigo-500 to-violet-300 p-2 rounded-xl font-bold hover:scale-105 transition-all duration-700 hover:shadow-indigo-300 hover:shadow-md"
                    >
                      Entrar
                    </button>
                    {erro && <p className="text-red-500">{erro}</p>}
                  </form>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Login;
