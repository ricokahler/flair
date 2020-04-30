import webpack from 'webpack';

/**
 * this is an extremely simple loader that takes in the result of the babel
 * plugins and sends it back out to other CSS loaders in your webpack loader
 * chain
 */
const loader: webpack.loader.Loader = function() {
  return new URLSearchParams(this.resourceQuery).get('css') || '';
};

export default loader;
