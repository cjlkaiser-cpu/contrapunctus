# ROADMAP - Contrapunctus

Plan de desarrollo basado en "Ejercicios preliminares de contrapunto" de Arnold Schoenberg.

---

## Filosofía

> "El contrapunto es la base de toda composición." — J.S. Bach

Cada capa añade complejidad gradualmente, exactamente como Fux enseñó a sus estudiantes en 1725 y como Schoenberg sistematizó en el siglo XX. No avanzamos hasta dominar la capa anterior.

---

## Estado Actual

```
[████████░░░░░░░░░░░░] 20% - Primera Especie Completa
```

---

## Fase 1: Primera Especie (1:1) ✅ COMPLETADA

**Nota contra nota - La base de todo**

### Implementado
- [x] Módulo Pitch (notación científica, MIDI, frecuencias)
- [x] Módulo Interval (cálculo, clasificación consonancia/disonancia)
- [x] Módulo Scale (mayor/menor, armaduras, grados)
- [x] Módulo CantusFirmus (colección Fux + tradicionales)
- [x] FirstSpeciesValidator con reglas completas
- [x] Interfaz de pentagrama (Canvas 2D)
- [x] Navegación por teclado (flechas diatónicas/cromáticas)
- [x] Audio engine con filtro lowpass
- [x] Sistema de puntuación
- [x] GitHub Pages desplegado

### Reglas Implementadas (Schoenberg Cap. 1-2)
- [x] Solo consonancias (P1, P5, P8, m3, M3, m6, M6)
- [x] Sin quintas paralelas
- [x] Sin octavas paralelas
- [x] Sin quintas ocultas (sin grado conjunto)
- [x] Sin octavas ocultas (sin grado conjunto)
- [x] Comenzar en consonancia perfecta
- [x] Terminar en unísono u octava
- [x] Sin cruce de voces
- [x] Unísono solo al inicio/final
- [x] Sin tritono melódico
- [x] Preferir movimiento contrario
- [x] Preferir grados conjuntos
- [x] Cadencia apropiada (sensible→tónica o supertónica→tónica)

---

## Fase 2: Expansión de Primera Especie

**Consolidar antes de avanzar**

### 2.1 Contenido
- [ ] Extraer TODOS los Cantus Firmi del libro de Schoenberg
- [ ] Añadir CF en modo menor (natural, armónico, melódico)
- [ ] Organizar por dificultad progresiva
- [ ] Sistema de niveles/logros

### 2.2 Feedback Mejorado
- [ ] Mostrar TODAS las violaciones (no solo la primera)
- [ ] Highlight visual de notas problemáticas en rojo
- [ ] Sugerencias de corrección ("Prueba con...")
- [ ] Explicación pedagógica de cada error

### 2.3 UX
- [ ] Guardar progreso en localStorage
- [ ] Historial de ejercicios completados
- [ ] Estadísticas (errores más comunes, mejora temporal)
- [ ] Tutorial interactivo para nuevos usuarios

### 2.4 Audio
- [ ] Diferentes timbres (órgano, clavecín, cuerdas)
- [ ] Tempo ajustable
- [ ] Reproducir solo CF / solo CP / ambos
- [ ] Metronomo opcional

---

## Fase 3: Segunda Especie (2:1)

**Dos notas de contrapunto por cada nota del CF**

### Nuevos Conceptos
```
CF:     𝅝      𝅝      𝅝      𝅝
CP:    𝅗𝅥 𝅗𝅥   𝅗𝅥 𝅗𝅥   𝅗𝅥 𝅗𝅥   𝅝
       ↑ ↑    ↑ ↑    ↑ ↑    ↑
       T D    T D    T D    Final
```

### Reglas Nuevas (Schoenberg Cap. 3)
- [ ] Tiempo fuerte: DEBE ser consonante
- [ ] Tiempo débil: puede ser disonante SI es nota de paso
- [ ] Nota de paso: conecta dos consonancias por grado conjunto
- [ ] No repetir la misma nota en tiempo débil→fuerte
- [ ] Saltos permitidos en tiempo débil (con restricciones)
- [ ] La última nota debe ser redonda (no blanca)

