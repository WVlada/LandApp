import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Head>
          <link rel="shortcut icon" href="/favicon32x32.png" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="description" content="Land app for detailed land info." />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
