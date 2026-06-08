import { CheckCircle2, Clock, Plus, Wrench, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { formatDate, labelize, todayISO } from '../utils/format'

const CATEGORY_OPTIONS = ['Electrical', 'Plumbing', 'IT Equipment', 'Furniture', 'HVAC', 'Other']
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']

const EMPTY_FORM = {
  title: '',
  category: 'IT Equipment',
  priority: 'Medium',
  location: '',
  description: '',
  reported_by: '',
  date_reported: todayISO(),
}

export function MaintenancePage({ search, userRole }) {
  const [requests, setRequests] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [message, setMessage] = useState('')

  // Normalize role and check for COORDINATOR fragment
  const role = (userRole || '').toUpperCase()
  const isCoordinator = role.includes('COORDINATOR')

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const filtered = requests.filter((request) =>
    [request.title, request.category, request.location, request.reported_by, request.status]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const submitRequest = () => {
    if (!form.title.trim() || !form.location.trim() || !form.reported_by.trim()) {
      setMessage('Please fill in the title, location, and reported-by fields.')
      return
    }
    const newRequest = { id: Date.now(), ...form, status: 'open' }
    setRequests((current) => [newRequest, ...current])
    setForm(EMPTY_FORM)
    setShowForm(false)
    setMessage('')
  }

  const resolveRequest = (id) => {
    setRequests((current) =>
      current.map((request) => (request.id === id ? { ...request, status: 'resolved' } : request)),
    )
  }

  const openCount = requests.filter((request) => request.status === 'open').length
  const resolvedCount = requests.filter((request) => request.status === 'resolved').length

  return (
    <>
      <PageHeader
        eyebrow="Maintenance"
        title="Maintenance Requests"
        subtitle="Report and track facility and equipment maintenance issues."
        action={
          <button className="primary-button" type="button" onClick={() => setShowForm((current) => !current)}>
            <Plus size={18} />
            New Request
          </button>
        }
      />

      {/* Only show analytics stats to Coordinators */}
      {isCoordinator && (
        <section className="stat-grid compact">
          <StatCard icon={Wrench} label="Total Requests" value={requests.length} detail="all time" />
          <StatCard icon={Clock} label="Open" value={openCount} detail="awaiting resolution" tone="amber" />
          <StatCard icon={CheckCircle2} label="Resolved" value={resolvedCount} detail="completed" tone="green" />
        </section>
      )}

      {showForm && (
        <section className="panel maintenance-form-panel">
          <div className="panel-header">
            <h2>Submit Maintenance Request</h2>
            <button type="button" onClick={() => { setShowForm(false); setMessage('') }}>Cancel</button>
          </div>
          {/* ... (form fields remain the same) ... */}
        </section>
      )}

      <section className="table-panel">
        <div className="table-toolbar">
          <strong>{filtered.length} maintenance requests</strong>
        </div>
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Location</th>
                <th>Reported By</th>
                <th>Date</th>
                <th>Status</th>
                {isCoordinator && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((request) => (
                <tr key={request.id}>
                  <td><strong>{request.title}</strong>{request.description && <span>{request.description}</span>}</td>
                  <td>{request.category}</td>
                  <td><Badge tone={request.priority === 'High' ? 'red' : request.priority === 'Medium' ? 'amber' : 'neutral'}>{request.priority}</Badge></td>
                  <td>{request.location}</td>
                  <td>{request.reported_by}</td>
                  <td>{formatDate(request.date_reported)}</td>
                  <td><Badge tone={request.status === 'resolved' ? 'green' : 'amber'}>{labelize(request.status)}</Badge></td>
                  {isCoordinator && (
                    <td>
                      {request.status === 'open' && (
                        <button type="button" onClick={() => resolveRequest(request.id)}>Resolve</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <EmptyState title="No maintenance requests" message="Submit a new request using the button above." />}
        </div>
      </section>
    </>
  )
}