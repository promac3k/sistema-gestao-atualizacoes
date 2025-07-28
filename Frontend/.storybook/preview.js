import { withThemeByClassName } from "@storybook/addon-themes";
//import '../Src/Styles/index.css';

/** @type { import('@storybook/react-webpack5').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },

  decorators: [withThemeByClassName({
      themes: {
          // nameOfTheme: 'classNameForTheme',
          light: 'light',
          dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-mode',
  })]
};

export default preview;