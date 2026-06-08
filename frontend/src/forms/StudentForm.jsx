import { useState } from 'react'

export function StudentForm({ departments, onSubmit, onClose, saving, userRole }) {
  // Normalize role and check for COORDINATOR fragment
  const role = (userRole || '').toUpperCase()
  const isCoordinator = role.includes('COORDINATOR')

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    registration_no: '',
    email: '',
    phone: '',
    department: departments?.[0]?.id || '',
    year_of_study: 3,
    status: 'pending',
  })

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  // Restrict submission logic
  const submit = (event) => {
    event.preventDefault()
    
    // Debugging: Log the form state to console
    console.log("Submitting Student Data:", form);
    
    if (!isCoordinator) {
      console.error("Submission blocked: User is not a coordinator.");
      return;
    }
    
    onSubmit(form)
  }

  // Guard: If not a coordinator, don't show the form
  if (!isCoordinator) {
    return (
      <div className="error-message">
        <p>Access Denied: Only coordinators can register new students.</p>
        <p>Current Role: {userRole}</p>
        <button className="secondary-button" type="button" onClick={onClose}>Close</button>
      </div>
    )
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>
        First Name
        <input value={form.first_name} onChange={(event) => update('first_name', event.target.value)} required />
      </label>
      <label>
        Last Name
        <input value={form.last_name} onChange={(event) => update('last_name', event.target.value)} required />
      </label>
      <label>
        Registration No
        <input value={form.registration_no} onChange={(event) => update('registration_no', event.target.value)} required />
      </label>
      <label>
        Email
        <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
      </label>
      <label>
        Phone
        <input value={form.phone} onChange={(event) => update('phone', event.target.value)} />
      </label>
      <label>
        Department
        <select value={form.department} onChange={(event) => update('department', event.target.value)} required>
          {departments?.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Year
        <input type="number" min="1" max="6" value={form.year_of_study} onChange={(event) => update('year_of_study', event.target.value)} />
      </label>
      <label>
        Status
        <select value={form.status} onChange={(event) => update('status', event.target.value)}>
          <option value="pending">Pending</option>
          <option value="placed">Placed</option>
          <option value="active">Active</option>
        </select>
      </label>
      <div className="form-actions">
        <button className="secondary-button" type="button" onClick={onClose}>
          Cancel
        </button>
        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Create Student'}
        </button>
      </div>
    </form>
  )
}