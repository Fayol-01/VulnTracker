import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Reusable right-side drawer.
 * Props: isOpen, onClose, title, children, footer (optional node)
 */
export default function Drawer({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={onClose} aria-hidden="true" />
      {/* Panel */}
      <div className="drawer-panel" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer-header">
          <span className="font-mono text-label-caps uppercase tracking-widest text-on-surface-variant">
            {title}
          </span>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-error transition-colors"
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="drawer-body">
          {children}
        </div>

        {footer && (
          <div className="drawer-footer">
            {footer}
          </div>
        )}
      </div>
    </>,
    document.body
  );
}
