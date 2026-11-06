/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 8787 深墨青空间：deep 主背景 / deep2 次级 / green 章节底 / coral 行动 / brown 标签
        deep: '#243229',
        deep2: '#2d3d31',
        green: '#3f503b',
        coral: '#f04a3a',
        brown: '#de7622',
        // 旧命名保留为深色主题别名，模块页不必逐个改类名
        paper: '#243229',
        cream: '#f2f1ea',
        'cream-dark': '#2d3d31',
        surface: '#2d3d31',
        ink: '#f2f1ea',
        'ink-soft': '#d3dbcf',
        muted: '#bec8bb',
        faint: '#9fae9c',
        line: 'rgba(255,255,255,0.16)',
        hover: 'rgba(255,255,255,0.08)',
        pressed: 'rgba(255,255,255,0.14)',
        focus: '#f04a3a',
        // 品牌行动色：主按钮、印章、当前步骤
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
