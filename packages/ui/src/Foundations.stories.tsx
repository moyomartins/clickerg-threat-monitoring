import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Tokens',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Every colour, type step, space and border in ClickerG comes from `packages/ui/src/tokens.css`. These swatches read the live CSS variables , change a token and this page changes with it, and so does every screen.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const COLORS: [string, string][] = [
  ['--cg-ground', 'Page ground'],
  ['--cg-surface', 'Cards, replay pages'],
  ['--cg-frame', 'Replay surround'],
  ['--cg-border', 'Border'],
  ['--cg-ink', 'Primary text'],
  ['--cg-body', 'Body text'],
  ['--cg-muted', 'Muted text (AA-corrected)'],
  ['--cg-attention', 'Attention blue , graphics only'],
  ['--cg-attention-text', 'Attention blue , as text'],
  ['--cg-absence', 'Absence red'],
  ['--cg-sev-medium', 'Severity: medium (AA-corrected)'],
  ['--cg-sev-low', 'Severity: favourable'],
  ['--cg-wf-nav', 'Wireframe: nav'],
  ['--cg-wf-hero', 'Wireframe: hero'],
  ['--cg-wf-cta', 'Wireframe: call to action'],
  ['--cg-wf-bar', 'Wireframe: body bar'],
];

const TYPE: [string, string, number][] = [
  ['Page title', '--cg-text-title', 800],
  ['Section', '--cg-text-sub', 700],
  ['Card title', '--cg-text-card', 700],
  ['Verdict', '--cg-text-lg', 400],
  ['Lede', '--cg-text-lede', 400],
  ['Body', '--cg-text-body', 400],
  ['Caption', '--cg-text-sm', 400],
  ['Label', '--cg-text-xs', 400],
];

export const Color: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
      {COLORS.map(([token, role]) => (
        <div key={token} className="cg-card cg-card--compact">
          <div
            style={{
              height: 44,
              background: `var(${token})`,
              border: '1px solid var(--cg-border)',
              marginBottom: 8,
            }}
          />
          <div className="cg-mono" style={{ fontSize: 11 }}>{token}</div>
          <div style={{ fontSize: 11, color: 'var(--cg-muted)' }}>{role}</div>
        </div>
      ))}
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {TYPE.map(([name, size, weight]) => (
        <div key={name}>
          <div className="cg-mono" style={{ fontSize: 11, color: 'var(--cg-muted)' }}>
            {name} · var({size}) · weight {weight}
          </div>
          <div style={{ fontSize: `var(${size})`, fontWeight: weight, letterSpacing: '-0.02em', color: 'var(--cg-ink)' }}>
            What they actually did
          </div>
        </div>
      ))}
    </div>
  ),
};

export const SpacingAndShape: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p className="cg-mono" style={{ fontSize: 11, color: 'var(--cg-muted)' }}>Spacing</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          {['--cg-space-1', '--cg-space-1-5', '--cg-space-2', '--cg-space-3', '--cg-space-4', '--cg-space-5', '--cg-space-7'].map((t) => (
            <div key={t} style={{ textAlign: 'center' }}>
              <div style={{ width: `var(${t})`, height: `var(${t})`, background: 'var(--cg-wf-cta)' }} />
              <div className="cg-mono" style={{ fontSize: 10, marginTop: 4 }}>{t.replace('--cg-space-', '')}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="cg-mono" style={{ fontSize: 11, color: 'var(--cg-muted)' }}>
          Shape , this world is flat. Radius 0 everywhere; the click dot is the only round thing, and the
          only shadow in the system is its halo.
        </p>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ width: 90, height: 54, border: '1px solid var(--cg-border)', background: 'var(--cg-surface)' }} />
          <div style={{ width: 90, height: 54, border: '2px solid var(--cg-ink)', background: 'var(--cg-surface)' }} />
          <span className="cg-replay__click" style={{ position: 'relative', left: 0, top: 0, margin: 0 }} />
        </div>
      </div>
    </div>
  ),
};
