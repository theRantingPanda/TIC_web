/**
 * What is finished, and what a production build is therefore hiding.
 *
 * The site ships with unfinished sections gated off rather than filled with placeholder
 * text — see `SHOW_UNFINISHED` in components/concern-panel.tsx. That is the right thing
 * for a visitor and a hazard for everyone else, because a missing section is silent. This
 * makes it loud.
 *
 *   npm run content:status
 *
 * Nothing here needs updating as content lands. It reads the same tagged unions the panel
 * renders from, so the day a `kind: 'brief'` becomes a `kind: 'photo'` this stops
 * reporting it and the section appears on the live site. There is no list to keep in step.
 */
import { concerns } from '../content/concerns/index.ts'

const rows = concerns.map((concern) => ({
  concern: concern.cardTitle,
  path: concern.path,
  photo: concern.image.kind === 'photo',
  /*
    Three states, not two. A `scenario` is finished content and renders in production, so
    calling it missing would be wrong; calling it a case would be worse. It gets its own
    mark because the two are not interchangeable — see the ConcernCase doc comment.
  */
  study: concern.case.kind,
  figures: Boolean(concern.numbers?.table),
  reading: Boolean(concern.furtherReading),
}))

const mark = (ready: boolean) => (ready ? '  ✓  ' : '  ·  ')
/** ✓ a real client's story, ~ an illustration, · unwritten. */
const caseMark = (kind: string) => (kind === 'real' ? '✓' : kind === 'scenario' ? '~' : '·')

console.log('\nWhat each concern panel is showing in production\n')
console.log(
  '  ' +
    'CONCERN'.padEnd(46) +
    'PHOTO'.padEnd(8) +
    'CASE'.padEnd(8) +
    'FIGURES'.padEnd(9) +
    'READING',
)
console.log('  ' + '-'.repeat(72))

for (const row of rows) {
  console.log(
    '  ' +
      row.concern.padEnd(46) +
      mark(row.photo).trim().padEnd(8) +
      caseMark(row.study).padEnd(8) +
      mark(row.figures).trim().padEnd(9) +
      mark(row.reading).trim(),
  )
}

const missingPhoto = rows.filter((r) => !r.photo)
const missingCase = rows.filter((r) => r.study === 'placeholder')
const scenarios = rows.filter((r) => r.study === 'scenario')

console.log(
  `\n  ${rows.length - missingPhoto.length}/${rows.length} panels have a photograph, ` +
    `${rows.length - missingCase.length - scenarios.length}/${rows.length} have a real ` +
    `case, ${scenarios.length} ${scenarios.length === 1 ? 'shows' : 'show'} a scenario (~).`,
)

/*
 * `·` is deliberately not called a failure and this script deliberately exits 0. A
 * concern without a case is not broken, it is unwritten, and a build that fails on
 * unwritten copy is a build nobody can ship. This reports; it does not gate.
 */
if (missingPhoto.length > 0) {
  console.log(`\n  Photograph still needed (panel renders without one):`)
  for (const row of missingPhoto) console.log(`    ${row.path}`)
}

if (missingCase.length > 0) {
  console.log(`\n  Case study still needed (section is hidden in production):`)
  for (const row of missingCase) console.log(`    ${row.path}`)
}

if (scenarios.length > 0) {
  console.log(`\n  Showing a scenario, labelled as one on the page (a real case is better):`)
  for (const row of scenarios) console.log(`    ${row.path}`)
}

console.log(
  '\n  Run `npm run dev` to see the briefs and bracketed cases in place.' +
    '\n  A production build hides both until the real thing replaces them.\n',
)
