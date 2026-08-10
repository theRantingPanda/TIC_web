import fs from 'node:fs'
import path from 'node:path'
import { evaluate } from '@mdx-js/mdx'
import matter from 'gray-matter'
import * as runtime from 'react/jsx-runtime'
import { kbFrontmatterSchema, type KbFrontmatter } from '@/lib/kb-schema'

/**
 * Filesystem content layer. No CMS, no database — MDX with YAML frontmatter on disk,
 * read and compiled at build time only. Everything here runs during `next build`;
 * nothing reaches the browser.
 */

const KB_DIR = path.join(process.cwd(), 'content', 'kb')

export type KbArticle = {
  frontmatter: KbFrontmatter
  /** Raw MDX body, frontmatter stripped. */
  body: string
}

function listMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.mdx'))
    .sort()
}

export function getKbSlugs(): string[] {
  return listMdxFiles(KB_DIR).map((file) => file.replace(/\.mdx$/, ''))
}

/**
 * Reads and validates one article. Throws on invalid frontmatter so a malformed file
 * fails the build rather than shipping a half-formed page.
 */
export function readKbArticle(slug: string): KbArticle {
  const filePath = path.join(KB_DIR, `${slug}.mdx`)
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)

  const parsed = kbFrontmatterSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in content/kb/${slug}.mdx:\n${JSON.stringify(
        parsed.error.format(),
        null,
        2,
      )}`,
    )
  }

  if (parsed.data.slug !== slug) {
    throw new Error(
      `Frontmatter slug "${parsed.data.slug}" does not match filename "${slug}.mdx".`,
    )
  }

  return { frontmatter: parsed.data, body: content }
}

export function getAllKbArticles(): KbArticle[] {
  return getKbSlugs().map(readKbArticle)
}

/**
 * The only set of articles the public site is allowed to render.
 *
 * Drafts and operator-audience articles are excluded here, not downstream — so there is
 * exactly one place to audit. `content/kb` may legitimately contain operator articles
 * destined for the CRM-side KB; they must never appear in the static export.
 */
export function getPublicKbArticles(): KbArticle[] {
  return getAllKbArticles().filter(
    (article) =>
      article.frontmatter.status === 'published' &&
      article.frontmatter.audience === 'public',
  )
}

export function getPublicKbSlugs(): string[] {
  return getPublicKbArticles().map((article) => article.frontmatter.slug)
}

/** Compiles MDX to a React component. Build-time only. */
export async function renderMdx(source: string) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    baseUrl: import.meta.url,
  })
  return Content
}
