import type { Preview } from '@storybook/react-vite';
import '@clickerg/ui/styles.css';

const font = document.createElement('link');
font.rel = 'stylesheet';
font.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=Fira+Code:wght@400;500&display=swap';
document.head.appendChild(font);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    backgrounds: {
      options: {
        ground: { name: 'Ground', value: '#eceef1' },
        surface: { name: 'Surface', value: '#ffffff' },
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
  initialGlobals: { backgrounds: { value: 'ground' } },
  decorators: [
    (Story) => (
      <div className="cg-root" style={{ padding: 'var(--cg-space-3)', background: 'var(--cg-ground)' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default preview;
