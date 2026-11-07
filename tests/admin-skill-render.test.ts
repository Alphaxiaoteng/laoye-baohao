import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import AdminPage from '../src/features/admin/AdminPage'
import SkillPage from '../src/features/agentskill/SkillPage'

function render(node: Parameters<typeof createElement>[0], path: string): string {
  return renderToString(
    createElement(MemoryRouter, { initialEntries: [path] }, createElement(node)),
  ).replace(/<!--\s*-->/g, '')
}

describe('AI 内容运营台', () => {
  it('五个分区、真实内容计数与概念预览边界都能渲染', () => {
    const html = render(AdminPage, '/admin')
    for (const label of ['运行总览', '数据库与知识库', '模型配置', 'Agent Harness', '自动化与自维护']) {
      expect(html).toContain(label)
    }
    expect(html).toContain('概念设计模式')
    expect(html).toContain('不会改数据库、调用模型或自动发布')
    expect(html).toContain('返回前台')
    expect(html).toContain('AI Native 内容流水线')
    expect(html).toContain('人工')
    expect(html).not.toContain('/sources')
  })
})

describe('Skill 接入页', () => {
  it('安装命令、Agent tab 与案例说明都在，且不回到对话式安装文案', () => {
    const html = render(SkillPage, '/skill')
    expect(html).toContain('一句话接入你的 Agent')
    expect(html).toContain('复制安装命令')
    expect(html).toContain('curl -fsSL')
    expect(html).toContain('/skill/laoye-baohao/SKILL.md')
    expect(html).toContain('Claude Code')
    expect(html).toContain('Codex')
    expect(html).toContain('接上以后，可以直接这样问')
    expect(html).toContain('查看这个场景')
    expect(html).not.toContain('帮我安装潮汕文化 Skill')
  })
})
