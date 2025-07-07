import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CgNotes } from "react-icons/cg";
import { CiFilter } from "react-icons/ci";
import Title from "../styles/Title";
import Icon from "../styles/IconHeader";

function Ordens() {
  const navigate = useNavigate();

  const [ordens, setOrdens] = useState([]);
  const [ordensFiltradas, setOrdensFiltradas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState("todas");
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState("todos");
  const [mesSelecionado, setMesSelecionado] = useState("");
  const [busca, setBusca] = useState("");
  const [showTokenExpiredModal, setShowTokenExpiredModal] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowTokenExpiredModal(true);
      setCarregando(false);
      return;
    }

    // Carregar empresas
    fetch("http://localhost:8080/empresas", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) throw new Error("Sessão expirada");
        return res.json();
      })
      .then(setEmpresas)
      .catch((err) => {
        console.error(err);
        if (err.message === "Sessão expirada") setShowTokenExpiredModal(true);
      });

    // Carregar técnicos
    fetch("http://localhost:8080/tecnicos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) throw new Error("Sessão expirada");
        return res.json();
      })
      .then(setTecnicos)
      .catch((err) => {
        console.error(err);
        if (err.message === "Sessão expirada") setShowTokenExpiredModal(true);
      });

    setCarregando(false);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let url = "http://localhost:8080/ordens";
    const params = [];

    if (empresaSelecionada !== "todas") {
      params.push(`empresa_id=${empresaSelecionada}`);
    }
    if (tecnicoSelecionado !== "todos") {
      params.push(`tecnico_id=${tecnicoSelecionado}`);
    }

    if (params.length > 0) url += "?" + params.join("&");

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) throw new Error("Sessão expirada");
        return res.json();
      })
      .then(setOrdens)
      .catch((err) => {
        console.error(err);
        if (err.message === "Sessão expirada") setShowTokenExpiredModal(true);
      });
  }, [empresaSelecionada, tecnicoSelecionado]);

  useEffect(() => {
    const filtradas = ordens.filter((ordem) => {
      const termo = busca.toLowerCase();
      const dataCriacao = new Date(ordem.data_criacao);

      const correspondeBusca =
        ordem.tecnico_nome?.toLowerCase().includes(termo) ||
        ordem.empresa_nome?.toLowerCase().includes(termo) ||
        ordem.data_criacao?.includes(termo);

      const correspondeMes =
        !mesSelecionado ||
        dataCriacao.toISOString().slice(0, 7) === mesSelecionado;

      return correspondeBusca && correspondeMes;
    });

    setOrdensFiltradas(filtradas);
  }, [busca, mesSelecionado, ordens]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  if (carregando) return <p>Carregando...</p>;

  return (
    <div className="p-4 bg-white rounded shadow max-w-7xl mx-auto">
      <div id="header" className="flex items-center gap-3 font-medium mb-4">
        <Icon>
          <CgNotes className="text-5xl text-blue-700" />
        </Icon>
        <Title>Ordens de Serviço</Title>
      </div>

      <div className="flex flex-col gap-4 p-4 border w-full rounded-md shadow-xl">
        <div className="flex items-center gap-3">
          <CiFilter className="text-3xl text-blue-700" />
          <h1 className="text-lg font-semibold">Filtros</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Buscar por técnico, empresa ou data"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />

          <select
            onChange={(e) => setEmpresaSelecionada(e.target.value)}
            value={empresaSelecionada}
            className="border px-2 py-1 rounded w-full"
          >
            <option value="todas">Todas as Empresas</option>
            {empresas.map((empresa) => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nome}
              </option>
            ))}
          </select>

          <select
            onChange={(e) => setTecnicoSelecionado(e.target.value)}
            value={tecnicoSelecionado}
            className="border px-2 py-1 rounded w-full"
          >
            <option value="todos">Todos os Técnicos</option>
            {tecnicos.map((tecnico) => (
              <option key={tecnico.id} value={tecnico.id}>
                {tecnico.nome}
              </option>
            ))}
          </select>

          <input
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
        </div>
      </div>

      <div className="shadow-xl p-4 mt-4 rounded-md border overflow-x-auto">
        {ordensFiltradas.length === 0 ? (
          <p className="text-gray-500 text-center mt-8">
            Nenhuma ordem de serviço encontrada.
          </p>
        ) : (
          <table className="w-full min-w-[600px] border-collapse border border-gray-300 rounded-md">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Data</th>
                <th className="border p-2 text-left">Técnico</th>
                <th className="border p-2 text-left">Empresa</th>
                <th className="border p-2 text-left">Horário</th>
                <th className="border p-2 text-left">Remoto / Local</th>
                <th className="border p-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {ordensFiltradas.map((ordem) => (
                <tr key={ordem.id} className="hover:bg-gray-50">
                  <td className="border p-2">
                    {new Date(ordem.data_criacao).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="border p-2">
                    {ordem.tecnico_nome || "Técnico não encontrado"}
                  </td>
                  <td className="border p-2">
                    {ordem.empresa_nome || "Empresa não encontrada"}
                  </td>
                  <td className="border p-2">
                    {ordem.hora_inicio} - {ordem.hora_fim}
                  </td>
                  <td className="border p-2 capitalize">{ordem.local}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => navigate(`/ordens/${ordem.id}`)}
                      className="text-blue-600 underline"
                    >
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showTokenExpiredModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleLogout}
        >
          <div
            className="bg-white p-6 rounded shadow-lg max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Sessão Expirada</h2>
            <p className="mb-6">
              Sua sessão expirou. Clique em OK para fazer login novamente.
            </p>
            <button
              onClick={handleLogout}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ordens;
