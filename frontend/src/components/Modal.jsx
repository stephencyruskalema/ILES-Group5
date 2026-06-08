import { X } from 'lucide-react'

import { IconButton } from './IconButton'

export function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>
        {children}
      </section>
    </div>
  )
}
