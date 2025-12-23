# ROADMAP - Contrapunctus

Plan de desarrollo basado en "Ejercicios preliminares de contrapunto" de Arnold Schoenberg (1963).

---

## Filosofía

> "El contrapunto es la base de toda composición." — J.S. Bach

Cada capa añade complejidad gradualmente, exactamente como Fux enseñó a sus estudiantes en 1725 y como Schoenberg sistematizó en el siglo XX. **No avanzamos hasta dominar la capa anterior.**

### Principios de Desarrollo

1. **Fuente autorizada**: Cada regla implementada tiene referencia directa al tratado de Schoenberg (sección y página)
2. **Rigor pedagógico**: No simplificamos las reglas. Implementamos los matices (§7c tritonos compuestos, §8 paralelas intermitentes, "pecados menores")
3. **Teoría accesible**: El estudiante puede consultar la teoría completa sin salir de la aplicación
4. **Validación fiel**: El código implementa exactamente lo que dice el libro
5. **Progresión estricta**: Cada especie debe dominarse antes de avanzar a la siguiente

---

## Estado Actual

```
[██████████░░░░░░░░░░] 25% - Primera Especie + Teoría Completa
```

**Última actualización**: Diciembre 2024

---

## Fase 1: Primera Especie (1:1) ✅ COMPLETADA

**Nota contra nota - La base de todo**

*Referencia: Schoenberg, pp. 19-47*

### Implementado

#### Núcleo Teórico
- [x] Módulo Pitch (notación científica, MIDI, frecuencias)
- [x] Módulo Interval (cálculo, clasificación consonancia/disonancia)
- [x] Módulo Scale (mayor/menor, armaduras, grados)
- [x] Módulo CantusFirmus (colección Fux + Schoenberg Ej. 9)

#### Validador Primera Especie
- [x] FirstSpeciesValidator con reglas completas (17 reglas)

#### Interfaz
- [x] Pentagrama interactivo (Canvas 2D)
- [x] Navegación por teclado (flechas diatónicas/cromáticas)
- [x] Audio engine con filtro lowpass y ADSR
- [x] Sistema de puntuación
- [x] Panel de reglas con feedback visual
- [x] Modal de teoría completa (Schoenberg §1-§14)

#### Infraestructura
- [x] GitHub Pages desplegado

### Reglas Fundamentales Implementadas (Schoenberg §1-§6)

| Regla | Sección | Descripción |
|-------|---------|-------------|
| Consonancias | §2 | Solo P1, P5, P8, m3, M3, m6, M6 |
| Disonancias | §3 | Prohibidas: 2, 4, 7, 9, tritono |
| Quintas paralelas | §8.II | Estrictamente prohibidas |
| Octavas paralelas | §8.II | Estrictamente prohibidas |
| Quintas ocultas | §8.II | Prohibidas sin grado conjunto |
| Octavas ocultas | §8.II | Prohibidas sin grado conjunto |
| Inicio | §10 | Consonancia perfecta sobre tónica |
| Final | §10 | Unísono u octava sobre tónica |
| Cruce de voces | §9 | Prohibido |
| Unísono | §10 | Solo al inicio/final |

### Reglas Avanzadas Implementadas (Schoenberg §7-§8)

| Regla | Sección | Descripción |
|-------|---------|-------------|
| Tritono melódico | §7b | Prohibido entre grados 4-7 |
| Tritonos compuestos | §7c | Detecta tritono "oculto" con notas intermedias |
| Saltos disonantes compuestos | §7e | Dos saltos que sumen 7ª, 9ª o tritono |
| Dirección prolongada | §7f | Máximo 8-9 notas en una dirección |
| Arpegios | §7h | Evitar 3+ notas que delineen acorde |
| Paralelas intermitentes | §8 | Quintas/octavas separadas por una armonía |
| Excepción Beethoven | §8 | Permitido con salto 4ª/5ª + mov. contrario |
| Terceras/sextas excesivas | §8.II | No más de 3-4 consecutivas |
| Movimiento contrario | §8.I | Preferido sobre paralelo |
| Grados conjuntos | §7l | Preferidos, moverse en "ondas" |
| Cadencia | §11 | Penúltima = grado VII o II |

### Cantus Firmi Disponibles

