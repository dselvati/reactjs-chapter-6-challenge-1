/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next";
import { query as q } from 'faunadb'
import { getSession } from 'next-auth/client'
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripes";

type User = {
    ref: {
        id: string;
    },
    data: {
        stripe_customer_id: string;
    }

}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {

        //Pegar a sessão do usuário
        const session = await getSession({ req })


        // Verificar se ele existe no Fauna
        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email)
                )
            )
        )

        let customerId = user.data.stripe_customer_id

        // Caso não existe criar um customer no Stripe e atualizar no Fauna
        if (!customerId) {
            const stripeCustomer = await stripe.customers.create({
                email: session.user.email,
                // metadata
            })

            await fauna.query(
                q.Update(
                    q.Ref(q.Collection('users'), user.ref.id),
                    {
                        data: {
                            stripe_customer_id: stripeCustomer.id
                        }
                    }
                )
            )

            customerId = stripeCustomer.id
        }


        // Criar um Checkout Session para o usuário de acordo com o customerId
        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [
                { price: 'price_1JhhxjEmnB7zNJ7IOhxQQA5A', quantity: 1 },
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL
        })

        return res.status(200).json({ sessionId: stripeCheckoutSession.id })
    } else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}