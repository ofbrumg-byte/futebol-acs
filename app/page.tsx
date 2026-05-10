"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function Home() {
  const [nome, setNome] = useState("");
  const [pix, setPix] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [jogadores, setJogadores] = useState<any[]>([]);

  const [meusJogadores, setMeusJogadores] =
    useState<string[]>([]);

  const [titulo, setTitulo] = useState(
    "FUTEBOL ACS ⚽"
  );

  const [valor, setValor] = useState("5");

  const [duracao, setDuracao] =
    useState("2");

  const limiteJogadores =
    duracao === "1" ? 15 : 22;

  useEffect(() => {
    carregarJogadores();

    const jogadoresSalvos =
      localStorage.getItem("meusJogadores");

    if (jogadoresSalvos) {
      setMeusJogadores(
        JSON.parse(jogadoresSalvos)
      );
    }

    const intervaloLista = setInterval(() => {
      carregarJogadores();
    }, 2000);

    const tituloSalvo =
      localStorage.getItem("tituloLista");

    const valorSalvo =
      localStorage.getItem("valorLista");

    const duracaoSalva =
      localStorage.getItem("duracaoFutebol");

    if (tituloSalvo) {
      setTitulo(tituloSalvo);
    }

    if (valorSalvo) {
      setValor(valorSalvo);
    }

    if (duracaoSalva) {
      setDuracao(duracaoSalva);
    }

    const canal = supabase
      .channel("jogadores-tempo-real")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "jogadores",
        },
        (payload) => {
          setJogadores((antigos) => [
            ...antigos,
            payload.new,
          ]);
        }
      )
      .subscribe();

    return () => {
      clearInterval(intervaloLista);

      supabase.removeChannel(canal);
    };
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

  async function gerarPix() {
    if (nome.trim() === "") {
      alert("Digite seu nome");
      return;
    }

    if (
      jogadores.find(
        (j) =>
          j.nome.toLowerCase() ===
          nome.toLowerCase()
      )
    ) {
      alert("Esse nome já está na lista");
      return;
    }

    if (
      jogadores.length >=
      limiteJogadores
    ) {
      alert("Lista cheia");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch("/api/pix", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          nome,
          valor,
        }),
      });

      const dados = await resposta.json();

      setPix(dados.qr_code);

      setQrCode(dados.qr_code_base64);

      setPaymentId(String(dados.id));
    } catch (erro) {
      console.log(erro);

      alert("Erro ao gerar PIX");
    }

    setCarregando(false);
  }

  useEffect(() => {
    if (!paymentId) return;

    const intervalo = setInterval(async () => {
      try {
        const resposta = await fetch(
          `/api/verificar?id=${paymentId}`
        );

        const dados = await resposta.json();

        if (dados.status === "approved") {
          await supabase
            .from("jogadores")
            .insert([
              {
                nome,
                pago: true,
              },
            ]);

          const atualizados = [
            ...meusJogadores,
            nome,
          ];

          setMeusJogadores(atualizados);

          localStorage.setItem(
            "meusJogadores",
            JSON.stringify(atualizados)
          );

          carregarJogadores();

          alert("Pagamento aprovado!");

          setPix("");
          setQrCode("");
          setPaymentId("");
          setNome("");

          clearInterval(intervalo);
        }
      } catch (erro) {
        console.log(erro);
      }
    }, 5000);

    return () => clearInterval(intervalo);
  }, [paymentId, nome]);

  async function sairDaLista(
    id: number,
    jogador: string
  ) {
    await supabase
      .from("jogadores")
      .delete()
      .eq("id", id);

    const atualizados =
      meusJogadores.filter(
        (j) => j !== jogador
      );

    setMeusJogadores(atualizados);

    localStorage.setItem(
      "meusJogadores",
      JSON.stringify(atualizados)
    );

    carregarJogadores();
  }

  return (
    <main className="min-h-screen bg-green-700 text-white flex flex-col items-center p-6">
      <div className="w-full flex justify-end">
        <a
          href="/admin"
          className="text-sm underline"
        >
          Área do Desenvolvedor
        </a>
      </div>

      <h1 className="text-4xl font-bold mt-10 text-center">
        {titulo}
      </h1>

      <p className="mt-2 font-semibold">
        Futebol de {duracao} hora(s)
      </p>

      <div className="bg-white text-black rounded-2xl p-6 mt-10 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4">
          Entrar na Lista
        </h2>

        <p className="mb-2 font-semibold">
          Valor da inscrição: R$ {valor}
        </p>

        <p className="mb-4 font-semibold">
          {jogadores.length} /{" "}
          {limiteJogadores} jogadores
        </p>

        <input
          type="text"
          placeholder="Digite seu nome"
          value={nome}
          onChange={(e) =>
            setNome(e.target.value)
          }
          className="w-full border p-3 rounded-lg mb-4"
        />

        {jogadores.length >=
        limiteJogadores ? (
          <div className="w-full bg-red-600 text-white p-3 rounded-lg font-bold text-center">
            LISTA ENCERRADA ⚠️
          </div>
        ) : (
          <button
            onClick={gerarPix}
            disabled={carregando}
            className="w-full bg-green-600 text-white p-3 rounded-lg font-bold"
          >
            {carregando
              ? "Gerando PIX..."
              : "Confirmar inclusão na lista"}
          </button>
        )}

        {pix && (
          <div className="mt-6">
            <p className="font-bold text-center mb-4">
              Faça o pagamento PIX
            </p>

            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="QR Code PIX"
              className="w-full"
            />

            <div className="bg-gray-100 p-3 rounded-lg mt-4 break-all text-sm text-black">
              {pix}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white text-black rounded-2xl p-6 mt-10 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4">
          Lista de Jogadores
        </h2>

        {jogadores.length === 0 ? (
          <p>
            Nenhum jogador confirmado
            ainda.
          </p>
        ) : (
          <ol className="space-y-3">
            {jogadores.map(
              (jogador, index) => (
                <li
                  key={jogador.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <span>
                    {index + 1}.{" "}
                    {jogador.nome}
                  </span>

                  {meusJogadores.includes(
                    jogador.nome
                  ) && (
                    <button
                      onClick={() => {
                        const confirmar =
                          window.confirm(
                            "Tem certeza que deseja sair da lista?\n\nO valor do PIX NÃO será reembolsado."
                          );

                        if (confirmar) {
                          sairDaLista(
                            jogador.id,
                            jogador.nome
                          );
                        }
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg"
                    >
                      Sair
                    </button>
                  )}
                </li>
              )
            )}
          </ol>
        )}
      </div>
    </main>
  );
}