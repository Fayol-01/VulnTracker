/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact tokens from Stitch v2
        'background':               '#0d1516',
        'surface':                  '#0d1516',
        'surface-dim':              '#0d1516',
        'surface-container':        '#192122',
        'surface-container-low':    '#151d1e',
        'surface-container-high':   '#242b2d',
        'surface-container-highest':'#2e3638',
        'surface-container-lowest': '#080f11',
        'surface-bright':           '#333a3c',
        'surface-variant':          '#2e3638',

        'primary':                  '#c3f5ff',
        'primary-container':        '#00e5ff',  // main accent
        'primary-fixed':            '#9cf0ff',
        'primary-fixed-dim':        '#00daf3',
        'on-primary':               '#00363d',
        'on-primary-container':     '#00626e',
        'on-primary-fixed':         '#001f24',
        'on-primary-fixed-variant': '#004f58',
        'inverse-primary':          '#006875',

        'secondary':                '#d7ffc5',
        'secondary-container':      '#2ff801',
        'secondary-fixed':          '#79ff5b',
        'secondary-fixed-dim':      '#2ae500',
        'on-secondary':             '#053900',
        'on-secondary-container':   '#0f6d00',
        'on-secondary-fixed':       '#022100',
        'on-secondary-fixed-variant':'#095300',

        'tertiary':                 '#ffeac0',
        'tertiary-container':       '#fec931',
        'tertiary-fixed':           '#ffdf96',
        'tertiary-fixed-dim':       '#f3bf26',
        'on-tertiary':              '#3e2e00',
        'on-tertiary-container':    '#6f5500',
        'on-tertiary-fixed':        '#251a00',
        'on-tertiary-fixed-variant':'#594400',

        'error':                    '#ffb4ab',
        'error-container':          '#93000a',
        'on-error':                 '#690005',
        'on-error-container':       '#ffdad6',

        'on-surface':               '#dce4e5',
        'on-surface-variant':       '#bac9cc',
        'on-background':            '#dce4e5',
        'inverse-surface':          '#dce4e5',
        'inverse-on-surface':       '#2a3233',
        'surface-tint':             '#00daf3',
        'outline':                  '#849396',
        'outline-variant':          '#3b494c',

        // Convenience aliases used in table/components
        'grid-line':                '#1e1e24',
        'row-alt':                  '#0f0f12',
        'row-base':                 '#111114',
      },
      borderRadius: {
        // Zero radius everywhere — terminal aesthetic
        DEFAULT: '0px',
        none:    '0px',
        sm:      '0px',
        md:      '0px',
        lg:      '0px',
        xl:      '0px',
        '2xl':   '0px',
        full:    '0px',
      },
      spacing: {
        'container-margin': '24px',
        'unit-1':  '4px',
        'unit-2':  '8px',
        'unit-4':  '16px',
        'unit-6':  '24px',
        'unit-8':  '32px',
        'gutter':  '16px',
        'base':    '4px',
      },
      fontFamily: {
        mono:    ['"JetBrains Mono"', 'monospace'],
        display: ['"JetBrains Mono"', 'monospace'],
        sans:    ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display':     ['32px', { lineHeight: '1.2',  letterSpacing: '0.15em', fontWeight: '700' }],
        'headline-lg': ['24px', { lineHeight: '1.3',  letterSpacing: '0.15em', fontWeight: '600' }],
        'headline-md': ['18px', { lineHeight: '1.4',  letterSpacing: '0.15em', fontWeight: '600' }],
        'body-lg':     ['16px', { lineHeight: '1.6',  letterSpacing: '0em',    fontWeight: '400' }],
        'body-md':     ['14px', { lineHeight: '1.5',  letterSpacing: '0em',    fontWeight: '400' }],
        'code-sm':     ['12px', { lineHeight: '1.4',  letterSpacing: '0.05em', fontWeight: '500' }],
        'label-caps':  ['11px', { lineHeight: '1.2',  letterSpacing: '0.15em', fontWeight: '700' }],
        'label-xs':    ['10px', { lineHeight: '1.2',  letterSpacing: '0.15em', fontWeight: '700' }],
      },
      keyframes: {
        pulseGreen: {
          '0%':   { boxShadow: '0 0 0 0 rgba(57,255,20,0.7)' },
          '70%':  { boxShadow: '0 0 0 5px rgba(57,255,20,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(57,255,20,0)' },
        },
        pulseRed: {
          '0%':   { boxShadow: '0 0 0 0 rgba(255,68,68,0.8)' },
          '70%':  { boxShadow: '0 0 0 5px rgba(255,68,68,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255,68,68,0)' },
        },
        pulseOpacity: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.4' },
        },
        progressBar: {
          '0%':   { width: '0%', opacity: '1' },
          '80%':  { width: '90%', opacity: '1' },
          '100%': { width: '100%', opacity: '0' },
        },
        drawerIn: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'pulse-green':   'pulseGreen 2s infinite',
        'pulse-red':     'pulseRed 2s infinite',
        'pulse-opacity': 'pulseOpacity 2s infinite',
        'progress-bar':  'progressBar 1s ease-out forwards',
        'drawer-in':     'drawerIn 0.25s ease-out',
      },
      transitionDuration: { 150: '150ms', 200: '200ms', 250: '250ms' },
    },
  },
  plugins: [],
};
