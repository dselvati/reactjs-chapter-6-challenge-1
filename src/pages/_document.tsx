// eslint-disable-next-line @next/next/no-document-import-in-page
import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap" rel="stylesheet" />

                    {/* <title>ig.news</title> */}
                    <link rel="shortcut icon" href="/favicon.png" type="image/png" />
                </Head>
                <body>
                    <Main />
                    <NextScript /> {/*Onde roda os arquivos JS*/}
                </body>
            </Html>
        )
    }
}