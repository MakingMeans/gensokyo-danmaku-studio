---
description: Redacta el mensaje de commit de los cambios actuales
argument-hint: "[matiz opcional sobre el enfoque del mensaje]"
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*)
---

## Cambios actuales

- Estado: !`git status --short`
- Resumen de lo indexado: !`git diff --cached --stat`
- Contenido de lo indexado: !`git diff --cached`
- Resumen de lo NO indexado: !`git diff --stat`
- Estilo del historial: !`git log --oneline -10`

## Tarea

Redactar el mensaje de commit de esos cambios. Matiz pedido: $ARGUMENTS

**Si hay algo indexado, el mensaje describe SOLO lo indexado.** Lo que quede
fuera del índice se ignora por completo, sin mencionarlo: en un reparto de varios
commits, lo no indexado pertenece a otro. Solo cuando el índice está vacío se
describe el árbol de trabajo entero.

**Salida: dos bloques de código, en este orden, y nada más.**

1. El título, solo
2. El cuerpo, solo

Van **separados y sin nada entre ellos** para poder copiar cada uno por su
cuenta: el título y el cuerpo se pegan en campos distintos, y un bloque único
obliga a recortarlo a mano cada vez.

Sin preámbulo, sin explicar el mensaje después, sin resumir los cambios y sin
ofrecer ejecutar el commit. Si no hay cambios, decirlo en una línea y parar.

### Formato

Primer bloque:

```
<tipo>(<scope>): <descripción en minúscula, sin punto final>
```

Segundo bloque:

```
- <What changes and why, in a single line>
- <One bullet per decision or per block of change>
```

**Los saltos de línea del cuerpo se ponen entre puntos, nunca dentro de uno.**

Así no, el punto continúa en una segunda línea indentada:

```
- Use a struct-of-arrays layout for the bullet pool so that iterating
  over positions stays cache-friendly and allocation-free per frame
```

Así sí, el mismo contenido repartido en dos puntos que caben cada uno en su
línea:

```
- Use a struct-of-arrays layout for the bullet pool to keep iteration cache-friendly
- Avoid per-bullet allocations per frame so the GC never stalls the game loop
```

**Título**, en inglés:

- Tipos, y no hay más: `feat` `fix` `docs` `style` `refactor` `perf` `test`
  `build` `ci` `chore` `revert`
- Scopes de paquete: `engine` `editor` `game`
- Scopes transversales: `patterns` (JSON de `/patterns`) `assets` (manifest y
  sprites) `docs` (README, `docs/`, CLAUDE.md) `ci` (workflows) `repo`
  (configuración raíz: workspaces, tsconfig, ESLint, Prettier, scripts)
- Reservados a la automatización, no usar a mano: `deps`
- Un cambio incompatible lleva `!` antes de los dos puntos. En este proyecto
  eso significa casi siempre un cambio del formato de patrones que rompe los
  JSON existentes: `feat(engine)!: bump pattern schema to version 2`
- El scope es el paquete que cambia. Si un commit toca varios, elegir el
  paquete que motiva el cambio; si ninguno domina, es señal de que deberían
  ser dos commits

**Cuerpo**, en inglés, siguiendo `CLAUDE.md` (todo el código, comentarios,
commits y docs van en inglés). Es obligatorio:

- **Lista con `-`, nunca párrafos.** Entre dos y seis puntos.
- **Cada punto empieza en mayúscula** y no lleva punto final. El título va en
  minúscula porque es un asunto de Conventional Commit; los puntos del cuerpo
  son frases, y una frase empieza en mayúscula.
- **Un punto ocupa una línea física y solo una. Nunca hay una segunda línea
  indentada continuando un punto.** Un punto largo se **reescribe más corto** o
  se **parte en dos puntos independientes**, cada uno con su `-`. Envolverlo no
  es una tercera opción. Ver el ejemplo de arriba.
- Cada punto dice qué cambia y **por qué** en la misma línea. El cómo se omite:
  eso ya está en el diff.
- Cuando el cambio responde a una decisión de arquitectura de `CLAUDE.md`
  (simulación separada del render, pool sin allocations, RNG con semilla,
  esquema zod como única fuente de verdad), nombrarla: es lo que se defiende
  en una entrevista.
- No se repite el título ni se enumeran archivos.
- Si el commit cierra un punto del roadmap, citar la etapa: `Stage 1`,
  `Stage 2`, etc.
