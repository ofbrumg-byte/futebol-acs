"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [senha, setSenha] = useState("");
  const [logado, setLogado] = useState(false);

  const [titulo, setTitulo] =
    useState("FUTEBOL ACS ⚽");

  const [valor, setValor] =
    useState("5");

  const [duracao, setDuracao] =
    useState("2");

  const [novaSenha, setNovaSenha] =
    useState("");

  const [senhaBanco, setSenhaBanco] =
    useState("");

  const [jogadores, setJogadores] =
    useState<any[]>([]);

  useEffect(() => {
    carregarConfiguracoes();

    carregarJogadores();
  }, []);

  async function carregarConfiguracoes() {
    const { data } = await supabase
      .from("configuracoes")
      .select("*")
      .eq("id", 1)
      .single();

    if (data) {
      setTitulo(data.titulo);

      setValor(data.valor);

      setDuracao(data.duracao);

      setSenhaBanco(data.senha_admin);
    }
  }

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
    if (senha === senhaBanco) {
      setLogado(true);
    } else {
      alert("Senha incorreta");
    }
  }

  async function salvarConfiguracoes() {
    const { error } = await supabase
      .from("configuracoes")
      .update({
        titulo,
        valor,
        duracao,
      })
      .eq("id", 1);

    if (error) {
      alert("Erro ao salvar");

      return;
    }

    alert("Configurações salvas");
  }

  async function alterarSenha() {
    if (novaSenha.trim() === "") {
      alert("Digite uma nova senha");

      return;
    }

    const { error } = await supabase
      .from("configuracoes")
      .update({
        senha_admin: novaSenha,
      })
      .eq("id", 1);

    if (error) {
      alert("Erro ao alterar senha");

      return;
    }

    setSenhaBanco(novaSenha);

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
      jogadores.reduce(
        (total, jogador) =>
          total +
          Number(jogador.valor || 0),
        0
      );

    const relatorioJogadores =
      jogadores
        .map((jogador, index) => {
          const data = new Date(
            jogador.created_at
          );

          const dataFormatada =
            data.toLocaleDateString(
              "pt-BR"
            );

          const horaFormatada =
            data.toLocaleTimeString(
              "pt-BR"
            );

          return `${index + 1}. ${
            jogador.nome
          }

Valor: R$ ${
            jogador.valor || "0"
          }

Pagamento:
${dataFormatada} às ${horaFormatada}
`;
        })
        .join(
          "\n-------------------\n\n"
        );

    alert(
      `RELATÓRIO DE ARRECADAÇÃO

${relatorioJogadores}

-------------------

Jogadores Confirmados:
${totalJogadores}

TOTAL ARRECADADO:
R$ ${totalArrecadado}`
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
      <div className="w-full flex justify-end mb-6">
        <a
          href="/"
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Voltar para Página Principal
        </a>
      </div>

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
          {jogadores.reduce(
            (total, jogador) =>
              total +
              Number(
                jogador.valor || 0
              ),
            0
          )}
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