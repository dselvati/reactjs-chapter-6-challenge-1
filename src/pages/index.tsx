import { GetServerSideProps, GetStaticProps } from 'next'
import Head from 'next/head'
import { SubscribeButton } from '../components/SubscribeButton'
import { stripe } from '../services/stripes'

import styles from './home.module.scss'

// Client-side
// Server-side
// Static Site Generation

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  }
}

export default function Home({ product }: HomeProps) {
  //console.log(product)

  return (
    <>
      {/*  Título de páginas dinâmicos */}
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          👏 Hey, welcome
          <h1>News about the <span>React</span> world.</h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  )
}

// É executada na camada Node.js do Next
// export const getServerSideProps: GetServerSideProps = async () => {
//   const price = await stripe.prices.retrieve('price_1JhhxjEmnB7zNJ7IOhxQQA5A', {
//     expand: ['product']
//   })

//   const product = {
//     priceId: price.id,
//     amount: new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD'
//     }).format((price.unit_amount / 100)),
//   }

//   return {
//     props: {
//       product
//     }
//   }
// }


export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve('price_1JhhxjEmnB7zNJ7IOhxQQA5A', {
    expand: ['product']
  })

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format((price.unit_amount / 100)),
  }

  return {
    props: {
      product,
    },
    revalidate: 60 * 60 * 24 // 24 hours - Tempo em segundos para a página ser reconstruida
  }
}
//tes