- **Fux**: Re Dórico I, Re Dórico II
- **Tradicionales**: Do Mayor, Sol Mayor, Fa Mayor, La menor, Re menor, Mi bemol Mayor
- **Schoenberg Ejemplo 9**: 8 CF en Do, Sol, Fa, Mi♭, Re, La, Mi Mayor (pp. 34-38)

---

## Fase 2: Consolidación de Primera Especie 🔄 EN PROGRESO

**Consolidar antes de avanzar**

*Referencia: Schoenberg, pp. 34-47 (Ejemplos comentados)*

### 2.1 Contenido ✅ PARCIAL
- [x] 8 Cantus Firmi del Ejemplo 9 de Schoenberg
- [x] Modal de teoría completa (§1-§14)
- [ ] CF en modo menor (natural, armónico, melódico)
- [ ] Organizar por dificultad progresiva (1-5 estrellas)
- [ ] Sistema de niveles/logros

### 2.2 Feedback Pedagógico
- [ ] Mostrar TODAS las violaciones simultáneamente
- [ ] Highlight visual de notas problemáticas en rojo
- [ ] Sugerencias de corrección ("Prueba subir a...")
- [ ] Explicación pedagógica contextual (referencia a §)
- [ ] Comparación con soluciones de Schoenberg

### 2.3 Experiencia de Usuario
- [ ] Guardar progreso en localStorage
- [ ] Historial de ejercicios completados
- [ ] Estadísticas (errores más comunes, mejora temporal)
- [ ] Tutorial interactivo para nuevos usuarios
- [ ] Onboarding: "¿Qué es el contrapunto?"

### 2.4 Audio Mejorado
- [ ] Diferentes timbres (órgano, clavecín, cuerdas, voz)
- [ ] Tempo ajustable (Largo → Allegro)
- [ ] Reproducir solo CF / solo CP / ambos
- [ ] Metrónomo opcional
- [ ] Reproducción nota por nota (paso a paso)
- a discutir:

Nivel Básico (SoundFonts):

Usa Soundfont-player o Smplr. Son librerías JS que cargan pequeños archivos de muestras (mp3/ogg) de instrumentos reales (Piano, Coro, Clavicémbalo).

Recomendación: Busca un SoundFont de "Choir Aahs" o "Vocal Oohs". Escuchar las voces cantadas ayuda a detectar errores de conducción mucho mejor que un piano.

Nivel Pro (Tone.js):

Si quieres control total (reverb, envolventes), integra Tone.js. Puedes crear un sintetizador que suene suave y "humano" sin cargar archivos pesados.

3. Integración con MuseScore (MusicXML)
MuseScore no tiene una "API en tiempo real" para conectarse a una web (no puedes tener MuseScore abierto y que tu web escriba en él mágicamente). La integración estándar es a través de archivos.

La Clave: MusicXML

MuseScore (y Sibelius/Finale/Dorico) usan MusicXML como lenguaje universal.

Tu objetivo debe ser generar un archivo .musicxml desde tu web.

Cómo hacerlo:

Tu aplicación ya tiene la información de las notas (pitch, duración).

Usa una librería como musicxml-interfaces (o escribe un generador XML simple, ya que la 1ra especie es matemáticamente muy sencilla) para convertir tus datos en un archivo .xml.

Flujo para el usuario: El alumno termina el ejercicio -> Clic en "Exportar a MuseScore" -> Se descarga un archivo .mxl -> Lo abre en MuseScore y ya tiene la partitura lista para imprimir o orquestar.
---

## Fase 3: Segunda Especie (2:1)

**Dos notas de contrapunto por cada nota del CF**

*Referencia: Schoenberg, pp. 48-72*

### Diagrama
```
CF:     𝅝      𝅝      𝅝      𝅝
CP:    𝅗𝅥 𝅗𝅥   𝅗𝅥 𝅗𝅥   𝅗𝅥 𝅗𝅥   𝅝
       ↑ ↑    ↑ ↑    ↑ ↑    ↑
       T D    T D    T D    Final

T = Tiempo fuerte (DEBE ser consonante)
D = Tiempo débil (puede ser disonante SI es nota de paso)
```

### Conceptos Nuevos (Schoenberg §15-§23)

| Concepto | Sección | Descripción |
|----------|---------|-------------|
| Nota de paso | §16 | Conecta dos consonancias por grado conjunto |
| Tiempo fuerte | §15 | SIEMPRE consonante |
| Tiempo débil | §16 | Disonante solo como nota de paso |
| Repetición prohibida | §17 | No repetir nota en débil→fuerte |
| Saltos en tiempo débil | §18 | Permitidos con restricciones |
| Final | §19 | Última nota DEBE ser redonda |
| Comienzo | §20 | Puede empezar en tiempo débil (silencio) |

