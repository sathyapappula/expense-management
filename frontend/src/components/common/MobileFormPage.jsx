import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IonIcon } from '@ionic/react'
import { chevronBackOutline } from 'ionicons/icons'

function FormPageContent({ onClose, title, children }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <div className="mfp-overlay">
      <div className="mfp-header">
        <button className="mfp-back-btn" onClick={onClose}>
          <IonIcon icon={chevronBackOutline} />
        </button>
        <span className="mfp-title">{title}</span>
        <div style={{ width: 40 }} />
      </div>
      <div className="mfp-body">
        {children}
      </div>
    </div>
  )
}

export default function MobileFormPage({ open, onClose, title, children }) {
  if (!open) return null
  return createPortal(
    <FormPageContent onClose={onClose} title={title}>{children}</FormPageContent>,
    document.body
  )
}
