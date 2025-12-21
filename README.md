# Contrapunctus

**Species Counterpoint Trainer** - Aprende contrapunto como lo hicieron Bach, Mozart y Beethoven.

## Concepto

Contrapunctus implementa el método tradicional de **contrapunto de especies** (Fux, 1725) digitalizado para el siglo XXI. Este es el sistema pedagógico que formó a los grandes compositores de la tradición occidental.

### Las Cinco Especies

| Especie | Ratio | Descripcion |
|---------|-------|-------------|
| **1ra** | 1:1 | Nota contra nota |
| 2da | 2:1 | Dos notas por cada una del CF |
| 3ra | 4:1 | Cuatro notas por cada una del CF |
| 4ta | Sincopa | Notas ligadas, suspensiones |
| 5ta | Floridus | Combinacion libre de especies |

> **MVP actual**: Primera Especie completamente implementada.

## Reglas de Primera Especie

Basadas en el *"Ejercicios preliminares de contrapunto"* de Arnold Schoenberg:

### Intervalos Permitidos

| Tipo | Intervalos | Uso |
|------|------------|-----|
| **Consonancias perfectas** | unisono (P1), quinta (P5), octava (P8) | Inicio y final obligatorio |
| **Consonancias imperfectas** | terceras (m3, M3), sextas (m6, M6) | Preferidas en el centro |
| **Disonancias** | segundas, cuartas, septimas | PROHIBIDAS |

### Prohibiciones

1. **Quintas y octavas paralelas** - Dos voces moviéndose en la misma dirección hacia una consonancia perfecta
2. **Quintas y octavas ocultas/directas** - Similar motion hacia consonancia perfecta sin grado conjunto
3. **Unísono** - Solo permitido al inicio y final
4. **Cruce de voces** - La voz superior nunca debe ir debajo de la inferior
5. **Tritono melódico** - Salto de cuarta aumentada / quinta disminuida prohibido

### Recomendaciones

- Preferir **movimiento contrario** sobre movimiento similar
- Preferir **grados conjuntos** (segundas) sobre saltos
- **Cadencia apropiada**: sensible → tónica (voz superior) o supertónica → tónica (voz inferior)
- Evitar saltos mayores a una sexta
- Mantener rango vocal razonable (máximo una décima)

## Uso

### Interfaz

```
┌─────────────────────────────────────────────────────────────┐
│  Ejercicios    │     Pentagrama      │   Reglas & Ayuda    │
│                │                     │                     │
│  • C Mayor     │   ♫ ♫ ♫ ♫ ♫ ♫ ♫    │   ✓ Solo consonanc. │
│  • G Mayor     │   ─────────────     │   ✓ Sin paralelas   │
│  • D menor     │   ● ● ● ● ● ● ●    │   ✗ Cruce de voces  │
│                │   (Cantus Firmus)   │                     │
│  [Superior]    │   [▶ Play] [Check]  │   Score: 85/100     │
│  [Inferior]    │                     │                     │
└─────────────────────────────────────────────────────────────┘
```

### Controles

- **Clic en el pentagrama**: Coloca una nota de contrapunto
- **Espacio**: Reproducir ejercicio
- **Enter**: Verificar solución
- **Ctrl+Z**: Deshacer
- **Esc**: Limpiar

### Feedback Visual

| Color | Significado |
|-------|-------------|
| Verde | Consonancia perfecta (P1, P5, P8) |
| Azul | Consonancia imperfecta (3as, 6as) |
| Rojo | Disonancia (error) |
| Naranja | Cantus Firmus |
| Morado | Contrapunto del usuario |

## Arquitectura

```
contrapunctus/
├── index.html              # Aplicación principal
├── js/
│   ├── core/
│   │   ├── Pitch.js        # Representación de alturas
│   │   ├── Interval.js     # Cálculo de intervalos
│   │   ├── Scale.js        # Escalas y tonalidades
│   │   └── CantusFirmus.js # Colección de CF
│   ├── validators/
│   │   └── FirstSpeciesValidator.js  # Reglas 1ra especie
│   └── ui/                 # (futuro) Componentes UI
├── css/                    # (futuro) Estilos externos
├── data/
│   └── cantus-firmi/       # (futuro) JSON de CF adicionales
└── README.md
```

### Módulos Core

**Pitch.js**
- Notación científica (C4, F#5, Bb3)
- Conversión MIDI ↔ nombre
- Cálculo de frecuencias
- Rangos vocales

**Interval.js**
- Cálculo de intervalos
- Clasificación: perfecto/imperfecto/disonante
- Inversiones
- Nombres en español

**Scale.js**
- Escalas mayor/menor/modales
- Armaduras de clave
- Grados de la escala
- Verificación de notas diatónicas

**CantusFirmus.js**
- Colección de CF clásicos (Fux, Schoenberg)
- Transposición
- Validación de CF

**FirstSpeciesValidator.js**
- Todas las reglas de primera especie
- Sistema de puntuación
- Feedback por nota
- Sugerencias de notas válidas

## Fundamento Teórico

### Johann Joseph Fux (1660-1741)

El *Gradus ad Parnassum* (1725) estableció el método de especies como pedagogía estándar. El tratado presenta un diálogo entre maestro (Aloys) y estudiante (Josephus), introduciendo gradualmente las reglas.

### Arnold Schoenberg (1874-1951)

Los *Ejercicios preliminares de contrapunto* (publicados póstumamente) aplican el método de Fux con rigor moderno, proporcionando reglas explícitas y numerosos ejercicios.

### Por qué funciona este método

1. **Restricciones = Libertad creativa** - Las reglas canalizan la creatividad
2. **Progresión gradual** - De simple a complejo
3. **Feedback inmediato** - Cada violación es identificable
4. **Base para la armonía** - El contrapunto precede históricamente a la armonía

## Roadmap

### Fase 1: Primera Especie (MVP) ✅
- [x] Módulos core (Pitch, Interval, Scale)
- [x] Cantus Firmi de Fux
- [x] FirstSpeciesValidator
- [x] Interfaz de pentagrama
- [x] Audio playback
- [x] Sistema de puntuación

### Fase 2: Expansión
- [ ] Segunda especie (2:1)
- [ ] Más cantus firmi (Schoenberg)
- [ ] Modo menor completo
- [ ] Guardar/cargar progreso

### Fase 3: Tres Voces
- [ ] Tercera y cuarta especie
- [ ] Contrapunto a 3 voces
- [ ] Análisis de acordes resultantes

### Fase 4: Avanzado
- [ ] Quinta especie (floridus)
- [ ] Cuatro voces
- [ ] Imitación y canon
- [ ] MIDI input

## Tecnologías

- **Canvas 2D**: Notación musical
- **Web Audio API**: Síntesis y playback
- **JavaScript ES6+**: Módulos vanilla
- **CSS Custom Properties**: Theming

## Referencias

- Fux, J.J. (1725). *Gradus ad Parnassum*
- Schoenberg, A. (1963). *Ejercicios preliminares de contrapunto*
- Jeppesen, K. (1939). *Counterpoint*
- Salzer & Schachter. *Counterpoint in Composition*

## Licencia

MIT

---

*"El contrapunto es la base de toda composición."* — J.S. Bach
