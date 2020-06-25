exports.onCreateWebpackConfig = (
  { actions, stage, loaders },
  {
    cssLoaderOptions = {},
    postCssPlugins,
    useResolveUrlLoader,
  }
) => {
  const { setWebpackConfig } = actions
  const isSSR = stage.includes(`html`)

  const rule = {
    test: /\.rss-css$/,
    use: isSSR
      ? [loaders.null()]
      : [
          loaders.miniCssExtract(),
          loaders.css({ ...cssLoaderOptions, importLoaders: 2 }),
          loaders.postcss({ plugins: postCssPlugins }),
          "@flair/loader",
        ],
  }

  if (useResolveUrlLoader && !isSSR) {
    rule.use.splice(-1, 0, {
      loader: `resolve-url-loader`,
      options: useResolveUrlLoader.options ? useResolveUrlLoader.options : {},
    })
  }

  let configRules = []

  if (
    ["develop", "build-javascript", "build-html", "develop-html"].includes(
      stage
    )
  ) {
    configRules = configRules.concat([rule])
  }

  setWebpackConfig({
    module: {
      rules: configRules,
    },
  })
}
