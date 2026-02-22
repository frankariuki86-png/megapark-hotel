import React from 'react'
import '../styles/modal.css'

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>{cancelLabel}</button>
          <button className={`btn-confirm ${danger ? 'danger' : ''}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
