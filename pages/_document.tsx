import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta
            name="description"
            content="Generate your next Linkedin bio in seconds."
          />
          <meta property="og:site_name" content="twitterbio.com" />
          <meta
            property="og:description"
            content="Generate your next Linkedin bio in seconds."
          />
          <meta property="og:title" content="Linkedin Bio Generator" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Linkedin Bio Generator" />
          <meta
            name="twitter:description"
            content="Generate your next Linkedin bio in seconds."
          />
          <meta
            property="og:image"
            content="https://twitterbio.com/logo.png"
          />
          <meta
            name="twitter:image"
            content="https://twitterbio.com/logo.png"
          />
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
