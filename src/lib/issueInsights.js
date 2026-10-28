// Pure helper functions that analyse a list of issues (no React, no storage).
const words = (t) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)
export function findDuplicates(issues, { title, location, category }) {
  const tw = new Set(words(title + ' ' + location))
  if (tw.size < 2) return []
  return issues
    .filter((i) => i.status !== 'Verified')
    .map((i) => {
      const iw = words(i.title + ' ' + i.location)
      const hit = iw.filter((w) => tw.has(w)).length
      return {
        i,
        score: hit / Math.max(3, Math.min(iw.length, tw.size)) + (i.category === category ? 0.25 : 0),
      }
    })
    .filter((x) => x.score >= 0.6)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.i)
}
export function recurring(issues) {
  const g = {}
  issues.forEach((i) => {
    const k = i.category + '|' + i.location
    ;(g[k] = g[k] || []).push(i)
  })
  return Object.values(g)
    .filter((x) => x.length >= 2)
    .map((x) => ({
      category: x[0].category,
      location: x[0].location,
      count: x.length,
      last: x
        .map((i) => i.createdAt)
        .sort()
        .pop(),
    }))
    .sort((a, b) => b.count - a.count)
}
