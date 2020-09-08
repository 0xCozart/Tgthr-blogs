import React from "react";
import { Provider, createClient } from "urql";
import { ThemeProvider, CSSReset, ColorModeProvider } from "@chakra-ui/core";

import theme from "../theme";
import NavBar from "../components/NavBar";

const client = createClient({
  url: "http://localhost:5000/graphql",
  fetchOptions: {
    credentials: "include",
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <Provider value={client}>
      <ThemeProvider theme={theme}>
        <ColorModeProvider>
          <CSSReset />
          <NavBar />
          <Component {...pageProps} />
        </ColorModeProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default MyApp;
