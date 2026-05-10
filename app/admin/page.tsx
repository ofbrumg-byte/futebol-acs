"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [senha, setSenha] = useState("");
  const [logado, setLogado] = useState(false);

  const [titulo, setTitulo] = useState(
    "FUTEBOL ACS ⚽"
  );

  const [valor, setValor] = useState("5");

  const [duracao, setDuracao] =
    useState("2");

  const [novaSenha, setNovaSenha] =
    useState("");

  const [jogadores, setJogadores] =
    useState<any[]>([]);

  useEffect(() => {
    carregarJogadores();

    const tituloSalvo =
      localStorage.getItem("tituloLista");

    const valorSalvo =
      localStorage.getItem("valorLista");

    const senhaSalva =
      localStorage.getItem("senhaAdmin");

    const duracaoSalva =
      localStorage.getItem("duracaoFutebol");

    if (!senhaSalva) {
      localStorage.setItem(
        "senhaAdmin",
        "Bandeira193"
      );
    }

    if (tituloSalvo) {
      setTitulo(tituloSalvo);
    }

    if (valorSalvo) {
      setValor(valorSalvo);
    }

    if (duracaoSalva) {
      setDuracao(duracaoSalva);
    }
  }, []);

  async function carregarJogadores() {
    const { data } = await supabase
      .from("jogadores")
      .select("*")
      .order("id", { ascending: true });

    if (data) {
      setJogadores(data);
    }
  }

  function entrar() {
    const senhaAtual =
      localStorage.getItem("senhaAdmin");

    if (senha === senhaAtual) {
      setLogado(true);
    } else {
      alert("Senha incorreta");
    }
  }

  function salvarConfiguracoes() {
    localStorage.setItem(
      "tituloLista",
      titulo
    );

    localStorage.setItem(
      "valorLista",
      valor
    );

    localStorage.setItem(
      "duracaoFutebol",
      duracao
    );

    alert("Configurações salvas");
  }

  function alterarSenha() {
    if (novaSenha.trim() === "") {
      alert("Digite uma nova senha");
      return;
    }

    localStorage.setItem(
      "senhaAdmin",
      novaSenha
    );

    setNovaSenha("");

    alert("Senha alterada com sucesso");
  }

  async function resetarLista() {
    const confirmar = window.confirm(
      "Deseja realmente resetar toda a lista?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("jogadores")
      .delete()
      .gte("id", 1);

    if (error) {
      console.log(error);

      alert("Erro ao resetar lista");

      return;
    }

    alert("Lista resetada com sucesso");

    window.location.reload();
  }

  function gerarRelatorio() {
    const totalJogadores =
      jogadores.length;

    const totalArrecadado =
      jogadores.length * Number(valor);

    alert(
      `RELATÓRIO DE ARRECADAÇÃO\n\nJogadores Confirmados: ${totalJogadores}\nValor por Jogador: R$ ${valor}\n\nTOTAL ARRECADADO: R$ ${totalArrecadado}`
    );
  }

  if (!logado) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="bg-white text-black p-6 rounded-2xl w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-4">
            Área Administrativa
          </h1>

          <input
            type="password"
            placeholder="Digite a senha"
            value={senha}
            onChange={(e) =>
              setSenha(e.target.value)
            }
            className="w-full border p-3 rounded-lg mb-4"
          />

          <button
            onClick={entrar}
            className="w-full bg-black text-white p-3 rounded-lg"
          >
            Entrar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-8">
        Painel Admin
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="text-2xl font-bold mb-4">
          Configurações da Lista
        </h2>

        <label className="block mb-2 font-semibold">
          Título da Lista
        </label>

        <input
          type="text"
          value={titulo}
          onChange={(e) =>
            setTitulo(e.target.value)
          }
          className="w-full border p-3 rounded-lg mb-4"
        />

        <label className="block mb-2 font-semibold">
          Valor da Inscrição
        </label>

        <input
          type="number"
          value={valor}
          onChange={(e) =>
            setValor(e.target.value)
          }
          className="w-full border p-3 rounded-lg mb-4"
        />

        <label className="block mb-2 font-semibold">
          Duração do Futebol
        </label>

        <select
          value={duracao}
          onChange={(e) =>
            setDuracao(e.target.value)
          }
          className="w-full border p-3 rounded-lg mb-4"
        >
          <option value="1">
            1 Hora
          </option>

          <option value="2">
            2 Horas
          </option>
        </select>

        <button
          onClick={salvarConfiguracoes}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Salvar Configurações
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="text-2xl font-bold mb-4">
          Alterar Senha do Desenvolvedor
        </h2>

        <input
          type="password"
          placeholder="Nova senha"
          value={novaSenha}
          onChange={(e) =>
            setNovaSenha(e.target.value)
          }
          className="w-full border p-3 rounded-lg mb-4"
        />

        <button
          onClick={alterarSenha}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg"
        >
          Alterar Senha
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="text-2xl font-bold mb-4">
          Controle da Lista
        </h2>

        <button
          onClick={resetarLista}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Resetar Lista
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-4">
          Relatório de Arrecadação
        </h2>

        <p className="mb-2 font-semibold">
          Jogadores confirmados:{" "}
          {jogadores.length}
        </p>

        <p className="mb-4 font-semibold">
          Valor total atual: R${" "}
          {jogadores.length *
            Number(valor)}
        </p>

        <button
          onClick={gerarRelatorio}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Gerar Relatório
        </button>
      </div>
    </main>
  );
}