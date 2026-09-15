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
        /* The widths the journey has to survive. 320 is the floor , the
           narrowest phone still in use , and the one that breaks layouts. */
        mobile320: { name: 'Mobile 320', styles: { width: '320px', height: '720px' } },
        mobile375: { name: 'Mobile 375', styles: { width: '375px', height: '812px' } },
        mobile: { name: 'Mobile 390', styles: { width: '390px', height: '844px' } },
        mobile430: { name: 'Mobile 430', styles: { width: '430px', height: '932px' } },
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
