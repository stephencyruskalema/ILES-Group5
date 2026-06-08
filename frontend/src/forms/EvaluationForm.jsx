import { useState } from 'react'
import { labelize } from '../utils/format'

const SCORE_FIELDS = ['professionalism', 'technical_skill', 'communication', 'problem_solving', 'attendance']

export function EvaluationForm({ placements, onSubmit, onClose, saving, userRole }) {
  const role = (userRole || '').toUpperCase()
  const isCoordinator = role.includes('COORDINATOR')

  const [form, setForm] = useState({
    placement: placements[0]?.id || '',
    evaluator_name: '',
    evaluator_role: role.includes('ACADEMIC') ? 'academic' : 'industry',
    period: 'Midterm',
    professionalism: 4,
    technical_skill: 4,
    communication: 4,
    problem_solving: 4,
    attendance: 4,
    remarks: '',
    status: 'submitted',
  })
  
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  return (
    <form
      className="form-grid"
      onSubmit={(event) => {
        event.preventDefault()
        
        // 1. Find the selected placement record
        const selectedPlacement = placements.find((p) => p.id === form.placement)
        
        // 2. Attach the registration_no from the selected placement
        const finalData = {
          ...form,
          registration_no: selectedPlacement?.registration_no || ''
        }
        
        onSubmit(finalData)
      }}
    >
      {/* Placement Selection */}
      <label className="span-2">
        Placement
        <select value={form.placement} onChange={(event) => update('placement', event.target.value)} required>
          {placements.map((placement) => (
            <option key={placement.id} value={placement.id}>
              {placement.student_name} - {placement.company_name}
            </option>
          ))}
        </select>
      </label>

      {/* Evaluator Info */}
      <label>
        Evaluator Name
        <input value={form.evaluator_name} onChange={(event) => update('evaluator_name', event.target.value)} required />
      </label>
      
      <label>
        Role
        <select value={form.evaluator_role} onChange={(event) => update('evaluator_role', event.target.value)}>
          <option value="academic">Academic</option>
          <option value="industry">Industry</option>
        </select>
      </label>

      {/* Coordinator-only fields */}
      {isCoordinator && (
        <label>
          Status
          <select value={form.status} onChange={(event) => update('status', event.target.value)}>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
          </select>
        </label>
      )}

      {/* Scoring */}
      {SCORE_FIELDS.map((field) => (
        <label key={field}>
          {labelize(field)}
          <input type="number" min="0" max="5" value={form[field]} onChange={(event) => update(field, event.target.value)} required />
        </label>
      ))}

      <label className="span-2">
        Remarks
        <textarea value={form.remarks} onChange={(event) => update('remarks', event.target.value)} />
      </label>

      <div className="form-actions">
        <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Evaluation'}
        </button>
      </div>
    </form>
  )
}