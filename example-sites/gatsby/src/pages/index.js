import React from "react"
import { Link } from "gatsby"
import { createStyles } from "react-style-system"

import Layout from "../components/layout"
// import Image from "../components/image"
import SEO from "../components/seo"

const useStyles = createStyles(({ css, color }) => ({
  root: css`
    background-color: ${color.original};
  `,
}))

const IndexPage = props => {
  const { Root } = useStyles(props)

  return (
    <Layout>
      <Root>
        <SEO title="Home" />
        <h1>Hi people</h1>
        <p>Welcome to your new Gatsby site.</p>
        <p>Now go build something great.</p>
        <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
          {/* <Image /> */}
        </div>
        <Link to="/page-2/">Go to page 2</Link>
      </Root>
    </Layout>
  )
}

export default IndexPage
