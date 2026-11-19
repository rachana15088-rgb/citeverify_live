import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

function load(path, mocks, globals = {}) {
  const exports = {}
  const source = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInNewContext(source, { exports, require: (name) => mocks[name], Request, Response,
    File, FormData, Buffer, TextDecoder, AbortSignal, console: { error() {} },
    process: { env: { LLM_API_KEY: 'synthetic-test-key' } }, ...globals })
  return exports
}
const verdicts = ['supported', 'partly_supported', 'unsupported', 'contradictory', 'possibly_outdated', 'reference_not_found', 'needs_human_review']
function route({ abstract = 'The study found no effect.', match = true, confidence = 0, parserError = false, pages = 1, modelOutput, reference = 'Smith. A randomized intervention study. 2020.', candidateTitle = 'A randomized intervention study', journal } = {}) {
  const calls = []
  const text = 'Paper title\n' + 'Background context. '.repeat(15) + 'The intervention has an effect [1]. References [1] ' + reference
  const api = load('app/api/analyze/route.ts', {
    'next/server': { NextResponse: { json: (data, options) => Response.json(data, options) } },
    '@/lib/verdicts': { VERDICT_ORDER: verdicts },
    unpdf: { getDocumentProxy: async () => {
      if (parserError) throw new Error('private parser details')
      return { numPages: pages, getPage: async () => ({ getTextContent: async () => ({ items: [{ str: text }] }), cleanup() {} }), loadingTask: { async destroy() {} } }
    } },
  }, { fetch: async (url, options) => {
    calls.push({ url, options })
    if (url.includes('crossref')) return Response.json({ message: { items: [
      { title: ['Unrelated publication'], DOI: 'wrong' },
      { title: [match ? candidateTitle : 'Other publication'], 'container-title': journal ? [journal] : [], DOI: '10.test/valid', abstract },
    ] } })
    const output = modelOutput?.(calls.filter(c => c.options?.method === 'POST').length) ?? [{ id: 'c1', verdict: 'supported', confidence, evidence_quote: 'fabricated quote' }]
    return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(output) }] } }] })
  } })
  return { ...api, calls }
}
function request(content = '%PDF-test', type = 'application/pdf', name = 'paper.pdf') {
  const form = new FormData()
  form.set('file', new File([content], name, { type }))
  return new Request('https://test/api/analyze', { method: 'POST', body: form })
}
test('rejects upload type, signature, excessive pages and malformed PDF', async () => {
  for (const [options, req, status] of [
    [{}, request('not PDF'), 400], [{}, request('%PDF-test', 'text/plain', 'paper.txt'), 400],
    [{ pages: 101 }, request(), 413], [{ parserError: true }, request(), 422],
  ]) {
    const res = await route(options).POST(req)
    assert.equal(res.status, status)
    assert.doesNotMatch(await res.text(), /private parser details/)
  }
})
test('accepts PDF declarations used by the upload zone but still checks the signature', async () => {
  for (const [type, name] of [['', 'paper.pdf'], ['application/octet-stream', 'PAPER.PDF'], ['text/plain', 'paper.pdf'], ['application/pdf', 'paper']]) {
    assert.equal((await route().POST(request('%PDF-test', type, name))).status, 200)
    assert.equal((await route().POST(request('not PDF', type, name))).status, 400)
  }
  for (const type of ['', 'application/octet-stream']) {
    assert.equal((await route().POST(request('%PDF-test', type, 'paper.txt'))).status, 400)
  }
})
test('matches the entire title after author initials, including internal periods', async () => {
  const reference = 'Smith, J. Doe, A. A randomized intervention study. Part two. 2020.'
  const candidateTitle = 'A randomized intervention study. Part two'
  const api = route({ reference, candidateTitle })
  const result = (await (await api.POST(request())).json()).results[0]
  assert.equal(result.citation.title, candidateTitle)
  assert.equal(result.citation.authors, 'Smith, J. Doe, A')
  assert.equal(result.citation.doi, '10.test/valid')
  assert.equal(new URL(api.calls[0].url).searchParams.get('query.bibliographic'), candidateTitle)
  const unrelated = route({ reference, match: false })
  const rejected = (await (await unrelated.POST(request())).json()).results[0]
  assert.equal(rejected.citation.doi, '')
  assert.equal(rejected.evidence.source_access, 'none')
  const initialsFirst = route({ reference: 'J. Smith and A. Doe. ' + candidateTitle + '. 2020.', candidateTitle })
  const firstResult = (await (await initialsFirst.POST(request())).json()).results[0]
  assert.equal(firstResult.citation.title, candidateTitle)
  assert.equal(firstResult.citation.doi, '10.test/valid')
  const journal = route({ reference: 'Smith. ' + candidateTitle + '. Journal of tests. 2020.', candidateTitle, journal: 'Journal of tests' })
  const journalResult = (await (await journal.POST(request())).json()).results[0]
  assert.equal(journalResult.citation.title, candidateTitle)
  assert.equal(journalResult.citation.doi, '10.test/valid')
})
test('counts actual request bytes even when Content-Length lies', async () => {
  const req = new Request('https://test/api/analyze', { method: 'POST', body: 'x'.repeat(10 * 1024 * 1024 + 1), headers: { 'Content-Length': '1' } })
  assert.equal((await route().POST(req)).status, 413)
})
test('validates Crossref title, evidence, confidence and metadata verdicts', async () => {
  for (const [options, access, verdict, conf] of [
    [{ confidence: 0 }, 'abstract_only', 'supported', 0],
    [{ confidence: 4 }, 'abstract_only', 'supported', .96],
    [{ confidence: -1 }, 'abstract_only', 'supported', 0],
    [{ confidence: '0.9' }, 'abstract_only', 'supported', 0],
    [{ abstract: '' }, 'metadata_only', 'needs_human_review', 0],
    [{ match: false }, 'none', 'needs_human_review', 0],
  ]) {
    const api = route(options)
    const res = await api.POST(request())
    assert.equal(res.status, 200)
    const result = (await res.json()).results[0]
    assert.equal(result.evidence.source_access, access)
    assert.equal(result.verdict, verdict)
    assert.equal(result.confidence, conf)
    assert.notEqual(result.evidence.passage, 'fabricated quote')
    assert.match(api.calls[0].url, /query.bibliographic=.*&rows=5/)
    assert.equal(result.citation.doi, options.match === false ? '' : '10.test/valid')
  }
})
test('non-array JSON retries and Pro omits thinking config', async () => {
  const api = route({ modelOutput: (n) => n < 3 ? {} : [{ id: 'c1' }] })
  assert.equal((await api.POST(request())).status, 200)
  const posts = api.calls.filter(c => c.options?.method === 'POST')
  assert.equal(posts.length, 3)
  for (const post of posts) assert.equal(JSON.parse(post.options.body).generationConfig.thinkingConfig, undefined)
})
test('empty array preserves failure behavior without retrying', async () => {
  const api = route({ modelOutput: () => [] })
  assert.equal((await api.POST(request())).status, 504)
  assert.equal(api.calls.filter(c => c.options?.method === 'POST').length, 1)
})
test('storage failures are reported, samples stay separate, malformed responses fail', async () => {
  const data = new Map()
  const api = load('lib/api.ts', { '@/mock/results.json': { results: [] } }, {
    sessionStorage: { setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k), getItem: k => data.get(k) },
    fetch: async () => Response.json({ results: {} }),
  })
  const saved = { document: { title: 'real' }, results: [] }
  assert.equal(api.saveResults(saved), true)
  const before = api.analysisCacheKey()
  api.saveResults({ ...saved, document: { title: 'example' } }, true)
  assert.equal((await api.getResults()).document.title, 'real')
  assert.equal((await api.getResults(true)).document.title, 'example')
  api.saveResults({ ...saved, document: { title: 'new upload' } })
  assert.notEqual(api.analysisCacheKey(), before)
  await assert.rejects(api.analyzeFile(new File([''], 'x.pdf')), /Invalid analysis response/)
  const broken = load('lib/api.ts', {}, { sessionStorage: { setItem() { throw Error('unavailable') } } })
  assert.equal(broken.saveResults(saved), false)
})
