import { useEffect, useRef, type ReactNode } from 'react';
import type { Provenance } from '../../shared/contracts.js';
import { GLYPH, PROVENANCE_TEXT, type Tone } from '../format.js';

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`badge tone-${tone}`}>
      <span className="g" aria-hidden="true">{GLYPH[tone]}</span>
      <span>{children}</span>
    </span>
  );
}

export function Id({ value, label }: { value: string; label?: string }) {
  return (
    <span className="id" title={value} aria-label={label ? `${label} ${value}` : undefined}>
      {value}
    </span>
  );
}

export function Notice({
  tone,
  title,
  children,
  actions,
  role,
}: {
  tone: Tone;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  role?: 'alert' | 'status';
}) {
  return (
    <section className={`notice tone-${tone}`} role={role} aria-label={title}>
      <h3>
        <span aria-hidden="true" className="mono">{GLYPH[tone]} </span>
        {title}
      </h3>
      {children}
      {actions ? <div className="notice-actions">{actions}</div> : null}
    </section>
  );
}

export function ProvenanceStrip({ mode, caseProvenance }: { mode: Provenance; caseProvenance?: Provenance | null }) {
  const shown = caseProvenance ?? mode;
  const t = PROVENANCE_TEXT[shown];
  const mismatch = caseProvenance && caseProvenance !== mode;
  return (
    <div className={`prov prov--${shown}`} role="region" aria-label="Provenance" data-provenance={shown}>
      <span className="prov-tag">{t.short}</span>
      <span>{shown === 'contract_test' ? t.long : t.long}</span>
      {mismatch ? (
        <span>
          Server run mode is <strong>{PROVENANCE_TEXT[mode].short}</strong>; this case row is <strong>{PROVENANCE_TEXT[shown].short}</strong>.
        </span>
      ) : (
        <span className="muted">Server run mode: {PROVENANCE_TEXT[mode].short}</span>
      )}
    </div>
  );
}

/** Accessible modal: focus trap, Escape, restore focus to the opener. */
export function Dialog({
  title,
  onClose,
  children,
  footer,
  describedBy,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  describedBy?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    opener.current = document.activeElement;
    const root = ref.current;
    const focusables = () =>
      root
        ? Array.from(
            root.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];
    (root?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0] ?? root)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) {
        e.preventDefault();
        return;
      }
      const first = f[0]!;
      const last = f[f.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !root?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !root?.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      const o = opener.current;
      if (o instanceof HTMLElement && document.contains(o)) o.focus();
    };
  }, []);

  return (
    <div className="scrim">
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={describedBy}
        ref={ref}
        tabIndex={-1}
      >
        <header>
          <h2 id="dialog-title">{title}</h2>
          <button type="button" className="btn" onClick={onClose} aria-label="Close dialog">
            Close
          </button>
        </header>
        <div className="dialog-body">{children}</div>
        {footer ? <footer>{footer}</footer> : <footer />}
      </div>
    </div>
  );
}

/** A button whose disabled state is explained by visible text, wired through aria-describedby. */
export function GuardedButton({
  id,
  reason,
  onClick,
  children,
  variant,
  busy,
  dataAutofocus,
  type = 'button',
}: {
  type?: 'button' | 'submit';
  id: string;
  reason: string | null;
  onClick?: () => void;
  children: ReactNode;
  variant?: 'primary' | 'danger';
  busy?: boolean;
  dataAutofocus?: boolean;
}) {
  const disabled = !!reason || !!busy;
  return (
    <span style={{ display: 'grid', gap: 4, minWidth: 0 }}>
      <button
        type={type}
        id={id}
        className={`btn${variant ? ` btn-${variant}` : ''}`}
        aria-disabled={disabled}
        aria-describedby={reason ? `${id}-why` : undefined}
        onClick={(e) => {
          if (disabled) e.preventDefault();
          else onClick?.();
        }}
        data-autofocus={dataAutofocus ? '' : undefined}
      >
        {busy ? 'Working…' : children}
      </button>
      {reason ? (
        <span id={`${id}-why`} className="why-disabled">
          Unavailable: {reason}
        </span>
      ) : null}
    </span>
  );
}
