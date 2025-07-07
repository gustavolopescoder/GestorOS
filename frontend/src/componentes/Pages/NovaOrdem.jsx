import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Botao from "../styles/Botao";
import Title from "../styles/Title";

function NovaOrdem() {
  const [empresas, setEmpresas] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [empresaId, setEmpresaId] = useState("");
  const [tecnicoId, setTecnicoId] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [solicitado, setSolicitado] = useState("");
  const [prestado, setPrestado] = useState("");
  const [local, setLocal] = useState("");
  const hoje = new Date().toISOString().slice(0, 10);
  const [dataCriacao, setDataCriacao] = useState(hoje);
  const [imagem, setImagem] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    Promise.all([
      fetch("http://localhost:8080/empresas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((r) => r.json()),

      fetch("http://localhost:8080/tecnicos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((r) => r.json()),
    ])
      .then(([empresasData, tecnicosData]) => {
        setEmpresas(empresasData || []);
        setTecnicos(tecnicosData || []);
      })
      .catch((err) => {
        console.error(err);
        setEmpresas([]);
        setTecnicos([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !empresaId ||
      !tecnicoId ||
      !horaInicio ||
      !horaFim ||
      !dataInicio ||
      !dataFim ||
      !solicitado ||
      !prestado ||
      !local
    ) {
      alert("Preencha todos os campos!");
      return;
    }

    const formData = new FormData();
    formData.append("empresa_id", empresaId);
    formData.append("tecnico_id", tecnicoId);
    formData.append("hora_inicio", horaInicio);
    formData.append("hora_fim", horaFim);
    formData.append("data_inicio", dataInicio);
    formData.append("data_fim", dataFim);
    formData.append("solicitado", solicitado);
    formData.append("prestado", prestado);
    formData.append("local", local);
    formData.append("data_criacao", dataCriacao);
    if (imagem) {
      formData.append("imagem", imagem);
    }

    const token = localStorage.getItem("token");

    fetch("http://localhost:8080/ordens", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then(async (res) => {
        let resposta;
        try {
          resposta = await res.json();
        } catch {
          resposta = null;
        }

        if (!res.ok) {
          const mensagemErro =
            (resposta && (resposta.message || JSON.stringify(resposta))) ||
            "Erro ao criar ordem";
          throw new Error(mensagemErro);
        }

        return resposta;
      })
      .then(() => {
        alert("Ordem criada com sucesso!");
        navigate("/");
      })
      .catch((err) => alert(err.message));
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="flex bg-slate-50 px-4 py-6 w-full overflow-y-auto">
      <div className="">
        <Title>Nova Ordem de Serviço</Title>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow space-y-6"
        >
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">
              Informações Básicas
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Empresa</label>
                <select
                  value={empresaId}
                  onChange={(e) => setEmpresaId(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Selecione a empresa</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Técnico Responsável</label>
                <select
                  value={tecnicoId}
                  onChange={(e) => setTecnicoId(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Selecione o técnico</option>
                  {tecnicos.map((tec) => (
                    <option key={tec.id} value={tec.id}>
                      {tec.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Remoto / Local</label>
                <select
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Selecione...</option>
                  <option value="remoto">Remoto</option>
                  <option value="local">Local</option>
                </select>
              </div>
            </div>
          </div>

          {/* Datas e horários */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">
              Datas e Horários
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Data de Início</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label>Data de Término</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label>Horário de Entrada</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label>Horário de Saída</label>
                <input
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label>Data do Chamado</label>
                <input
                  type="date"
                  value={dataCriacao}
                  onChange={(e) => setDataCriacao(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>
          </div>

          {/* Descrição dos Serviços */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">
              Descrição dos Serviços
            </h2>
            <div>
              <label>Serviço Solicitado</label>
              <textarea
                value={solicitado}
                onChange={(e) => setSolicitado(e.target.value)}
                className="border p-2 rounded w-full"
                rows="3"
              />
            </div>
            <div>
              <label>Serviço Prestado</label>
              <textarea
                value={prestado}
                onChange={(e) => setPrestado(e.target.value)}
                className="border p-2 rounded w-full"
                rows="3"
              />
            </div>
            <div>
              <label>Imagem (opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagem(e.target.files[0])}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>

          {/* Botão */}
          <div>
            <Botao type="submit">Criar Ordem de Serviço</Botao>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NovaOrdem;
