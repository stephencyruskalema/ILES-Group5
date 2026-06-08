import { useState } from 'react'
import { todayISO } from '../utils/format'

export function PlacementForm({ students, companies, supervisors, onSubmit, onClose, saving, userRole }) {
  // Normalize role for robust detection
  const role = (userRole || '').toUpperCase()
  const isCoordinator = role.includes('COORDINATOR')

  const academic = supervisors.filter((item) => item.role === 'academic')
  const industry = supervisors.filter((item) => item.role === 'industry')
  
  const [form, setForm] = useState({
    student: students[0]?.id || '',
    company: companies[0]?.id || '',
    academic_supervisor: academic[0]?.id || '',
    industry_supervisor: industry[0]?.id || '',
    title: '',
    start_date: todayISO(),
    end_date: todayISO(),
    objectives: '',
    status: 'active',
  })
  
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const submit = (event) => {
    event.preventDefault()
    // Only allow submission if the user is a coordinator
    if (!isCoordinator) return;
    
    onSubmit({
      ...form,
      academic_supervisor: form.academic_supervisor || null,
      industry_supervisor: form.industry_supervisor || null,
    })
  }

  // If the user is not a coordinator, you could return null or a restricted message
  if (!isCoordinator) {
    return <p className="error-message">You do not have permission to create or edit placements.</p>
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>
        Student
        <select value={form.student} onChange={(event) => update('student', event.target.value)} required>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.full_name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Company
        <select value={form.company} onChange={(event) => update('company', event.target.value)} required>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Academic Supervisor
        <select value={form.academic_supervisor} onChange={(event) => update('academic_supervisor', event.target.value)}>
          <option value="">Unassigned</option>
          {academic.map((supervisor) => (
            <option key={supervisor.id} value={supervisor.id}>
              {supervisor.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Industry Supervisor
        <select value={form.industry_supervisor} onChange={(event) => update('industry_supervisor', event.target.value)}>
          <option value="">Unassigned</option>
          {industry.map((supervisor) => (
            <option key={supervisor.id} value={supervisor.id}>
              {supervisor.name}
            </option>
          ))}
        </select>
      </label>
      <label className="span-2">
        Title
        <input value={form.title} onChange={(event) => update('title', event.target.value)} required />
      </label>
      <label>
        Start Date
        <input type="date" value={form.start_date} onChange={(event) => update('start_date', event.target.value)} required />
      </label>
      <label>
        End Date
        <input type="date" value={form.end_date} onChange={(event) => update('end_date', event.target.value)} required />
      </label>
      <label>
        Status
        <select value={form.status} onChange={(event) => update('status', event.target.value)}>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="flagged">Flagged</option>
        </select>
      </label>
      <label className="span-2">
        Objectives
        <textarea value={form.objectives} onChange={(event) => update('objectives', event.target.value)} required />
      </label>
      <div className="form-actions">
        <button className="secondary-button" type="button" onClick={onClose}>
          Cancel
        </button>
        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Create Placement'}
        </button>
      </div>
    </form>
  )
}