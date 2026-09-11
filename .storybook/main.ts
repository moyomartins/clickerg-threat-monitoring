import type { StorybookConfig } from '@storybook/react-vite';

// Storybook consumes the same source files the app imports — there is no
// second, Storybook-only copy of any component.
const config: StorybookConfig = {
  stories: ['../packages/ui/src/**/*.mdx', '../packages/ui/src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/react-vite',
};
export default config;
