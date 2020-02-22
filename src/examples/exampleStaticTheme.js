const { math } = require('polished');

module.exports = {
  colors: {
    brand: '#00f',
  },
  breakpoints: {
    down: value => `@media (max-width: ${math(`${value} - 1px`)})`,
    mobile: '375px',
  },
};
