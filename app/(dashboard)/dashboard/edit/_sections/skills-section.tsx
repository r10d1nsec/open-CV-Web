'use client';

import { useActionState, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  updateSkills,
  type ActionResult,
} from '@/app/(dashboard)/dashboard/edit/_actions/update-profile';
import type { SkillsInput } from '@/lib/validation/profile';
import { Field, SectionShell } from '@/app/(dashboard)/dashboard/edit/_components/section-shell';

export function SkillsSection({ initial }: { initial: SkillsInput }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => updateSkills(prev ?? { ok: true }, fd),
    null,
  );
  const [groups, setGroups] = useState(
    initial.groups.length > 0
      ? initial.groups.map((g) => ({ name: g.name, items: g.items.join(', ') }))
      : [{ name: 'Tech stack', items: '' }],
  );
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  function updateGroup(i: number, patch: Partial<{ name: string; items: string }>) {
    setGroups((prev) => prev.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));
  }
  function addGroup() {
    if (groups.length >= 8) return;
    setGroups((prev) => [...prev, { name: '', items: '' }]);
  }
  function removeGroup(i: number) {
    setGroups((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <form action={formAction} noValidate>
      <SectionShell
        title="Skills"
        subtitle="Agrupa tus habilidades por categoría. Hasta 8 grupos, 20 items por grupo."
        state={state}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {groups.map((g, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr auto',
                gap: 10,
                alignItems: 'start',
                padding: 12,
                background: 'var(--surface-2)',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border)',
              }}
            >
              <Field label="Grupo" name={`groups[${i}][name]`} error={fe?.[`groups.${i}.name`]}>
                <Input
                  name={`groups[${i}][name]`}
                  value={g.name}
                  onChange={(e) => updateGroup(i, { name: e.target.value })}
                  placeholder="Diseño · Frontend · Idiomas"
                  maxLength={40}
                />
              </Field>
              <Field
                label="Items (separados por coma)"
                name={`groups[${i}][items]`}
                error={fe?.[`groups.${i}.items`]}
              >
                <Input
                  name={`groups[${i}][items]`}
                  value={g.items}
                  onChange={(e) => updateGroup(i, { items: e.target.value })}
                  placeholder="React, TypeScript, CSS"
                />
              </Field>
              <div style={{ paddingTop: 22 }}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGroup(i)}
                  aria-label={`Quitar grupo ${g.name || i + 1}`}
                >
                  Quitar
                </Button>
              </div>
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addGroup}
              disabled={groups.length >= 8}
            >
              + Añadir grupo
            </Button>
          </div>
        </div>
      </SectionShell>
    </form>
  );
}
