import { NextResponse } from "next/server";

import { MercadoPagoConfig, Payment } from "mercadopago";

import { createClient } from "@supabase/supabase-js";

const client = new MercadoPagoConfig({
  accessToken:
    process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

const payment = new Payment(client);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");

  const nome = searchParams.get("nome");

  const duracao =
    searchParams.get("duracao") || "2";

  const limite =
    duracao === "1" ? 15 : 22;

  if (!id) {
    return NextResponse.json({
      error: "ID obrigatório",
    });
  }

  try {
    const resposta = await payment.get({
      id: Number(id),
    });

    const status = resposta.status;

    if (status === "approved" && nome) {
      const { data: jogadores } =
        await supabase
          .from("jogadores")
          .select("id");

      const quantidade =
        jogadores?.length || 0;

      if (quantidade >= limite) {
        return NextResponse.json({
          status: "lotado",
        });
      }

      const { data: existente } =
        await supabase
          .from("jogadores")
          .select("id")
          .eq("nome", nome)
          .maybeSingle();

      if (!existente) {
        await supabase
          .from("jogadores")
          .insert([
            {
              nome,
              pago: true,
            },
          ]);
      }
    }

    return NextResponse.json({
      status,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json({
      error:
        "Erro ao verificar pagamento",
    });
  }
}