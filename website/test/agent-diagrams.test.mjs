import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripPublishedArtifactMetadata } from '../scripts/publish-seo.mjs';
import { parse } from 'parse5';
import { parseSitemap } from '../scripts/indexnow.mjs';

const cloudflare = process.env.ARCHIFY_SITE_TARGET === 'cloudflare';
const output = new URL(cloudflare ? '../dist-cloudflare/' : '../dist/', import.meta.url);
const nodes = node => [node, ...(node.childNodes || []).flatMap(nodes)];
const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value;
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');

test('agent guide is readable without JavaScript, honest about examples, and linked from the homepage and both entry points', () => {
  for (const lang of ['en', 'zh']) {
    const prefix = lang === 'zh' ? 'zh/' : '';
    const all = nodes(parse(fs.readFileSync(new URL(`${prefix}agent-diagrams.html`, output), 'utf8')));
    const documentUrl = new URL(`${prefix}agent-diagrams${cloudflare ? '' : '.html'}`, cloudflare ? 'https://archify.si/' : 'https://tt-a1i.github.io/archify/');
    const baseUri = new URL(attr(all.find(node => node.tagName === 'base'), 'href'), documentUrl);
    const article = all.find(node => node.tagName === 'article');
    assert.ok(article);
    assert.equal(nodes(article).filter(node => node.tagName === 'h1').length, 1);
    assert.equal(nodes(article).filter(node => node.tagName === 'blockquote').length, 2);
    const visible = text(article);
    assert.match(visible, lang === 'en' ? /two separate sequence diagrams/i : /分别画两张时序图/);
    assert.match(visible, lang === 'en' ? /not the output of this prompt/ : /不是上述提示词的生成结果/);
    assert.match(text(all.find(node => node.tagName === 'main')), lang === 'en' ? /not recorded agent runs/ : /并非 Agent 实测记录/);
    for (const name of ['Claude Code', 'Codex', 'Cursor', 'OpenCode', 'GitHub Copilot']) assert.ok(visible.includes(name));
    const schema = JSON.parse(text(all.find(node => node.tagName === 'script' && attr(node, 'type') === 'application/ld+json')));
    const structuredArticle = schema['@graph'].find(item => item['@type'] === 'TechArticle');
    assert.equal(structuredArticle.url, `https://archify.si/${prefix}agent-diagrams`);
    assert.equal(structuredArticle.inLanguage, lang === 'zh' ? 'zh-Hans' : 'en');
    const ids = new Set(all.map(node => attr(node, 'id')).filter(Boolean));
    for (const id of ['responsibilities', 'setup', 'description-workflow', 'cache-scenarios', 'repository-evidence', 'review-and-share', 'questions']) assert.ok(ids.has(id), `${lang}: stable cross-language section ${id}`);
    const toc = all.find(node => attr(node, 'class') === 'article-toc');
    for (const link of nodes(toc).filter(node => node.tagName === 'a')) {
      const destination = new URL(attr(link, 'href'), baseUri);
      assert.equal(destination.origin + destination.pathname, documentUrl.origin + documentUrl.pathname, 'TOC fragments resolve on this page, not the root base');
      const id = decodeURIComponent(destination.hash.slice(1));
      const anchors = nodes(article).filter(node => attr(node, 'id') === id);
      assert.equal(anchors.length, 1, `unique article anchor: ${id}`);
      const anchor = anchors[0];
      // Markdown wraps a standalone inline span in a paragraph.
      const boundary = anchor.parentNode.tagName === 'p' ? anchor.parentNode : anchor;
      const siblings = boundary.parentNode.childNodes;
      const nextElement = siblings.slice(siblings.indexOf(boundary) + 1).find(node => node.tagName);
      assert.equal(nextElement?.tagName, 'h2', `${id}: anchor immediately precedes its section heading`);
      assert.equal(text(nextElement), text(link), `${id}: TOC label must identify the section it reaches, including after reordering`);
    }
    assert.doesNotMatch(visible, /editorial draft|publication checks|workspace\/shared|factcheck\.md/i);
    const homeFile = lang === 'zh' ? 'zh.html' : 'index.html';
    const homeNodes = nodes(parse(fs.readFileSync(new URL(homeFile, output), 'utf8')));
    const discovery = homeNodes.find(node => attr(node, 'class') === 'guide-discovery');
    assert.ok(discovery, `${lang}: homepage discovery is present without JavaScript`);
    const homeLink = nodes(discovery).find(node => node.tagName === 'a');
    assert.equal(text(homeLink), lang === 'en' ? 'Learn to create and check diagrams with your agent →' : '学习用 Agent 画图并检查结果 →');
    const homeUrl = new URL(homeFile, documentUrl.origin + (cloudflare ? '/' : '/archify/'));
    const homeBase = new URL(attr(homeNodes.find(node => node.tagName === 'base'), 'href'), homeUrl);
    assert.equal(new URL(attr(homeLink, 'href'), homeBase).href, documentUrl.href);
    for (const entry of ['start', 'guide']) {
      const entryNodes = nodes(parse(fs.readFileSync(new URL(`${prefix}${entry}.html`, output), 'utf8')));
      const guideLink = entryNodes.find(node => node.tagName === 'a' && attr(node, 'href') === `${prefix}agent-diagrams${cloudflare ? '' : '.html'}`);
      assert.ok(guideLink, `${prefix}${entry}: contextual discovery`);
      assert.equal(attr(guideLink.parentNode, 'aria-label'), lang === 'zh' ? 'Agent 画图指南' : 'Agent diagramming guide');
    }
  }
});

