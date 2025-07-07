import "./index.css";
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";

import MenuLateral from "./componentes/Pages/Menu";
import AnimatedRoutes from "./componentes/Pages/AnimatedRoutes";
import Login from "./componentes/Pages/Login";

function AppContent() {
  const [empresas, setEmpresas] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // Persistência de login
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      setUser(JSON.parse(usuarioSalvo));
    }
  }, []);

  const handleLogin = (usuarioLogado) => {
    setUser(usuarioLogado);
    localStorage.setItem("usuario", JSON.stringify(usuarioLogado));
    navigate("/"); // redireciona após login
  };

  useEffect(() => {
    if (!user) return;

    fetch("http://localhost:8080/tecnicos")
      .then((res) => res.json())
      .then(setTecnicos)
      .catch((err) => console.error("Erro ao buscar técnicos:", err));
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetch("http://localhost:8080/ordens")
      .then((res) => res.json())
      .then(setOrdens)
      .catch((err) => console.error("Erro ao buscar ordens:", err));
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetch("http://localhost:8080/empresas")
      .then((res) => res.json())
      .then(setEmpresas)
      .catch((err) => console.error("Erro ao buscar empresas:", err));
  }, [user]);

  const adicionarOrdem = (novaOrdem) => {
    fetch("http://localhost:8080/ordens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaOrdem),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao criar ordem");
        return res.json();
      })
      .then((ordemCriada) => {
        setOrdens([...ordens, ordemCriada]);
      })
      .catch((err) => alert(err.message));
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }
  const deletarOrdem = async (id) => {
    try {
      const resposta = await fetch(`http://localhost:8080/ordens/${id}`, {
        method: "DELETE",
      });

      if (!resposta.ok) {
        throw new Error("Erro ao deletar ordem");
      }

      // Atualiza a lista local
      setOrdens((ordensAtuais) =>
        ordensAtuais.filter((ordem) => ordem.id !== id)
      );
    } catch (erro) {
      alert("Erro ao excluir ordem: " + erro.message);
    }
  };

  return (
    <>
      <MenuLateral usuarioLogado={user} />
      <div className="sm:ml-64 h-screen overflow-y-auto p-4 transition-all duration-300 bg-slate-50">
        <AnimatedRoutes
          ordens={ordens}
          empresas={empresas}
          tecnicos={tecnicos}
          adicionarOrdem={adicionarOrdem}
          deletarOrdem={deletarOrdem}
          handleLogin={handleLogin}
          usuarioLogado={user}
        />
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
