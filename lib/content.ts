import fs from 'node:fs'
import path from 'node:path'
import { evaluate } from '@mdx-js/mdx'
import matter from 'gray-matter'
import * as runtime from 'react/jsx-runtime'
import { postFrontmatterSchema, type PostFrontmatter } from '@/lib/blog-schema'
import { kbFrontmatterSchema, type KbFrontmatter } from '@/lib/kb-schema'

/**
 * Filesystem content layer. No CMS, no database — MDX with YAML frontmatter on disk,
 * read and compiled at build time only. Everything here runs during `next build`;
 * nothing reaches the browser.
 */

const KB_DIR = path.join(process.cwd(), 'content', 'kb')
const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

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

// ------------------------------------------------------------------ blog posts

export type Post = {
  frontmatter: PostFrontmatter
  /** Raw MDX body, frontmatter stripped. */
  body: string
}

/**
 * Post slugs, as paths relative to content/blog without the extension.
 *
 * Recursive because two posts keep a Wix `/YYYY/MM/DD/` prefix — those paths are
 * indexed, so the directory layout mirrors the URL rather than flattening it.
 */
export function getPostSlugs(dir: string = BLOG_DIR, prefix = ''): string[] {
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const next = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory()) return getPostSlugs(path.join(dir, entry.name), next)
      return entry.name.endsWith('.mdx') ? [next.replace(/\.mdx$/, '')] : []
    })
    .sort()
}

/** Reads and validates one post. Invalid frontmatter fails the build. */
export function readPost(slug: string): Post {
  const raw = fs.readFileSync(path.join(BLOG_DIR, `${slug}.mdx`), 'utf8')
  const { data, content } = matter(raw)

  const parsed = postFrontmatterSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in content/blog/${slug}.mdx:\n${JSON.stringify(
        parsed.error.format(),
        null,
        2,
      )}`,
    )
  }

  if (parsed.data.slug !== slug) {
    throw new Error(
      `Frontmatter slug "${parsed.data.slug}" does not match its location "${slug}.mdx". ` +
        `The slug is the URL under /single-post/ and is part of the URL contract.`,
    )
  }

  return { frontmatter: parsed.data, body: content }
}

/**
 * The only posts the public build may render.
 *
 * Filtered in one place, like the KB equivalent, so there is a single thing to audit.
 * A draft in content/blog must never reach the static export.
 */
export function getPublishedPosts(): Post[] {
  return getPostSlugs()
    .map(readPost)
    .filter((post) => post.frontmatter.status === 'published')
    .sort((a, b) => b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt))
}

export function getPublishedPostSlugs(): string[] {
  return getPublishedPosts().map((post) => post.frontmatter.slug)
}

// ----------------------------------------------------------------- prose pages

const PAGES_DIR = path.join(process.cwd(), 'content', 'pages')

export type ProsePage = {
  slug: string
  title: string
  sourceUrl: string | null
  body: string
}

/**
 * Reads a long-form page from content/pages/.
 *
 * For pages that are a document rather than a layout — `/privacy` is 9,500 characters
 * of legal text, which belongs in MDX where it can be read and amended, not inlined in
 * JSX. Pages with real structure (cards, grids) stay as route components.
 */
export function readProsePage(slug: string): ProsePage {
  const raw = fs.readFileSync(path.join(PAGES_DIR, `${slug}.mdx`), 'utf8')
  const { data, content } = matter(raw)

  if (typeof data.title !== 'string' || data.title.length === 0) {
    throw new Error(`content/pages/${slug}.mdx: frontmatter needs a non-empty title.`)
  }
  if (data.slug !== slug) {
    throw new Error(
      `content/pages/${slug}.mdx: frontmatter slug "${data.slug}" does not match filename.`,
    )
  }

  return {
    slug,
    title: data.title,
    sourceUrl: typeof data.sourceUrl === 'string' ? data.sourceUrl : null,
    body: content,
  }
}


/** Compiles MDX to a React component. Build-time only. */
export async function renderMdx(source: string) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    baseUrl: import.meta.url,
  })
  return Content
}
