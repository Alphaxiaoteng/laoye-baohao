/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F7F2E8',
        'cream-dark': '#EFE7D8',
        brick: '#A63A2B',
        'brick-dark': '#8C2F22',
        ink: '#2F4A3A',
        'ink-soft': '#4A6354',
        muted: '#6B6156',
        line: '#D9CFBF',
      },
      fontFamily: {
        serif: ['"Songti SC"', '"Noto Serif SC"', 'STSong', 'serif'],
        sans: [
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif',
        ],
      },
      maxWidth: {
        content: '72rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(47,74,58,0.06), 0 8px 24px -16px rgba(47,74,58,0.35)',
      },
    },
  },
  plugins: [],
}
