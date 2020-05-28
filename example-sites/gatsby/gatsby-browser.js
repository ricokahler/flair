import React from "react"
import { ThemeProvider, ColorContextProvider } from "flair"
import theme from "./src/styles/theme"

export const wrapRootElement = ({ element }) => (
  <ThemeProvider theme={theme}>
    <ColorContextProvider
      color={theme.colors.primary}
      surface={theme.colors.surface}
    >
      {element}
    </ColorContextProvider>
  </ThemeProvider>
)
