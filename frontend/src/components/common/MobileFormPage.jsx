import { useEffect } from 'react'
import { IonIcon } from '@ionic/react'
import { chevronBackOutline } from 'ionicons/icons'

export default function MobileFormPage({ open, onClose, title, children }) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

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
