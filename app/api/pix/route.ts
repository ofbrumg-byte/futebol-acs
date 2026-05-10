import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken:
    process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const payment = new Payment(client);

    const resposta = await payment.create({
      body: {
        transaction_amount: Number(body.valor),

        description: "Futebol ACS",

        payment_method_id: "pix",

        payer: {
          email: "teste@teste.com",

          first_name: body.nome,
        },
      },
    });

    return Response.json({
      id: resposta.id,

      qr_code:
        resposta.point_of_interaction
          ?.transaction_data?.qr_code,

      qr_code_base64:
        resposta.point_of_interaction
          ?.transaction_data
          ?.qr_code_base64,
    });
  } catch (erro) {
    console.log(erro);

    return Response.json(
      {
        erro: "Erro ao gerar PIX",
      },
      {
        status: 500,
      }
    );
  }
}