### Reglas Específicas a Implementar

1. **§15**: Consonancia obligatoria en tiempo fuerte
2. **§16**: Nota de paso válida = grado conjunto entre dos consonancias
3. **§17**: Prohibido repetir nota weak→strong
4. **§18**: Saltos permitidos en tiempo débil si:
   - No producen paralelas ocultas
   - Se compensan con movimiento contrario
5. **§19**: Penúltimo compás: blanca + blanca, último: redonda
6. **§20**: Inicio en anacrusa permitido
7. **§21**: Mantener reglas de primera especie para tiempos fuertes
8. **§22**: Paralelas entre tiempos fuertes siguen prohibidas
9. **§23**: Cambio de dirección después de salto

### Implementación Técnica
- [ ] SecondSpeciesValidator.js
- [ ] Renderizado de blancas (𝅗𝅥) en el pentagrama
- [ ] Detección automática de notas de paso válidas
- [ ] UI para colocar 2 notas por compás
- [ ] Validación de relación weak-strong
- [ ] Modal de teoría Segunda Especie

---

## Fase 4: Tercera Especie (4:1)

**Cuatro notas de contrapunto por cada nota del CF**

*Referencia: Schoenberg, pp. 73-95*

### Diagrama
```
CF:     𝅝          𝅝          𝅝
CP:    𝅘𝅥 𝅘𝅥 𝅘𝅥 𝅘𝅥   𝅘𝅥 𝅘𝅥 𝅘𝅥 𝅘𝅥   𝅝
       1 2 3 4    1 2 3 4    Final
       ↑         ↑
       Consonante (tiempo 1 obligatorio, tiempo 3 preferible)
```

### Conceptos Nuevos (Schoenberg §24-§35)

| Concepto | Sección | Descripción |
|----------|---------|-------------|
| Bordadura | §26 | Nota que sale y vuelve por grado (neighbor) |
| Escapada | §27 | Sale por grado, vuelve por salto (échappée) |
| Cambiata | §28 | Patrón específico de 4 notas |
| Doble nota de paso | §29 | Dos notas de paso consecutivas |
| Salto desde disonancia | §30 | Casos específicos permitidos |

### Reglas Específicas a Implementar

1. **§24**: Tiempo 1 DEBE ser consonante
2. **§25**: Tiempos 2, 3, 4 pueden ser disonantes por paso
3. **§26**: Bordadura: consonante → disonante por grado → misma consonante
4. **§27**: Escapada: consonante → disonante por grado → consonante por salto
5. **§28**: Cambiata: patrón C-D-C-C con salto de tercera
6. **§29**: Doble nota de paso: dos grados conjuntos en la misma dirección
7. **§30**: No más de 4 notas en la misma dirección sin compensar
8. **§31-35**: Casos especiales y excepciones

### Implementación Técnica
- [ ] ThirdSpeciesValidator.js
- [ ] Renderizado de negras (𝅘𝅥)
- [ ] Detección de patrones ornamentales
- [ ] UI para entrada rápida de 4 notas
- [ ] Visualización de patrones reconocidos
- [ ] Modal de teoría Tercera Especie

---

## Fase 5: Cuarta Especie (Síncopas)

**Suspensiones - El corazón expresivo del contrapunto**

*Referencia: Schoenberg, pp. 96-120*

### Diagrama
```
CF:     𝅝      𝅝      𝅝      𝅝
CP:    𝅗𝅥‿𝅗𝅥   𝅗𝅥‿𝅗𝅥   𝅗𝅥‿𝅗𝅥   𝅝
          ↑       ↑       ↑
       Suspensión (¡disonante en tiempo fuerte!)

Preparación → Suspensión → Resolución
(consonante)   (disonante)  (consonante, baja por grado)
```

### Conceptos Nuevos (Schoenberg §36-§48)

| Concepto | Sección | Descripción |
|----------|---------|-------------|
| Suspensión | §36 | Nota ligada que se vuelve disonante |
| Preparación | §37 | Tiempo débil anterior, DEBE ser consonante |
| Resolución | §38 | DEBE bajar por grado conjunto |
| Cadena de suspensiones | §42 | Suspensiones consecutivas (7-6-7-6...) |
| Ruptura de síncopa | §44 | Cuándo usar consonancia en tiempo fuerte |