### Implementación
- [ ] SecondSpeciesValidator.js
- [ ] Renderizado de blancas en el pentagrama
- [ ] Detección de notas de paso válidas
- [ ] UI para colocar 2 notas por beat

---

## Fase 4: Tercera Especie (4:1)

**Cuatro notas de contrapunto por cada nota del CF**

### Nuevos Conceptos
```
CF:     𝅝          𝅝          𝅝
CP:    𝅘𝅥 𝅘𝅥 𝅘𝅥 𝅘𝅥   𝅘𝅥 𝅘𝅥 𝅘𝅥 𝅘𝅥   𝅝
       1 2 3 4    1 2 3 4    Final
       ↑         ↑
       Consonante (tiempos 1 y 3 preferiblemente)
```

### Reglas Nuevas (Schoenberg Cap. 4)
- [ ] Tiempo 1: DEBE ser consonante
- [ ] Tiempos 2, 3, 4: pueden ser disonantes por paso
- [ ] Bordadura (neighbor tone): nota que sale y vuelve por grado
- [ ] Escapada (échappée): sale por grado, vuelve por salto
- [ ] Cambiata: patrón específico de 4 notas
- [ ] Doble nota de paso
- [ ] No más de 4 notas en la misma dirección

### Implementación
- [ ] ThirdSpeciesValidator.js
- [ ] Renderizado de negras
- [ ] Detección de ornamentos (bordadura, escapada, cambiata)
- [ ] UI para entrada rápida de 4 notas

---

## Fase 5: Cuarta Especie (Síncopas)

**Suspensiones - El corazón expresivo del contrapunto**

### Nuevos Conceptos
```
CF:     𝅝      𝅝      𝅝      𝅝
CP:    𝅗𝅥‿𝅗𝅥   𝅗𝅥‿𝅗𝅥   𝅗𝅥‿𝅗𝅥   𝅝
          ↑       ↑       ↑
       suspensión (disonante en tiempo fuerte!)

Preparación → Suspensión → Resolución
(consonante)   (disonante)  (consonante, baja por grado)
```

### Reglas Nuevas (Schoenberg Cap. 5)
- [ ] Suspensión: nota ligada que se vuelve disonante
- [ ] Preparación: tiempo débil anterior, DEBE ser consonante
- [ ] Resolución: DEBE bajar por grado conjunto
- [ ] Suspensiones válidas: 7-6, 4-3, 9-8 (2-1 en el bajo)
- [ ] Cadenas de suspensiones
- [ ] Cuándo romper la síncopa (consonancia en tiempo fuerte)

### Implementación
- [ ] FourthSpeciesValidator.js
- [ ] Renderizado de ligaduras
- [ ] Detección de cadenas de suspensiones
- [ ] UI para ligaduras entre compases

---

## Fase 6: Quinta Especie (Floridus)

**Contrapunto florido - Combinación libre de todas las especies**

### Concepto
```
CF:     𝅝          𝅝          𝅝          𝅝
CP:    𝅗𝅥 𝅘𝅥 𝅘𝅥    𝅘𝅥 𝅘𝅥 𝅗𝅥    𝅗𝅥‿𝅗𝅥      𝅝
       (2da esp) (3ra esp) (4ta esp)  (1ra)
```

### Reglas (Schoenberg Cap. 6)
- [ ] Mezclar libremente 1ra, 2da, 3ra y 4ta especie
- [ ] Mantener coherencia rítmica
- [ ] Variedad es esencial
- [ ] Punto culminante melódico
- [ ] Preparar la cadencia final

### Implementación
- [ ] FifthSpeciesValidator.js (combina todos los anteriores)
- [ ] Selector de valores rítmicos libre
- [ ] Análisis de variedad rítmica
- [ ] Sugerencias de ornamentación

