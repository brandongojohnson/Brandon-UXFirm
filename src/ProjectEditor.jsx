import React, { useState, useRef } from 'react'
import { ref as dbRef, push } from 'firebase/database'
import { db } from './firebase'

const TEMPLATE = {
  title: '',
  subtitle: '',
  eyebrow: '',
  imageUrl: '',
  imageCaption: '',
  challengeHeading: '',
  challengeBody: ['', ''],
  approachHeading: '',
  findingsHeading: '',
  deliverablesHeading: '',
  deliverablesDesc: '',
  outcomesHeading: '',
  meta: [
    { icon: 'apartment',      label: 'Client',     value: '' },
    { icon: 'calendar_month', label: 'Year',       value: '' },
    { icon: 'category',       label: 'Discipline', value: '' },
    { icon: 'schedule',       label: 'Duration',   value: '' },
  ],
  painPoints: [
    { icon: 'warning', text: '' },
  ],
  approach: [
    { icon: 'search', title: '', desc: '' },
  ],
  findings: [
    { icon: 'lightbulb', title: '', body: '' },
  ],
  deliverables: [
    { icon: 'description', text: '' },
  ],
  outcomes: [
    { icon: 'trending_up', value: 0, suffix: '%', label: '', sub: '' },
  ],
}

function validate(raw) {
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    return { ok: false, error: `Invalid JSON — ${e.message}` }
  }
  if (!parsed.title?.trim()) return { ok: false, error: 'Missing required field: "title"' }
  if (!Array.isArray(parsed.challengeBody)) return { ok: false, error: '"challengeBody" must be an array of strings' }
  for (const key of ['meta', 'painPoints', 'approach', 'findings', 'deliverables', 'outcomes']) {
    if (parsed[key] !== undefined && !Array.isArray(parsed[key])) {
      return { ok: false, error: `"${key}" must be an array` }
    }
  }
  return { ok: true, data: parsed }
}

export default function ProjectEditor({ onClose }) {
  const [json, setJson] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const taRef = useRef(null)

  function loadTemplate() {
    setJson(JSON.stringify(TEMPLATE, null, 2))
    setError('')
    setTimeout(() => taRef.current?.focus(), 0)
  }

  async function handleSave() {
    const result = validate(json.trim())
    if (!result.ok) { setError(result.error); return }
    setSaving(true)
    setError('')
    try {
      await push(dbRef(db, 'UXP'), result.data)
      onClose()
    } catch {
      setError('Save failed — check your connection and try again.')
      setSaving(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.target
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const next = json.slice(0, start) + '  ' + json.slice(end)
      setJson(next)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2
      })
    }
  }

  return (
    <div className="pe-overlay">
      <div className="pe-header">
        <h2 className="pe-header__title">Add Project via JSON</h2>
        <div className="pe-header__actions">
          <button className="pe-btn pe-btn--ghost" onClick={loadTemplate} disabled={saving}>
            Load template
          </button>
          {error && <span className="pe-error">{error}</span>}
          <button className="pe-btn pe-btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="pe-btn pe-btn--primary" onClick={handleSave} disabled={saving || !json.trim()}>
            {saving ? 'Saving…' : 'Save Project'}
          </button>
        </div>
      </div>

      <div className="pe-json-body">
        <textarea
          ref={taRef}
          className="pe-json-ta"
          value={json}
          onChange={e => { setJson(e.target.value); setError('') }}
          onKeyDown={handleKeyDown}
          placeholder={`Paste project JSON here, or click "Load template" to start from the schema.\n\nRequired fields:\n  title, challengeBody (array)`}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  )
}