### Suspensiones Válidas

| Superior | Inferior | Resolución |
|----------|----------|------------|
| 7-6 | — | Baja a sexta |
| 4-3 | — | Baja a tercera |
| 9-8 | — | Baja a octava |
| — | 2-3 | Sube a tercera (bajo) |

### Implementación Técnica
- [ ] FourthSpeciesValidator.js
- [ ] Renderizado de ligaduras (‿)
- [ ] Detección de preparación-suspensión-resolución
- [ ] Detección de cadenas de suspensiones
- [ ] UI para ligaduras entre compases
- [ ] Modal de teoría Cuarta Especie

---

## Fase 6: Quinta Especie (Floridus)

**Contrapunto florido - Combinación libre de todas las especies**

*Referencia: Schoenberg, pp. 121-145*

### Diagrama
```
CF:     𝅝          𝅝          𝅝          𝅝
CP:    𝅗𝅥 𝅘𝅥 𝅘𝅥    𝅘𝅥 𝅘𝅥 𝅗𝅥    𝅗𝅥‿𝅗𝅥      𝅝
       (2da esp) (3ra esp) (4ta esp)  (1ra)
```

### Conceptos Nuevos (Schoenberg §49-§60)

| Concepto | Sección | Descripción |
|----------|---------|-------------|
| Mezcla de especies | §49 | Libre combinación de 1ª-4ª |
| Coherencia rítmica | §50 | No cambios abruptos de densidad |
| Variedad | §51 | Esencial para interés musical |
| Clímax melódico | §52 | Punto culminante único |
| Preparación cadencial | §53 | Cómo cerrar con elegancia |

### Reglas de Mezcla

1. **§49**: Todas las reglas de especies anteriores aplican en su contexto
2. **§50**: Transiciones suaves entre densidades rítmicas
3. **§51**: No repetir el mismo patrón rítmico más de 2-3 veces
4. **§52**: Un solo punto culminante melódico
5. **§53**: Los últimos 2-3 compases preparan la cadencia (simplificar ritmo)

### Implementación Técnica
- [ ] FifthSpeciesValidator.js (combina 1ª-4ª)
- [ ] Selector de valores rítmicos libre
- [ ] Análisis de variedad rítmica
- [ ] Detección de clímax melódico
- [ ] Sugerencias de ornamentación
- [ ] Modal de teoría Quinta Especie

---

## Fase 7: Contrapunto a Tres Voces

**El contrapunto se convierte en armonía**

*Referencia: Schoenberg, Parte II, pp. 146-180*

### Conceptos Nuevos

| Concepto | Descripción |
|----------|-------------|
| Tríadas | Tres notas forman acordes completos |
| Cuarta consonante | La 4ª es consonante cuando hay bajo debajo |
| Duplicaciones | Qué nota del acorde doblar (fundamental, 5ª) |
| Espaciamiento | Máximo una octava entre voces superiores |

### Reglas Específicas (Schoenberg §61-§72)

1. **§61**: Evitar duplicar la sensible
2. **§62**: Preferir duplicar fundamental o quinta
3. **§63**: No más de octava entre soprano-contralto o contralto-tenor
4. **§64**: Bajo puede estar a más distancia
5. **§65**: Paralelas entre voces intermedias: más tolerancia
6. **§66-72**: Aplicación de cada especie a tres voces

### Implementación Técnica
- [ ] ThreeVoiceValidator.js
- [ ] Renderizado de 3 pentagramas
- [ ] Análisis de acordes resultantes
- [ ] Visualización de duplicaciones
- [ ] Detección de espaciamiento incorrecto

---

## Fase 8: Contrapunto a Cuatro Voces (SATB)

**El objetivo final: escritura coral**

*Referencia: Schoenberg, Parte III, pp. 181-220*

### Rangos Vocales
```
Soprano: ───────── (C4-G5)  Do4-Sol5
Alto:    ───────── (F3-C5)  Fa3-Do5
Tenor:   ───────── (C3-G4)  Do3-Sol4
Bajo:    ───────── (E2-C4)  Mi2-Do4
```

### Reglas Específicas (Schoenberg §73-§85)

