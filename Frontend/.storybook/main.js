/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
  "stories": [
    "../Src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-onboarding",
    "@storybook/addon-docs",
    "@storybook/addon-styling-webpack",
    "@storybook/addon-themes"
  ],
  "framework": {
    "name": "@storybook/react-webpack5",
    "options": {}
  }
};
export default config;