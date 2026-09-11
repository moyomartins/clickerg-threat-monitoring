import type { Preview } from '@storybook/react-vite';
import '@clickerg/ui/styles.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    backgrounds: {
      options: {
        cream: { name: 'Cream (page)', value: '#f7f4ed' },
        charcoal: { name: 'Charcoal', value: '#1c1c1c' },
      },
    },
    viewport: {
      options: {
        mobile: { name: 'Mobile', styles: { width: '390px', height: '844px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '900px' } },
      },
    },
    a11y: { test: 'error' },
    docs: { toc: true },
  },
  initialGlobals: { backgrounds: { value: 'cream' } },
  decorators: [
    (Story) => (
      <div className="cg-root" style={{ padding: 'var(--cg-space-3)', background: 'var(--cg-cream)' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default preview;
