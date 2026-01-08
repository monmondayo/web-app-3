const config = {
  plugins: {
    "@tailwindcss/postcss": {
      future: {
        // Lab色をサポートするモダン色空間を無効化
        relativeColorSyntax: false,
      },
    },
  },
};

export default config;
