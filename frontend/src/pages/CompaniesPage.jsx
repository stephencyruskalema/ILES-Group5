import { Building2 } from 'lucide-react'
import { Badge } from '../components/Badge'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'

export function CompaniesPage({ companies, supervisors, search, userRole }) {
  // Normalize role to ensure consistent matching
  const role = (userRole || '').toUpperCase()
  
  // Authorization: Only Coordinators or Academic Supervisors can view the full directory
  const isAuthorized = role.includes('COORDINATOR') || role.includes('ACADEMIC')

  const filtered = companies.filter((company) =>
    [company.name, company.industry, company.location, company.contact_person]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <>
      <PageHeader
        eyebrow="Companies"
        title="Host Organization Directory"
        subtitle={isAuthorized ? "Track placement partners and industry supervision contacts." : "View your host organization details."}
      />

      {!isAuthorized ? (
        <EmptyState 
          title="Access Restricted" 
          message="You do not have permission to view the full company directory. Please contact your coordinator if you need assistance." 
        />
      ) : (
        <section className="card-grid">
          {filtered.map((company) => {
            const companySupervisors = supervisors.filter((supervisor) => supervisor.company === company.id)
            return (
              <article className="company-card" key={company.id}>
                <div className="card-topline">
                  <div className="company-icon">
                    <Building2 size={22} />
                  </div>
                  <Badge tone="blue">{company.industry}</Badge>
                </div>
                <h2>{company.name}</h2>
                <p>{company.location}</p>
                <div className="meta-grid single">
                  <span>{company.contact_person || 'Contact pending'}</span>
                  <span>{company.contact_email || 'Email pending'}</span>
                  <span>{company.contact_phone || 'Phone pending'}</span>
                </div>
                <div className="supervisor-strip">
                  {companySupervisors.map((supervisor) => (
                    <span key={supervisor.id}>{supervisor.name}</span>
                  ))}
                  {!companySupervisors.length && <span>No industry supervisor assigned</span>}
                </div>
              </article>
            )
          })}
        </section>
      )}
    </>
  )
}