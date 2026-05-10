import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    const payment = new Payment(client);

    const resposta = await payment.get({
      id: id!,
    });

    return Response.json({
      status: resposta.status,
    });
  } catch (erro) {
    console.log(erro);

    return Response.json(
      { erro: "Erro ao verificar pagamento" },
      { status: 500 }
    );
  }
}