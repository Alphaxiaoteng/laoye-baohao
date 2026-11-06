/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 暖纸底：主背景 / 次级 / 强调绿可作章节点缀 / coral 行动 / brown 标签
        deep: '#f4e8d8',
        deep2: '#efe4d4',
        green: '#4a5c42',
        coral: '#f04a3a',
        brown: '#de7622',
        paper: '#f4e8d8',
        cream: '#fffdf8',
        'cream-dark': '#e8dcc8',
        surface: '#efe4d4',
        ink: '#241c17',
        'ink-soft': '#3d3129',
        muted: '#4a3f36',
        faint: '#6b5f54',
        line: 'rgba(61,47,38,0.14)',
        hover: 'rgba(61,47,38,0.08)',
        pressed: 'rgba(61,47,38,0.12)',
        focus: '#f04a3a',
        brick: '#f04a3a',
        'brick-dark': '#d63c2d',
      },
      fontFamily: {
        // 标题：思源宋体可变字重（public/fonts 自托管），退化为系统宋体
        serif: [
          '"Source Han Serif CN"',
          '"Source Han Serif SC"',
          '"Songti SC"',
          '"Noto Serif SC"',
          'STSong',
          'serif',
        ],
        sans: [
          'MiSans',
          '"HarmonyOS Sans SC"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif',
        ],
        mono: ['"SF Mono"', 'ui-monospace', 'Menlo', '"Roboto Mono"', 'monospace'],
      },
      maxWidth: {
        content: '72rem',
        // 94rem 内容 + 两侧 36–48px 页边距，保证 1440px 下内容正好从 36px 开始
        exhibit: '94rem',
      },
      borderRadius: {
        card: '16px',
        control: '14px',
        panel: '20px',
      },
      transitionTimingFunction: {
        exhibit: 'cubic-bezier(.16,1,.3,1)',
      },
      transitionDuration: {
        160: '160ms',
        200: '200ms',
        240: '240ms',
      },
      boxShadow: {
        card: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 18px 60px rgba(13,21,15,0.18)',
      },
    },
  },
  plugins: [],
}
