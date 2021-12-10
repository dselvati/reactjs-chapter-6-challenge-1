/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next"
import { Readable } from "stream"
import Stripe from "stripe"
import { stripe } from "../../services/stripes"
import { saveSubscription } from "./_lib/manageSubscription"

async function buffer(readable: Readable) {
    const chunks = []

    for await (const chuck of readable) {
        chunks.push(
            typeof chuck === "string" ? Buffer.from(chuck) : chuck
        )
    }

    return Buffer.concat(chunks)
}

export const config = {
    api: {
        bodyParser: false
    }
}

const relevantEvents = new Set([
    'checkout.session.completed',
    //'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
])

export default async (req: NextApiRequest, res: NextApiResponse) => {

    if (req.method === 'POST') {
        const buf = await buffer(req)

        // Verificar se o request é oriundo do Webhook do Stripe, verificando a assinatura do request (Stripe recomanda utilizar essa forma de verificação)
        const secret = req.headers['stripe-signature']

        let event: Stripe.Event
        try {
            event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIP_WEBHOOK_SECRET)
        } catch (err) {
            return res.status(400).send(`Webhook error: ${err.message}`)
        }

        // Verificar se o evento é o permitido para executar a ação específica
        const { type } = event


        if (relevantEvents.has(type)) {
            try {
                switch (type) {
                    case 'customer.subscription.created':
                    case 'customer.subscription.updated':
                    case 'customer.subscription.deleted':

                        const subscription = event.data.object as Stripe.Subscription

                        await saveSubscription(
                            subscription.id,
                            subscription.customer.toString(),
                            false
                        )

                        break;

                    case 'checkout.session.completed':

                        const checkoutSession = event.data.object as Stripe.Checkout.Session

                        await saveSubscription(
                            checkoutSession.subscription.toString(),
                            checkoutSession.customer.toString(),
                            true
                        )

                        break;
                    default:
                        throw new Error('Unhandled event.')
                }
            } catch (err) {
                return res.json({ error: 'Webhook handler failed.' })
            }
        }

        res.json({ received: true }) // Status 200 é padrão quando enviar um JSON
    } else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}