| Regla | Sección | Descripción |
|-------|---------|-------------|
| Rangos | §73 | Estrictos para cada voz |
| Cruce | §74 | Absolutamente prohibido |
| Superposición | §75 | Limitada (no más de una 2ª) |
| Espaciamiento | §76 | SATB típico |
| Movimiento del bajo | §77 | Preferir saltos de 4ª/5ª |
| Acordes completos | §78 | Preferir sobre incompletos |

### Implementación Técnica
- [ ] FourVoiceValidator.js
- [ ] Sistema SATB completo
- [ ] Análisis armónico (I, IV, V, vi, etc.)
- [ ] Detección de funciones armónicas
- [ ] Preparación para armonía funcional

---

## Fase 9: Aplicaciones Avanzadas

**Más allá de las especies puras**

*Referencia: Schoenberg, Parte IV, pp. 221-280*

### Cadencias (§86-§89)

| Tipo | Movimiento | Función |
|------|------------|---------|
| Auténtica | V → I | Conclusiva |
| Plagal | IV → I | "Amén" |
| Rota | V → vi | Engaño |
| Semicadencia | ? → V | Suspensiva |

### Modulación (§90-§95)

- Modulación diatónica (tonos vecinos)
- Modulación cromática
- Pivote armónico

### Imitación y Canon (§96-§105)

| Técnica | Descripción |
|---------|-------------|
| Imitación libre | Una voz copia a otra aproximadamente |
| Imitación estricta | Copia exacta a otro intervalo |
| Canon | Imitación estricta continua |
| Invención | Dos voces en imitación libre (Bach) |

### Implementación Técnica
- [ ] CadenceAnalyzer.js
- [ ] ModulationDetector.js
- [ ] ImitationValidator.js
- [ ] CanonBuilder.js
- [ ] Generador de invenciones a 2 voces

---

## Fase 10: Herramientas Pedagógicas

### Para Estudiantes
- [ ] Modo examen (sin ayudas visuales)
- [ ] Certificados de completación por especie
- [ ] Comparación con soluciones de Schoenberg
- [ ] Exportar ejercicios como PDF
- [ ] Portafolio de ejercicios completados

### Para Profesores
- [ ] Crear ejercicios personalizados
- [ ] Banco de Cantus Firmi personalizado
- [ ] Seguimiento de progreso de estudiantes
- [ ] Modo clase (proyector, fuente grande)
- [ ] Exportar estadísticas de clase

### Técnico
- [ ] MIDI input (tocar desde teclado externo)
- [ ] MIDI output (exportar secuencia)
- [ ] MusicXML export (abrir en Sibelius, Finale, MuseScore)
- [ ] PWA (instalable, funciona offline)
- [ ] Tema claro/oscuro
- [ ] Accesibilidad (ARIA, navegación por teclado completa)

---

## Versiones

| Versión | Contenido | Estado |
|---------|-----------|--------|
| 0.1.0 | Primera Especie MVP | ✅ Dic 2024 |
| 0.2.0 | Reglas Schoenberg + Teoría | ✅ Dic 2024 |
| 0.3.0 | Consolidación 1ª Especie | 🔲 |
| 0.4.0 | Segunda Especie | 🔲 |
| 0.5.0 | Tercera Especie | 🔲 |
| 0.6.0 | Cuarta Especie | 🔲 |
| 0.7.0 | Quinta Especie | 🔲 |
| 0.8.0 | Tres Voces | 🔲 |
| 0.9.0 | Cuatro Voces (SATB) | 🔲 |
| 0.10.0 | Aplicaciones avanzadas | 🔲 |
| 1.0.0 | Release completo | 🔲 |

---

## Referencias Bibliográficas

### Fuentes Primarias
- **Schoenberg, A.** (1963). *Ejercicios preliminares de contrapunto*. Editorial Labor.
- **Fux, J.J.** (1725). *Gradus ad Parnassum*. Viena.

### Fuentes Secundarias
- Jeppesen, K. (1939). *Counterpoint: The Polyphonic Vocal Style of the 16th Century*
- Salzer, F. & Schachter, C. (1969). *Counterpoint in Composition*
- Kennan, K. (1999). *Counterpoint* (4th ed.)
- Gauldin, R. (1985). *A Practical Approach to Sixteenth-Century Counterpoint*

### Recursos en Línea
- IMSLP: Partituras de Fux, Bach, Palestrina
- Open Music Theory: teoria.esmuva.org

---

> *"Aprende las reglas como un profesional, para poder romperlas como un artista."* — Picasso

> *"Las restricciones son libertad disfrazada."* — Stravinsky
