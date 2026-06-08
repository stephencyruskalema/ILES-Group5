export function IconButton({ icon: Icon, label, onClick, type = 'button' }) {
  return (
    <button className="icon-button" type={type} onClick={onClick} aria-label={label} title={label}>
      <Icon size={18} />
    </button>
  )
}
