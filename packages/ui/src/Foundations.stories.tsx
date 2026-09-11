import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Tokens',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Every colour, radius, space and type step in ClickerG comes from `packages/ui/src/tokens.css`. These swatches read the live CSS variables — if a token changes, this page changes with it, and so does every screen.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const COLORS = [
  ['--cg-cream', 'Page + surface'],
  ['--cg-charcoal', 'Text, dark buttons'],
  ['--cg-offwhite', 'Text on dark'],
  ['--cg-muted', 'Secondary text'],
  ['--cg-border', 'Passive border'],
  ['--cg-border-interactive', 'Interactive border'],
  ['--cg-charcoal-04', 'Hover tint'],
  ['--cg-sev-high', 'Severity: high'],
  ['--cg-sev-medium', 'Severity: medium'],
  ['--cg-sev-low', 'Severity: low'],
];

const TYPE = [
  ['Display', '--cg-text-display', '--cg-tracking-display', 600],
  ['Section', '--cg-text-section', '--cg-tracking-section', 600],
  ['Sub-heading', '--cg-text-sub', '--cg-tracking-sub', 600],
  ['Card title', '--cg-text-title', '--cg-tracking-normal', 400],
  ['Body', '--cg-text-body', '--cg-tracking-normal', 400],
  ['Caption', '--cg-text-sm', '--cg-tracking-normal', 400],
] as const;

export const Color: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
      {COLORS.map(([token, role]) => (
        <div key={token} className="cg-card cg-card--compact">
          <div
            style={{
              height: 44,
              borderRadius: 'var(--cg-radius-standard)',
              background: `var(${token})`,
              border: '1px solid var(--cg-border)',
              marginBottom: 8,
            }}
          />
          <div className="cg-mono" style={{ fontSize: 12 }}>{token}</div>
          <div style={{ fontSize: 12, color: 'var(--cg-muted)' }}>{role}</div>
        </div>
      ))}
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {TYPE.map(([name, size, tracking, weight]) => (
        <div key={name}>
          <div className="cg-mono" style={{ fontSize: 12, color: 'var(--cg-muted)' }}>
            {name} · var({size}) · weight {weight}
          </div>
          <div
            style={{
              fontSize: `var(${size})`,
              letterSpacing: `var(${tracking})`,
              fontWeight: weight,
              lineHeight: 1.1,
              color: 'var(--cg-charcoal)',
            }}
          >
            Blocking is cumulative
          </div>
        </div>
      ))}
    </div>
  ),
};

export const SpacingAndRadii: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p className="cg-mono" style={{ fontSize: 12, color: 'var(--cg-muted)' }}>Spacing — 8px base</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          {['--cg-space-1', '--cg-space-1-5', '--cg-space-2', '--cg-space-3', '--cg-space-4', '--cg-space-5', '--cg-space-7'].map((t) => (
            <div key={t} style={{ textAlign: 'center' }}>
              <div style={{ width: `var(${t})`, height: `var(${t})`, background: 'var(--cg-charcoal-12)', borderRadius: 2 }} />
              <div className="cg-mono" style={{ fontSize: 10, marginTop: 4 }}>{t.replace('--cg-space-', '')}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="cg-mono" style={{ fontSize: 12, color: 'var(--cg-muted)' }}>Radii</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['--cg-radius-micro', '--cg-radius-standard', '--cg-radius-comfortable', '--cg-radius-card', '--cg-radius-container', '--cg-radius-pill'].map((t) => (
            <div key={t} style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 48, border: '1px solid var(--cg-border-interactive)', borderRadius: `var(${t})` }} />
              <div className="cg-mono" style={{ fontSize: 10, marginTop: 4 }}>{t.replace('--cg-radius-', '')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};
