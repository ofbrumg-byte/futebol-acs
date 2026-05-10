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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.type !== "payment") {
      return Response.json({ ok: true });
    }

    const paymentId = body.data.id;

    const pagamento = await payment.get({
      id: Number(paymentId),
    });

    if (
      pagamento.status !== "approved"
    ) {
      return Response.json({ ok: true });
    }

    const nome =
      pagamento.metadata?.nome;

    if (!nome) {
      return Response.json({ ok: true });
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

    return Response.json({ ok: true });
  } catch (error) {
    console.log(error);

    return Response.json({
      ok: false,
    });
  }
}