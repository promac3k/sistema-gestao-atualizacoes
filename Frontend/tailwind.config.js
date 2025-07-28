// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}', // para o react 
    './.storybook/**/*.{js,jsx,ts,tsx,mdx}', // para o storybook
  ],
  darkMode: ['class', '[data-theme="dark"]'], // Habilita o modo escuro com base na classe ou atributo data-theme
  theme: {
    extend: {},
  },
  plugins: [],
};
