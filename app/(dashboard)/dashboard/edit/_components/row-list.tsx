'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

/**
 * Contenedor de una fila editable dentro de un editor de lista
 * (experiencia, proyectos, testimonios, servicios). Chrome común alineado con
 * la maqueta de Claude Design (editor-content): tarjeta `.card`, grip handle
 * a la izquierda, badge "Editando" y controles a la derecha. El reorden por
 * ↑/↓ es el fallback accesible (drag-and-drop visual: iteración posterior).
 */
export function RowCard({
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
  label,
  children,
}: {
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className="card"
      style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <Icon name="grip" size={16} style={{ color: 'var(--text-faint)' }} />
          <span className="pill pill-accent" style={{ fontSize: 10.5, padding: '2px 8px' }}>
            {label} {index + 1}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <Button type="button" variant="ghost" size="sm" onClick={onMoveUp} disabled={index === 0} aria-label={`Subir ${label} ${index + 1}`}>
            <Icon name="arrowDown" size={13} style={{ transform: 'rotate(180deg)' }} />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onMoveDown} disabled={index === total - 1} aria-label={`Bajar ${label} ${index + 1}`}>
            <Icon name="arrowDown" size={13} />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label={`Quitar ${label} ${index + 1}`} style={{ color: 'var(--danger)' }}>
            <Icon name="x" size={13} />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}

/** Helpers puros de reordenado para arrays inmutables. */
export function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}
