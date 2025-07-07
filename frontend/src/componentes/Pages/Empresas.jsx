import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { CiLocationOn } from "react-icons/ci";
import Botao from "../styles/Botao";
import Title from "../styles/Title";
import Icon from "../styles/IconHeader";
import IconDivs from "../styles/IconDivs";

function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [nomeNovaEmpresa, setNomeNovaEmpresa] = useState("");
  const [cnpjNovaEmpresa, setCnpjNovaEmpresa] = useState("");
  const [enderecoNovaEmpresa, setEnderecoNovaEmpresa] = useState("");
  const [empresaEditandoId, setEmpresaEditandoId] = useState(null);
  const [modoAdicionar, setModoAdicionar] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [showTokenExpiredModal, setShowTokenExpiredModal] = useState(false);

  const navigate = useNavigate();

  // Abre o formulário para adicionar nova empresa
  const abrirAdicionar = () => {
    setNomeNovaEmpresa("");
    setCnpjNovaEmpresa("");
    setEnderecoNovaEmpresa("");
    setEmpresaEditandoId(null);
    setModoAdicionar(true);
  };

  // Preenche o formulário para edição
  const editarEmpresa = (empresa) => {
    setNomeNovaEmpresa(empresa.nome);
    setCnpjNovaEmpresa(empresa.cnpj);
    setEnderecoNovaEmpresa(empresa.endereco || "");
    setEmpresaEditandoId(empresa.id);
    setModoAdicionar(true);
  };

  // Salva empresa (novo ou edição)
  const salvarEmpresa = () => {
    if (!nomeNovaEmpresa.trim()) {
      alert("Nome e CNPJ são obrigatórios");
      return;
    }

    const dados = {
      nome: nomeNovaEmpresa,
      cnpj: cnpjNovaEmpresa,
      endereco: enderecoNovaEmpresa,
    };

    const url = empresaEditandoId
      ? `http://localhost:8080/empresas/${empresaEditandoId}`
      : "http://localhost:8080/empresas";

    const metodo = empresaEditandoId ? "PUT" : "POST";

    const token = localStorage.getItem("token");

    fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao salvar empresa");
        return res.json();
      })
      .then((empresaSalva) => {
        if (empresaEditandoId) {
          setEmpresas((prev) =>
            prev.map((e) => (e.id === empresaEditandoId ? empresaSalva : e))
          );
          alert("Empresa editada com sucesso!");
        } else {
          setEmpresas((prev) =>
            [...prev, empresaSalva].sort((a, b) => a.nome.localeCompare(b.nome))
          );
          alert("Empresa adicionada com sucesso!");
        }

        // Reseta estado do formulário
        setModoAdicionar(false);
        setEmpresaEditandoId(null);
        setNomeNovaEmpresa("");
        setCnpjNovaEmpresa("");
        setEnderecoNovaEmpresa("");
      })
      .catch((err) => alert(err.message));
  };

  // Ativa ou desativa empresa
  const alternarStatusEmpresa = (id, statusAtual) => {
    const novoStatus = !statusAtual;
    const token = localStorage.getItem("token");

    fetch(`http://localhost:8080/empresas/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ativo: novoStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao atualizar status da empresa");
        return res.json();
      })
      .then((empresaAtualizada) => {
        setEmpresas((prev) =>
          prev.map((emp) =>
            emp.id === empresaAtualizada.id ? empresaAtualizada : emp
          )
        );
      })
      .catch((err) => alert(err.message));
  };

  // Carrega empresas ao montar o componente
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowTokenExpiredModal(true);
      setCarregando(false);
      return;
    }

    fetch("http://localhost:8080/empresas", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          setShowTokenExpiredModal(true);
          throw new Error("Não autorizado");
        }
        return res.json();
      })
      .then((data) => {
        const ativas = data.filter((e) => e.ativo);
        const ordenadas = ativas.sort((a, b) => a.nome.localeCompare(b.nome));
        setEmpresas(ordenadas);
        setCarregando(false);
      })
      .catch((err) => {
        console.error(err);
        setCarregando(false);
      });
  }, [navigate]);

  // Fecha modal e redireciona para login
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  if (carregando) return <p>Carregando empresas...</p>;

  return (
    <div className="bg-slate-50 rounded w-full min-h-screen p-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-2">
          <Icon>
            <HiOutlineBuildingOffice2 />
          </Icon>
          <Title>Empresas</Title>
        </div>
        <Botao onClick={abrirAdicionar}>+ Nova Empresa</Botao>
      </div>

      {modoAdicionar && (
        <div className="bg-white p-4 rounded shadow space-y-3 max-w-lg mx-auto">
          <h2 className="text-lg font-semibold">
            {empresaEditandoId ? "Editar Empresa" : "Nova Empresa"}
          </h2>
          <input
            type="text"
            value={nomeNovaEmpresa}
            onChange={(e) => setNomeNovaEmpresa(e.target.value)}
            placeholder="Nome da empresa"
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            value={cnpjNovaEmpresa}
            onChange={(e) => setCnpjNovaEmpresa(e.target.value)}
            placeholder="CNPJ da empresa"
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            value={enderecoNovaEmpresa}
            onChange={(e) => setEnderecoNovaEmpresa(e.target.value)}
            placeholder="Endereço da empresa"
            className="border p-2 rounded w-full"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={salvarEmpresa}
              className="bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto text-center"
            >
              Salvar
            </button>
            <button
              onClick={() => setModoAdicionar(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded w-full sm:w-auto text-center"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded shadow">
        {empresas.length === 0 ? (
          <p className="text-gray-500 text-center p-4 flex items-center justify-center gap-3">
            <IconDivs className="text-gray-400">
              <h1>X</h1>
            </IconDivs>
            Nenhuma empresa cadastrada.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-6 justify-center">
            {empresas.map((empresa) => (
              <li
                key={empresa.id}
                className="w-full sm:w-[350px] md:w-[400px] border rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-4 h-full flex flex-col justify-between min-h-[150px]">
                  <div className="flex items-start gap-4">
                    <HiOutlineBuildingOffice2 className="w-12 h-12 text-blue-600 flex-shrink-0" />
                    <div className="flex-grow space-y-1">
                      <h3 className="text-lg font-semibold text-gray-800 break-words">
                        {empresa.nome}
                      </h3>
                      <div className="flex items-center text-gray-600 gap-1 text-sm">
                        <CiLocationOn />
                        <span>{empresa.endereco || "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        empresa.ativo
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {empresa.ativo ? "Ativo" : "Inativo"}
                    </span>

                    <div className="flex gap-4">
                      <button
                        onClick={() => editarEmpresa(empresa)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        title="Editar empresa"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() =>
                          alternarStatusEmpresa(empresa.id, empresa.ativo)
                        }
                        className="text-red-600 hover:text-red-800 text-sm"
                        title={
                          empresa.ativo ? "Desativar empresa" : "Ativar empresa"
                        }
                      >
                        {empresa.ativo ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
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

export default Empresas;
