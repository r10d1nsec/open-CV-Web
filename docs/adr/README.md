# Architecture Decision Records (ADRs)

Formato basado en [Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions). Un ADR es un registro corto e inmutable de una decisión arquitectónica relevante.

## Cuándo crear un ADR

Solo si la decisión:

- Elige entre alternativas con trade-offs reales.
- Introduce un patrón arquitectónico nuevo en el repo.
- Impone una restricción no trivial (política, contrato, modelo de tenancy).

Decisiones triviales o ya cubiertas por una spec **no necesitan ADR**.

## Naming

`NNNN-<slug-kebab>.md` — `0001-stack-nextjs-supabase-vercel.md`.

Numeración global ascendente. Nunca renumerar ADRs existentes.

## Estados

- `proposed` — en discusión.
- `accepted` — vigente.
- `deprecated` — reemplazado por otro ADR (link al sucesor).
- `superseded by ADR-NNNN` — explícito.

ADRs aceptados son **inmutables**. Si la decisión cambia, crea un ADR nuevo que supersede al anterior.

## Template

```markdown
# ADR-NNNN: <Título corto>

- **Status**: proposed | accepted | deprecated | superseded by ADR-XXXX
- **Date**: YYYY-MM-DD
- **Deciders**: <nombres>
- **Related specs**: spec:NNN, spec:MMM

## Context

¿Qué fuerzas/restricciones motivan esta decisión? Qué intentamos resolver.

## Decision

Lo que decidimos hacer, en imperativo.

## Consequences

- Positivas.
- Negativas.
- Riesgos / lo que vamos a vigilar.

## Alternatives considered

- Opción A — por qué no.
- Opción B — por qué no.
```
