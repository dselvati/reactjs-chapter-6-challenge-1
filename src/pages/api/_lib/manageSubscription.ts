import { query as q } from 'faunadb';

import { fauna } from "../../../services/fauna";
import { stripe } from '../../../services/stripes';

export async function saveSubscription(
    subscriptionId: string,
    customerId: string,
    createAction = false
) {
    // Buscar o usuário no bando do FaunaDB com o ID {customerId}
    // Salvar os dados da subscription no FaunaDB

    // console.log(subscriptionId, customerId)

    const userRef = await fauna.query(
        q.Select(
            "ref",
            q.Get(
                q.Match(
                    q.Index('user_by_stripe_customer_id'),
                    customerId
                )
            )
        )
    )
    // console.log('userRef', userRef)
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,

    }

    if (createAction) {
        await fauna.query(
            q.Create(
                q.Collection('subscriptions'),
                { data: subscriptionData }
            )
        )
    } else {

        //Replace - atualiza todo o valor do data
        await fauna.query(
            q.Replace(
                q.Select(
                    "ref",
                    q.Get(
                        q.Match(
                            q.Index('subscription_by_id'),
                            subscriptionId
                        )
                    )
                ),
                { data: subscriptionData }
            )
        )

        // Update - atualiza alguns campos
        // await fauna.query(
        //     q.Update(
        //         q.Select(
        //             "ref",
        //             q.Get(
        //                 q.Match(
        //                     q.Index('subscription_by_id'),
        //                     subscriptionId
        //                 )
        //             )
        //         ),
        //         { data: { status: subscriptionData.status } }
        //     )
        // )
    }
}