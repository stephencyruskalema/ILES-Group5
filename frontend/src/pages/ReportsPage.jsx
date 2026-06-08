import { CheckCircle2, Download, Lock } from 'lucide-react'
import { useMemo } from 'react'

import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { formatNumber, todayISO } from '../utils/format'

export function ReportsPage({ stats, placements, logs, evaluations, documents, visits, userRole }) {
  // Normalize role and authorize coordinators
  const role = (userRole || '').toUpperCase()
  const isCoordinator = role.includes('COORDINATOR')

  const report = useMemo(
    () => ({
      generated_at: new Date().toISOString(),
      stats,
      placements,
      logs,
      evaluations,
      documents,
      visits,
    }),
    [stats, placements, logs, evaluations, documents, visits],
  )

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `iles-report-${todayISO()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="Attachment Reporting"
        subtitle={isCoordinator ? "Operational summary for coordinators and supervisors." : "Reporting access is restricted."}
        action={
          isCoordinator && (
            <button className="primary-button" type="button" onClick={downloadReport}>
              <Download size={18} />
              Export JSON
            </button>
          )
        }
      />

      {!isCoordinator ? (
        <EmptyState 
          icon={Lock}
          title="Access Restricted" 
          message="Detailed operational reporting is reserved for system coordinators." 
        />
      ) : (
        <>
          <section className="report-grid">
            <article className="panel report-card">
              <h2>Completion Position</h2>
              <strong>{placements.filter((item) => item.status === 'completed').length}</strong>
              <p>completed placements out of {placements.length}</p>
            </article>
            <article className="panel report-card">
              <h2>Logged Hours</h2>
              <strong>{formatNumber(stats?.total_hours)}</strong>
              <p>student hours captured in weekly logs</p>
            </article>
            <article className="panel report-card">
              <h2>Documents</h2>
              <strong>{documents.length}</strong>
              <p>logbooks, reports, and evaluation files tracked</p>
            </article>
            <article className="panel report-card">
              <h2>Visits</h2>
              <strong>{visits.length}</strong>
              <p>supervision visits scheduled or completed</p>
            </article>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Readiness Checklist</h2>
            </div>
            <div className="checklist">
              <span><CheckCircle2 size={18} /> Placement records linked to students and companies</span>
              <span><CheckCircle2 size={18} /> Weekly logs support review and revision states</span>
              <span><CheckCircle2 size={18} /> Evaluations compute overall supervisor scores</span>
              <span><CheckCircle2 size={18} /> Exportable operational report available</span>
            </div>
          </section>
        </>
      )}
    </>
  )
}