import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaPhoneAlt, FaUserCircle, FaEdit, FaUserSlash } from "react-icons/fa";
import { LuUser } from "react-icons/lu";
import Botao from "../styles/Botao";
import Title from "../styles/Title";
import Icon from "../styles/IconHeader";
import Card from "../styles/Cards";

function Tecnicos({ usuarioLogado }) {
  const [tecnicos, setTecnicos] = useState([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [modoAdicionar, setModoAdicionar] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [tecnicoEditandoId, setTecnicoEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const nomeEmpresaTiAtual = usuarioLogado?.empresa_ti_nome || "";

  const [showTokenExpiredModal, setShowTokenExpiredModal] = useState(false);

  useEffect(() => {
    if (!token) {
      setShowTokenExpiredModal(true);
      return;
    }

    axios
      .get("http://localhost:8080/tecnicos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const ordenados = res.data.sort((a, b) => a.nome.localeCompare(b.nome));
        setTecnicos(ordenados);
        setCarregando(false);
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          alert("Sessão expirada. Faça login novamente.");
          navigate("/login", { replace: true });
          return;
        }
        alert("Erro ao buscar técnicos");
        setCarregando(false);
      });
  }, [navigate, token]);

  const abrirAdicionar = () => {
    setNome("");
    setEmail("");
    setSenha("");
    setTelefone("");
    setModoAdicionar(true);
    setModoEditar(false);
    setTecnicoEditandoId(null);
  };

  const adicionarTecnico = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      alert("Preencha nome, email e senha.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8080/tecnicos",
        {
          nome,
          email,
          senha,
          empresa_ti_nome: nomeEmpresaTiAtual,
          telefone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTecnicos((prev) => [...prev, res.data]);
      fecharFormulario();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.erro || "Erro ao cadastrar técnico");
    }
  };

  const onEditar = (id) => {
    const tecnico = tecnicos.find((t) => t.id === id);
    if (!tecnico) return;

    setNome(tecnico.nome);
    setEmail(tecnico.email);
    setTelefone(tecnico.telefone || "");
    setSenha("");
    setModoEditar(true);
    setModoAdicionar(false);
    setTecnicoEditandoId(id);
  };

  const salvarEdicao = async () => {
    if (!nome.trim() || !email.trim()) {
      alert("Preencha nome e email.");
      return;
    }

    try {
      const payload = { nome, email, telefone };
      if (senha.trim()) payload.senha = senha;

      await axios.put(
        `http://localhost:8080/tecnicos/${tecnicoEditandoId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTecnicos((prev) =>
        prev.map((t) =>
          t.id === tecnicoEditandoId ? { ...t, nome, email, telefone } : t
        )
      );

      fecharFormulario();
    } catch (error) {
      console.error(error);
      alert("Erro ao editar técnico");
    }
  };

  const onDesativar = async (id) => {
    const tecnico = tecnicos.find((t) => t.id === id);
    if (!tecnico) return;

    const novoStatus = !tecnico.ativo;

    try {
      await axios.put(
        `http://localhost:8080/tecnicos/${id}/status`,
        { ativo: novoStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTecnicos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ativo: novoStatus } : t))
      );
    } catch (error) {
      console.error(error);
      alert("Erro ao alterar status do técnico");
    }
  };

  const fecharFormulario = () => {
    setNome("");
    setEmail("");
    setSenha("");
    setTelefone("");
    setModoAdicionar(false);
    setModoEditar(false);
    setTecnicoEditandoId(null);
  };

  if (carregando) return <p>Carregando técnicos...</p>;

  return (
    <div className="bg-slate-50 w-full h-full p-4 space-y-6 rounded">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          <Icon>
            <LuUser />
          </Icon>
          <Title>Técnicos</Title>
        </div>
        <Botao onClick={abrirAdicionar}>+ Novo Técnico</Botao>
      </div>

      {/* Formulário adicionar/editar */}
      {(modoAdicionar || modoEditar) && (
        <div className="bg-white p-4 rounded shadow space-y-3 max-w-md mx-auto">
          <h2 className="text-lg font-semibold">
            {modoEditar ? "Editar Técnico" : "Novo Técnico"}
          </h2>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do técnico"
            className="border p-2 rounded w-full"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder={
              modoEditar ? "Senha (deixe em branco p/ manter)" : "Senha"
            }
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="Telefone (opcional)"
            className="border p-2 rounded w-full"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={modoEditar ? salvarEdicao : adicionarTecnico}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {modoEditar ? "Salvar Alterações" : "Salvar"}
            </button>
            <button
              onClick={fecharFormulario}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <Card>
        {tecnicos.length === 0 ? (
          <p className="text-gray-500 text-center mt-8">
            Nenhum técnico cadastrado.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-6 justify-center">
            {tecnicos.map((tecnico) => (
              <li
                key={tecnico.id}
                className="w-full sm:w-[350px] md:w-[400px] border rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="flex-shrink-0">
                    {tecnico.avatarUrl ? (
                      <img
                        src={tecnico.avatarUrl}
                        alt={tecnico.nome}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="w-16 h-16 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {tecnico.nome}
                    </h3>
                    <div className="flex items-center text-gray-600 space-x-2 mt-1 truncate">
                      <FaPhoneAlt />
                      <span className="truncate">
                        {tecnico.telefone || "—"}
                      </span>
                    </div>
                    <div
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                        tecnico.ativo
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tecnico.ativo ? "Ativo" : "Inativo"}
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 mt-4 sm:mt-0">
                    <button
                      onClick={() => onEditar(tecnico.id)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                      title="Editar técnico"
                    >
                      <FaEdit />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => onDesativar(tecnico.id)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-800"
                      title={
                        tecnico.ativo ? "Desativar técnico" : "Ativar técnico"
                      }
                    >
                      <FaUserSlash />
                      <span>{tecnico.ativo ? "Desativar" : "Ativar"}</span>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
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

export default Tecnicos;
