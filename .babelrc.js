// this babel config is just for jest really
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: true } }],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
};