test('both agent guide routes are included in the actual sitemap and allowed IndexNow inventory', () => {
  const urls = parseSitemap(fs.readFileSync(new URL('sitemap.xml', output), 'utf8'));
  for (const url of ['https://archify.si/agent-diagrams', 'https://archify.si/zh/agent-diagrams']) assert.ok(urls.includes(url));
});

test('README entry points link directly to the matching language guide', () => {
  for (const name of ['README.md', 'README_EN.md', 'README_ZH.md']) {
    const source = fs.readFileSync(new URL(`../../${name}`, import.meta.url), 'utf8');
    const link = name === 'README_ZH.md'
      ? '[用 Agent 画图并检查结果](https://archify.si/zh/agent-diagrams)'
      : '[Create and check diagrams with your agent](https://archify.si/agent-diagrams)';
    assert.ok(source.includes(link), `${name}: descriptive guide discovery`);
    assert.ok(source.indexOf(link) < source.indexOf('<a id="sponsors">'), `${name}: link stays with quick start`);
  }
  assert.equal(fs.readFileSync(new URL('../../README.md', import.meta.url), 'utf8'), fs.readFileSync(new URL('../../README_EN.md', import.meta.url), 'utf8'));
});


test('description workflow exposes pinned evidence, honest limits and localized setup without changing the artifact', () => {
  const origin = cloudflare ? 'https://archify.si/' : 'https://tt-a1i.github.io/archify/';
  for (const lang of ['en', 'zh']) {
    const prefix = lang === 'zh' ? 'zh/' : '';
    const all = nodes(parse(fs.readFileSync(new URL(`${prefix}agent-diagrams.html`, output), 'utf8')));
    const base = new URL(attr(all.find(node => node.tagName === 'base'), 'href'), origin + `${prefix}agent-diagrams.html`);
    const article = all.find(node => node.tagName === 'article');
    const start = nodes(article).find(node => attr(node, 'id') === 'description-workflow').parentNode;
    const siblings = start.parentNode.childNodes;
    const rest = siblings.slice(siblings.indexOf(start) + 1);
    const end = rest.findIndex(node => nodes(node).some(child => attr(child, 'id') === 'cache-scenarios'));
    const section = rest.slice(0, end).flatMap(nodes);
    const visible = rest.slice(0, end).map(text).join('');
    assert.match(visible, /1 \+ 4 \+ 3 \+ 2/);
    assert.match(visible, lang === 'en' ? /not additional leave deductions/ : /不是再次扣减休假额度/);
    assert.match(visible, lang === 'en' ? /not a fresh agent execution record/ : /不是一次新的 Agent 执行记录/);
    assert.match(visible, lang === 'en' ? /not real calendar or company leave-policy advice/ : /不是实际日历或公司休假政策建议/);
    assert.match(visible, lang === 'en' ? /not a real-world guarantee/ : /不是现实保证/);
    const links = section.filter(node => node.tagName === 'a').map(node => new URL(attr(node, 'href'), base));
    assert.ok(links.some(url => url.href === origin + 'cases/life/leave-plan.workflow.html'));
    assert.ok(links.some(url => url.href === 'https://github.com/tt-a1i/archify/blob/68031cf978e0b906aa56c684a394049a3ea9d583/docs/cases/life/leave-plan.workflow.json'));
    const quickstart = links.find(url => url.searchParams.get('type') === 'workflow');
    assert.equal(quickstart.href, origin + `${prefix}start${cloudflare ? '' : '.html'}?type=workflow&input=description`);
  }
  for (const extension of ['json', 'html']) {
    const file = `cases/life/leave-plan.workflow.${extension}`;
    const published = fs.readFileSync(new URL(file, output));
    const original = extension === 'html' ? Buffer.from(stripPublishedArtifactMetadata(published.toString('utf8'))) : published;
    assert.deepEqual(original, fs.readFileSync(new URL(`../../docs/${file}`, import.meta.url)), 'existing artifact bytes remain unchanged outside the publication metadata block');
  }
});
