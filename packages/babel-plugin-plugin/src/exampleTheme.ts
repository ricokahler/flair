export default {
  block: (n: number) => `${n * 96}px`,
  space: (n: number) => `${n * 16}px`,
  fonts: {
    h4: `
      font-size: 32px;
      font-weight: bold;
      margin: 0;
    `,
    h5: `
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    `,
    body1: `
      font-size: 16px;
      margin: 0;
      line-height: 1.5;
    `
  },
  down: (value: string) => `@media (max-width: ${value})`,
  tablet: '768px',

  colors: {
    brand: '#00f',
  },
};
