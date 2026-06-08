export function StatCard({ icon: Icon, label, value, detail, tone = 'blue' }) {
  return (
    <article className="stat-card">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
      <div className={`stat-icon ${tone}`}>
        <Icon size={24} />
      </div>
    </article>
  )
}
