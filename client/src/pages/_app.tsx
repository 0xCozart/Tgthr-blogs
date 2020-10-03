import React from "react";
import { ThemeProvider, CSSReset, ColorModeProvider } from "@chakra-ui/core";
// import { ApolloProvider } from "@apollo/client";

import theme from "../theme";
// import client from "../middleware/apolloClient";

function MyApp({ Component, pageProps }: any) {
  return (
    // <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <ColorModeProvider>
        <CSSReset />
        <Component {...pageProps} />
      </ColorModeProvider>
    </ThemeProvider>
    // </ApolloProvider>
  );
}

export default MyApp;