---

## Fase 7: Tres Voces

**El contrapunto se vuelve armonía**

### Nuevos Conceptos
- Tres líneas independientes que forman acordes
- La CUARTA se vuelve consonante (cuando hay un bajo debajo)
- Duplicaciones: qué nota del acorde doblar

### Reglas Nuevas (Schoenberg Parte II)
- [ ] Evitar duplicar la sensible
- [ ] Preferir duplicar la fundamental o la quinta
- [ ] Espaciamiento: no más de octava entre voces superiores
- [ ] Nuevas reglas de movimiento paralelo
- [ ] Acordes completos vs incompletos

### Implementación
- [ ] ThreeVoiceValidator.js
- [ ] Renderizado de 3 pentagramas o gran pentagrama
- [ ] Análisis de acordes resultantes
- [ ] Visualización de duplicaciones

---

## Fase 8: Cuatro Voces (SATB)

**El objetivo final: escritura coral**

### Voces
```
Soprano: ───────── (C4-G5)
Alto:    ───────── (F3-C5)
Tenor:   ───────── (C3-G4)
Bajo:    ───────── (E2-C4)
```

### Reglas Nuevas (Schoenberg Parte III)
- [ ] Rangos vocales estrictos
- [ ] Cruce de voces prohibido
- [ ] Superposición limitada
- [ ] Espaciamiento SATB
- [ ] Movimiento del bajo (fundamental)

### Implementación
- [ ] FourVoiceValidator.js
- [ ] Sistema SATB completo
- [ ] Análisis armónico (I, IV, V, etc.)
- [ ] Preparación para armonía funcional

---

## Fase 9: Aplicaciones Avanzadas

**Más allá de las especies puras**

### Contenido (Schoenberg Parte IV)
- [ ] Cadencias (auténtica, plagal, rota, semicadencia)
- [ ] Modulación (cambio de tonalidad)
- [ ] Imitación (una voz copia a otra)
- [ ] Canon (imitación estricta)
- [ ] Invención a 2 voces (estilo Bach)

---

## Fase 10: Herramientas Adicionales

### Para Estudiantes
- [ ] Modo examen (sin ayudas)
- [ ] Certificados de completación
- [ ] Comparación con soluciones de Schoenberg
- [ ] Exportar ejercicios como PDF

### Para Profesores
- [ ] Crear ejercicios personalizados
- [ ] Banco de Cantus Firmi personalizado
- [ ] Seguimiento de progreso de estudiantes
- [ ] Modo clase (proyector)

### Técnico
- [ ] MIDI input (tocar en teclado)
- [ ] MIDI output (exportar)
- [ ] MusicXML export
- [ ] PWA (instalable offline)
- [ ] Tema claro/oscuro

---

## Hitos

| Versión | Contenido | Estado |
|---------|-----------|--------|
| 0.1.0 | Primera Especie MVP | ✅ |
| 0.2.0 | CF de Schoenberg + mejoras UX | 🔲 |
| 0.3.0 | Segunda Especie | 🔲 |
| 0.4.0 | Tercera Especie | 🔲 |
| 0.5.0 | Cuarta Especie | 🔲 |
| 0.6.0 | Quinta Especie | 🔲 |
| 0.7.0 | Tres Voces | 🔲 |
| 0.8.0 | Cuatro Voces (SATB) | 🔲 |
| 0.9.0 | Aplicaciones avanzadas | 🔲 |
| 1.0.0 | Release completo | 🔲 |

---

## Referencias

- Fux, J.J. (1725). *Gradus ad Parnassum*
- Schoenberg, A. (1963). *Ejercicios preliminares de contrapunto*
- Jeppesen, K. (1939). *Counterpoint: The Polyphonic Vocal Style of the 16th Century*
- Salzer & Schachter. *Counterpoint in Composition*
- Kennan, K. (1999). *Counterpoint*

---

*"Aprende las reglas como un profesional, para poder romperlas como un artista."* — Picasso
