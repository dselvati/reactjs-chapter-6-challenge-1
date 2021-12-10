import { GetStaticPaths, GetStaticProps } from "next"
import { useSession } from "next-auth/client"
import Head from "next/head"
import Link from 'next/link'
import { useRouter } from "next/router"

import { RichText } from "prismic-dom"
import { useEffect } from "react"
import { getPrismicClient } from "../../../services/prismic"

import styles from '../post.module.scss'

interface PostPreviewProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}

export default function PostPreview({ post }: PostPreviewProps) {
    const [session] = useSession()
    const router = useRouter()


    useEffect(() => {
        if (session?.activeSubscription) {
            router.push(`/posts/${post.slug}`)
        }
        // console.log(session)
    }, [session])

    return (
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div
                        className={`${styles.postContent} ${styles.previewContent}`}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    <div className={styles.continueReading}>
                        Wanna continue reading?
                        <Link href="/">
                            <a href="">Subscribe now 🤗</a>
                        </Link>
                    </div>
                </article>
            </main>
        </>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        // Gerar as páginas estáticas durante a build (Preview de posts)
        paths: [
            // {
            //     params: { slug: 'dark-mode-com-css--mudando-a-aparencia-do-blog-de' }
            // }
        ],
        fallback: 'blocking'

        // true - Se uma página for acessada que ainda não foi gerada de forma estatica, irá fazer a requisição em tempo real (irá carregar o html para depois os dados)
        // false - Se uma página não foi gerada de forma estatica ainda, irá retornar um 404 Not Found.
        // blocking - Se uma página for acessada que ainda não foi gerada de forma estatica, irá fazer carregamento do conteúdo na camada SSR
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { slug } = params

    const prismic = getPrismicClient()

    const response = await prismic.getByUID('publication', String(slug), {})

    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content.splice(0, 3)),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    return {
        props: {
            post
        },

        redirect: 60 * 30 // Tempo para a pagina ser atualiza em segundos - 30 minutos no valor setado
    }
}