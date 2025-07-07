import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { GoAlertFill, GoClockFill } from "react-icons/go";
import { FaPlus } from "react-icons/fa6";
import { LuNotepadText } from "react-icons/lu";
import { PiBuildingOffice } from "react-icons/pi";
import Botao from "../styles/Botao";
import Title from "../styles/Title";
import Icon from "../styles/IconHeader";
import IconDivs from "../styles/IconDivs";
import { IoIosFlash } from "react-icons/io";

function Dashboard() {
  const navigate = useNavigate();
  const [ordens, setOrdens] = useState([]);
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth();
  const anoAtual = dataAtual.getFullYear();
  const [showTokenExpiredModal, setShowTokenExpiredModal] = useState(false);
  const token = localStorage.getItem("token");

  if (!token) {
    setShowTokenExpiredModal(true);
    return;
  }
  useEffect(() => {
    fetch("http://localhost:8080/ordens")
      .then((res) => res.json())
      .then((data) => setOrdens(data))
      .catch((err) => console.error("Erro ao buscar ordens:", err));
  }, []);

  const abrirNovaOS = () => navigate("/newordem");

  const chamadosMesAtual = ordens.filter((c) => {
    const dataChamado = new Date(c.data_criacao);
    return (
      dataChamado.getMonth() === mesAtual &&
      dataChamado.getFullYear() === anoAtual
    );
  });

  const contagemEmpresas = {};
  chamadosMesAtual.forEach((c) => {
    const empresa = c.empresa_nome ?? "Desconhecida";
    contagemEmpresas[empresa] = (contagemEmpresas[empresa] || 0) + 1;
  });

  const ranking = Object.entries(contagemEmpresas)
    .map(([empresa, total]) => ({ empresa, total }))
    .sort((a, b) => b.total - a.total);

  const ordensRecentes = [...ordens]
    .sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao))
    .slice(0, 5);

  return (
    <div className="bg-slate-50 w-full h-full p-2 space-y-6 rounded">
      <div id="header" className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon>
            <RiDashboardHorizontalLine />
          </Icon>
          <Title>Dashboard</Title>
        </div>
        <Botao onClick={abrirNovaOS}>Abrir OS</Botao>
      </div>

      {/* Ranking por empresa */}
      <div className="bg-white p-4 rounded-xl shadow-xl">
        <div id="header" className="flex items-center gap-3">
          <IconDivs className="text-red-600">
            <GoAlertFill />
          </IconDivs>
          <Title>
            Mais chamados no mês de{" "}
            {dataAtual.toLocaleDateString("pt-BR", {
              month: "long",
            })}
          </Title>
        </div>
        {ranking.length === 0 ? (
          <p className="text-gray-500">Nenhum chamado registrado este mês.</p>
        ) : (
          <ul className="space-y-3">
            {ranking.map(({ empresa, total }, index) => (
              <li
                key={index}
                className={`flex justify-between items-center px-3 py-2 rounded-md ${
                  index === 0
                    ? "bg-red-100 font-semibold"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <span>{empresa}</span>
                <span className="text-blue-700 font-bold">
                  {total} chamado(s)
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Ordens recentes */}
      <div className="bg-white shadow-2xl p-4 rounded-md">
        <div className="flex items-center gap-2 mb-4">
          <IconDivs className="text-blue-600">
            <GoClockFill />
          </IconDivs>
          <Title>Ordens Recentes</Title>
        </div>

        {ordensRecentes.length === 0 ? (
          <p className="text-gray-500">Nenhuma ordem registrada.</p>
        ) : (
          <ul className="space-y-2">
            {ordensRecentes.slice(0, 3).map((ordem) => (
              <li
                key={ordem.id}
                className="border-b pb-2 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{ordem.empresa_nome}</p>
                  <p className="text-sm text-gray-500">
                    {ordem.tecnico_nome} -{" "}
                    {new Date(ordem.data_criacao).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/ordens/${ordem.id}`)}
                  className="text-blue-600 text-sm"
                >
                  Ver
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div id="acoesrapidas" className="bg-white shadow p-4 rounded-md">
        <div id="header" className="flex items-center gap-2">
          <IconDivs className="text-blue-600">
            <IoIosFlash />
          </IconDivs>
          <Title>Ações Rápidas</Title>
        </div>
        <div className="flex flex-col sm:flex-wrap gap-4 mt-4  justify-start items-start">
          <button
            onClick={abrirNovaOS}
            className="flex items-center gap-2 hover:text-blue-700 transition-all duration-200"
          >
            <FaPlus /> Abrir Nova OS
          </button>
          <button
            onClick={() => navigate("/ordens")}
            className="flex items-center gap-2 hover:text-blue-700 transition-all duration-200"
          >
            <LuNotepadText />
            Ordens de Serviço
          </button>
          <button
            onClick={() => navigate("/empresas")}
            className="flex items-center gap-2 hover:text-blue-700 transition-all duration-200"
          >
            <PiBuildingOffice />
            Empresas
          </button>
        </div>
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
              onClick={() => {
                localStorage.removeItem("usuario");
                window.location.reload();
              }}
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

export default Dashboard;
