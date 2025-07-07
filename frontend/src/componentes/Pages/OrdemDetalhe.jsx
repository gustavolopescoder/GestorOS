import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdLocalPrintshop } from "react-icons/md";
import { IoIosArrowBack } from "react-icons/io";
import Botao from "../styles/Botao";
function OrdemDetalhe({ deletarOrdem }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ordemDetalhe, setOrdemDetalhe] = useState(null);
  const printRef = useRef(); // Referência para o conteúdo a imprimir

  const calcularDuracao = (horaInicio, horaFim) => {
    if (!horaInicio || !horaFim) return "N/A";

    const [h1, m1, s1] = horaInicio.split(":").map(Number);
    const [h2, m2, s2] = horaFim.split(":").map(Number);

    const inicioSegundos = h1 * 3600 + m1 * 60 + s1;
    const fimSegundos = h2 * 3600 + m2 * 60 + s2;

    const diffSegundos = fimSegundos - inicioSegundos;
    if (diffSegundos < 0) return "Horário inválido";

    const horas = Math.floor(diffSegundos / 3600);
    const minutos = Math.floor((diffSegundos % 3600) / 60);

    return `${horas}h ${minutos}min`;
  };

  function formatarDataISO(isoString) {
    if (!isoString) return "N/A";
    const data = new Date(isoString);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
  }

  useEffect(() => {
    fetch(`http://localhost:8080/ordens/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ordem não encontrada");
        return res.json();
      })
      .then(setOrdemDetalhe)
      .catch((err) => {
        console.error("Erro ao buscar ordem:", err);
        navigate("/ordens");
      });
  }, [id, navigate]);

  if (!ordemDetalhe) return <p>Carregando...</p>;

  const duracao = calcularDuracao(
    ordemDetalhe.hora_inicio,
    ordemDetalhe.hora_fim
  );

  // Função para imprimir apenas o conteúdo dentro da div referenciada
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const newWindow = window.open("", "", "width=800,height=600");
    newWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Ordem</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            img {
              max-width: 150px;
              height: auto;
              display: block;
              margin-top: 10px;
            }
            .flex {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .font-semibold {
              font-weight: 600;
            }
            .bg-gray-100 {
              background-color: #f5f5f5;
              padding: 10px;
              border-radius: 6px;
              white-space: pre-wrap;
              margin-top: 5px;
              margin-bottom: 10px;
            }
            h1 {
              color: #2563eb;
              margin-bottom: 10px;
            }
            hr {
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex  flex-col gap-2 justify-center items-start p-6">
      <div
        className=" bg-white p-2 w-full flex justify-between h-16 rounded-md shadow"
        id="botoes"
      >
        <button
          onClick={handlePrint}
          className="text-green-500 text-3xl px-6 py-2 rounded-md mr-2 hover:border hover:border-green-500 transition-all duration-200"
        >
          <MdLocalPrintshop />
        </button>
        <button
          onClick={async () => {
            const confirmacao = window.confirm(
              "Tem certeza que deseja excluir esta ordem?"
            );
            if (!confirmacao) return;

            try {
              const resposta = await fetch(
                `http://localhost:8080/ordens/${ordemDetalhe.id}`,
                {
                  method: "DELETE",
                }
              );

              if (!resposta.ok) throw new Error("Erro ao excluir");

              alert("Ordem excluída com sucesso.");
              navigate("/ordens");
            } catch (erro) {
              alert("Erro ao excluir ordem: " + erro.message);
            }
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Excluir Ordem
        </button>

        <Botao
          onClick={() => window.history.back()}
          className="bg-blue-600 text-white flex items-center px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <IoIosArrowBack />
          Voltar
        </Botao>
      </div>
      <div ref={printRef} className="bg-white shadow-lg rounded-lg w-full p-8">
        <header className="flex items-center gap-4 border-b pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">
              Novo Nivel Informatica
            </h1>
            <p className="text-gray-600 text-sm">Ordem de Serviço Detalhada</p>
          </div>
        </header>

        {/* Corpo da Ordem */}
        <section className="space-y-4 text-gray-800">
          <div className="flex justify-between">
            <span className="font-semibold">Empresa:</span>
            <span>{ordemDetalhe.empresa_nome || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Técnico:</span>
            <span>{ordemDetalhe.tecnico_nome || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Data do Chamado:</span>
            <span>{formatarDataISO(ordemDetalhe.data_criacao)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Data de Início:</span>
            <span>{formatarDataISO(ordemDetalhe.data_inicio)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Data de Fim:</span>
            <span>{formatarDataISO(ordemDetalhe.data_fim)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Hora de Início:</span>
            <span>{ordemDetalhe.hora_inicio || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Hora de Fim:</span>
            <span>{ordemDetalhe.hora_fim || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Tempo de Serviço:</span>
            <span>{duracao}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Local:</span>
            <span>{ordemDetalhe.local || "N/A"}</span>
          </div>
          <div>
            <p className="font-semibold mb-1">Serviço Solicitado:</p>
            <p className="bg-gray-100 p-3 rounded">
              {ordemDetalhe.solicitado || "N/A"}
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">Serviço Prestado:</p>
            <p className="bg-gray-100 p-3 rounded break-words whitespace-pre-wrap">
              {ordemDetalhe.prestado || "N/A"}
            </p>
          </div>
          <div>
            <img
              src={`http://localhost:8080/uploads/${ordemDetalhe.imagem}`}
              alt="Imagem da ordem"
              style={{ maxWidth: "150px" }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default OrdemDetalhe;
