# NeuroFux - Visión Fundacional

> *"Aprende las reglas como un profesional, para poder romperlas como un artista."* — Picasso

---

## El Proyecto

**NeuroFux** es un sistema de composición musical que une 300 años de teoría del contrapunto con inteligencia artificial moderna. El objetivo: crear un compositor artificial que **entienda** las reglas, no solo las imite.

### Dos Fases, Un Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   FASE I: CONTRAPUNCTUS                                         │
│   ═════════════════════                                          │
│   Sistema basado en reglas explícitas                           │
│   Implementación completa del método de especies (Fux/Schoenberg)│
│   Herramienta pedagógica para aprender contrapunto              │
│                                                                  │
│   Estado: Primera especie completa ✓                            │
│   Meta: Cinco especies + cuatro voces                           │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   FASE II: NEUROFUX                                             │
│   ═════════════════                                              │
│   Modelo neuro-simbólico de generación                          │
│   Combina reglas explícitas + patrones aprendidos de Bach       │
│   Genera, sugiere, explica                                      │
│                                                                  │
│   Estado: Diseño conceptual                                     │
│   Meta: Modelo en browser que asiste al estudiante              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Filosofía

### 1. El Conocimiento Musical es Valioso

Los tratados de Fux (1725) y Schoenberg (1963) codifican siglos de sabiduría compositiva. Los modelos de ML actuales (DeepBach, Music Transformer) **ignoran** este conocimiento e intentan aprenderlo todo desde cero.

**Nuestra tesis:** Inyectar reglas explícitas produce modelos más pequeños, más eficientes, más explicables y más correctos.

### 2. Progresión Pedagógica

Fux enseñaba contrapunto en cinco especies, de simple a complejo. Cada especie añade una capa de libertad:

| Especie | Ratio | Concepto Nuevo |
|---------|-------|----------------|
| 1ª | 1:1 | Consonancia, conducción de voces |
| 2ª | 2:1 | Notas de paso, tiempo fuerte/débil |
| 3ª | 4:1 | Ornamentación: bordaduras, escapadas |
| 4ª | Síncopa | Suspensión y resolución |
| 5ª | Libre | Combinación creativa |

**Tanto el estudiante humano como el modelo de ML deben seguir esta progresión.**

### 3. Explicabilidad

Un modelo que solo genera música es una caja negra. Un modelo que explica *por qué* genera cada nota es un **maestro**.

```
Modelo tradicional:
  Input: contexto → Output: nota

NeuroFux:
  Input: contexto → Output: nota + explicación

  "Elegí B4 porque:
   - Es la sensible (grado 7) → cadencia correcta (§11)
   - Movimiento contrario al CF → preferido (§8.I)
   - Evita quintas paralelas con A4
   - Patrón frecuente en corales de Bach"
```

### 4. Restricciones como Libertad

> *"Las restricciones son libertad disfrazada."* — Stravinsky

El sistema de constraints permite:
- Armonizar una melodía dada
- Completar un coral parcial
- Forzar cadencias específicas
- Experimentar con reglas relajadas

---

## Arquitectura

### Fase I: Contrapunctus (Basado en Reglas)

```
contrapunctus/
├── js/
│   ├── core/
│   │   ├── Pitch.js              ✓ Representación de alturas
│   │   ├── Interval.js           ✓ Cálculo de intervalos
│   │   ├── Scale.js              ✓ Escalas y tonalidades
│   │   └── CantusFirmus.js       ✓ Colección de CF
│   │
│   ├── validators/
│   │   ├── FirstSpeciesValidator.js    ✓ 17 reglas Schoenberg
│   │   ├── SecondSpeciesValidator.js   ○ Notas de paso
│   │   ├── ThirdSpeciesValidator.js    ○ Ornamentación
│   │   ├── FourthSpeciesValidator.js   ○ Suspensiones
│   │   ├── FifthSpeciesValidator.js    ○ Floridus
│   │   ├── ThreeVoiceValidator.js      ○ Tríadas
│   │   └── FourVoiceValidator.js       ○ SATB completo
│   │
│   ├── generators/                      ○ FUTURO
│   │   ├── CFGenerator.js              ○ Generar Cantus Firmi
│   │   └── SolutionGenerator.js        ○ Generar soluciones de referencia
│   │
│   └── ui/
│       ├── Staff.js                    ○ Renderizado de pentagrama
│       ├── Controls.js                 ○ Controles interactivos
│       └── Feedback.js                 ○ Visualización de errores
│
├── index.html                    ✓ Aplicación principal
├── README.md                     ✓ Documentación
├── ROADMAP.md                    ✓ Plan de desarrollo
└── VISION.md                     ✓ Este documento

✓ = Implementado | ○ = Pendiente
```

### Fase II: NeuroFux (Neuro-Simbólico)

```
neurofux/
├── training/                     # Python (PyTorch)
│   ├── data/
│   │   ├── corpus.py            # Carga de corales (music21)
│   │   ├── representation.py    # Intervalos relativos
│   │   └── augmentation.py      # Transposiciones
│   │
│   ├── models/
│   │   ├── mamba_backbone.py    # State Space Model
│   │   ├── rule_head.py         # Rule-Augmented Attention
│   │   └── diffusion.py         # Refinador opcional
│   │
│   ├── train.py                 # Entrenamiento por curriculum
│   └── export.py                # PyTorch → ONNX
│
├── inference/                    # JavaScript (Browser)
│   ├── model.onnx               # Modelo cuantizado (~5-10MB)
│   ├── NeuroFux.js              # Wrapper de inferencia
│   └── integration.js           # Integración con Contrapunctus
│
└── README.md
```

---

## Representación Musical

### Tradicional (DeepBach)
```
Nota = MIDI absoluto
C4 → 60, C#4 → 61, D4 → 62, ...

Problemas:
- Debe aprender que C-E-G ≈ D-F#-A (acordes mayores)
- Modelo grande, aprende lento
```

### Propuesta (NeuroFux)
```
Nota = (grado, función, intervalo_relativo)

C4 en C mayor = (1, T, 0)    # Grado 1, Tónica, +0 desde anterior
E4 en C mayor = (3, T, +4)   # Grado 3, Tónica, +4 semitonos
G4 en C mayor = (5, D, +3)   # Grado 5, Dominante, +3 semitonos

Ventajas:
- Invariante a transposición
- Función armónica explícita
- Modelo más pequeño
```

### Metadatos Adicionales
```javascript
{
  note: "E4",
  degree: 3,
  function: "T",           // T=tónica, S=subdominante, D=dominante
  intervalFromPrev: 4,     // Semitonos desde nota anterior
  intervalFromCF: 4,       // Intervalo con cantus firmus
  beat: "strong",          // Posición métrica
  species: 1,              // Especie actual
  fermata: false           // ¿Tiene fermata?
}
```

---

## Modelo de ML

### Innovaciones Clave (2026)

NeuroFux no es solo "otro modelo de música". Incorpora tres innovaciones arquitectónicas que lo distinguen de DeepBach y Music Transformer:

#### 1. Multi-Hot Harmony: Consciencia Vertical

**El Problema:** Los modelos existentes (DeepBach, Transformers) procesan música horizontalmente (secuencia temporal). Pero Bach pensaba **verticalmente**: cada instante es un acorde, no solo notas independientes.

**La Solución:** Token de Contexto Vertical que representa el estado armónico instantáneo.

```
REPRESENTACIÓN TRADICIONAL (solo horizontal):
═══════════════════════════════════════════

Soprano: C5 → D5 → E5 → F5
         ↓    ↓    ↓    ↓
         El modelo solo ve: "qué nota vino antes"


NEUROFUX (horizontal + vertical):
═════════════════════════════════

Soprano: C5 → D5 → E5 → F5
Alto:    E4 → F4 → G4 → A4
Tenor:   G3 → A3 → B3 → C4
Bajo:    C3 → D3 → E3 → F3
         ↓    ↓    ↓    ↓
         │    │    │    └── Vector: [F,A,C,F] = F mayor
         │    │    └─────── Vector: [E,G,B,E] = E menor
         │    └──────────── Vector: [D,F,A,D] = D menor
         └───────────────── Vector: [C,E,G,C] = C mayor

Cada posición incluye un vector multi-hot de "qué suena ahora"
```

**Implementación:**

```python
class VerticalContextEncoder(nn.Module):
    """
    Codifica el estado armónico vertical en cada beat.

    Input: notas activas en este instante (otras voces)
    Output: embedding de contexto armónico
    """

    def __init__(self, num_pitches=128, hidden_dim=64):
        self.pitch_embedding = nn.Embedding(num_pitches, hidden_dim)
        self.harmony_mlp = nn.Sequential(
            nn.Linear(hidden_dim * 4, hidden_dim),  # 4 voces máx
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim)
        )

    def forward(self, active_notes):
        """
        active_notes: tensor de notas sonando en este beat
                      shape: (batch, num_voices)
        """
        # Embedding de cada nota activa
        embeddings = self.pitch_embedding(active_notes)

        # Concatenar y procesar
        concat = embeddings.view(batch, -1)
        harmony_vector = self.harmony_mlp(concat)

        return harmony_vector

# En el forward principal:
def forward(self, sequence, position):
    # Contexto horizontal (Mamba)
    horizontal = self.mamba(sequence)

    # Contexto vertical (Multi-Hot)
    vertical = self.vertical_encoder(
        get_active_notes(sequence, position)
    )

    # Fusionar
    combined = torch.cat([horizontal, vertical], dim=-1)
    return self.predictor(combined)
```

**Por qué importa:** Si el modelo sabe que el beat actual forma un "acorde de sexta napolitana" (bII6), su probabilidad de elegir la resolución correcta aumenta exponencialmente. Bach pensaba en funciones armónicas, no en notas aisladas.

---

#### 2. Beam Search con Lookahead Simbólico

**El Problema:** Una nota puede ser válida *ahora* pero arrinconarte en el siguiente compás. Ejemplo: elegir A4 es legal, pero te obliga a hacer quintas paralelas para resolver la cadencia.

**La Solución:** El validador no solo puntúa, simula el futuro.

```
ENFOQUE TRADICIONAL:
════════════════════

Modelo propone: [G4, A4, B4, C5, D5]
Validador puntúa cada una independientemente:
  G4: 0.8  ✓
  A4: 0.7  ✓  ← parece buena
  B4: 0.9  ✓
  C5: 0.6  ✓
  D5: 0.4  ✗

Usuario elige A4... y en el siguiente beat no hay salida legal.


NEUROFUX CON LOOKAHEAD:
═══════════════════════

Modelo propone: [G4, A4, B4, C5, D5]
Validador simula 1-2 pasos adelante:

  G4: 0.8 → siguiente beat tiene 5 opciones válidas ✓
  A4: 0.7 → siguiente beat tiene 0 opciones válidas ✗ PODA
  B4: 0.9 → siguiente beat tiene 4 opciones válidas ✓
  C5: 0.6 → siguiente beat tiene 3 opciones válidas ✓
  D5: 0.4 → siguiente beat tiene 1 opción válida ⚠️

A4 se descarta ANTES de mostrarse al usuario.
```

**Implementación:**

```python
class LookaheadBeamSearch:
    """
    Beam search que poda ramas que llevan a callejones sin salida.
    """

    def __init__(self, validator, lookahead_depth=2, beam_width=5):
        self.validator = validator
        self.lookahead_depth = lookahead_depth
        self.beam_width = beam_width

    def search(self, model, context, cf_remaining):
        """
        Genera las mejores opciones considerando el futuro.
        """
        # Paso 1: Obtener top-K del modelo neural
        logits = model(context)
        top_k = torch.topk(logits, k=self.beam_width * 2)
        candidates = top_k.indices

        # Paso 2: Para cada candidato, simular el futuro
        viable_candidates = []

        for note in candidates:
            # Simular: si elijo esta nota, ¿cuántas opciones tengo después?
            future_options = self.simulate_future(
                context,
                note,
                cf_remaining,
                depth=self.lookahead_depth
            )

            if future_options > 0:
                viable_candidates.append({
                    'note': note,
                    'neural_score': logits[note],
                    'future_flexibility': future_options
                })

        # Paso 3: Rankear por score * flexibilidad futura
        viable_candidates.sort(
            key=lambda x: x['neural_score'] * (1 + 0.1 * x['future_flexibility']),
            reverse=True
        )

        return viable_candidates[:self.beam_width]

    def simulate_future(self, context, chosen_note, cf_remaining, depth):
        """
        Recursivamente simula: ¿cuántos caminos válidos hay?
        """
        if depth == 0 or len(cf_remaining) == 0:
            return 1  # Llegamos al final, es viable

        # Actualizar contexto con la nota elegida
        new_context = update_context(context, chosen_note)

        # Obtener opciones válidas para el siguiente beat
        next_cf = cf_remaining[0]
        valid_options = self.validator.getValidNotes(
            next_cf,
            context.current_cf,
            chosen_note,
            ...
        )

        if len(valid_options) == 0:
            return 0  # Callejón sin salida

        # Sumar flexibilidad de cada opción
        total_paths = 0
        for option in valid_options[:3]:  # Limitar para eficiencia
            total_paths += self.simulate_future(
                new_context,
                option['note'],
                cf_remaining[1:],
                depth - 1
            )

        return total_paths
```

**Por qué importa:** Evita el "valle inquietante" donde la música suena correcta localmente pero carece de dirección. El modelo ahora planifica como un compositor humano.

---

#### 3. Fux Loss: Función de Pérdida Híbrida

**El Problema:** Cross-Entropy solo enseña "predecir la nota correcta". No penaliza explícitamente violaciones teóricas. El modelo puede generar quintas paralelas si estadísticamente son raras pero no imposibles.

**La Solución:** Diseñar una Loss que incorpore las reglas de Fux/Schoenberg como término diferenciable.

```
LOSS TRADICIONAL:
═════════════════

L = CrossEntropy(predicción, nota_correcta)

El modelo solo aprende: "¿acerté la nota?"


FUX LOSS:
═════════

L_total = L_CE + λ · L_rules

Donde:
  L_CE = CrossEntropy(predicción, nota_correcta)

  L_rules = Σ penalizaciones por violación:
    + w₁ · parallel_fifths(predicción, contexto)
    + w₂ · parallel_octaves(predicción, contexto)
    + w₃ · hidden_fifths(predicción, contexto)
    + w₄ · voice_crossing(predicción, contexto)
    + w₅ · tritone(predicción, contexto)
    + w₆ · dissonance(predicción, contexto)
    ...

El modelo aprende: "¿acerté la nota?" + "¿violé alguna regla?"
```

**Implementación:**

```python
class FuxLoss(nn.Module):
    """
    Función de pérdida que penaliza violaciones de contrapunto.

    Hace que el modelo "interiorice" las reglas en sus pesos,
    reduciendo dependencia del validador externo en inferencia.
    """

    def __init__(self, lambda_rules=0.3):
        self.ce_loss = nn.CrossEntropyLoss()
        self.lambda_rules = lambda_rules

        # Pesos por tipo de violación (más grave = más peso)
        self.violation_weights = {
            'parallel_fifths': 2.0,    # Muy grave
            'parallel_octaves': 2.0,   # Muy grave
            'dissonance': 1.5,         # Grave
            'voice_crossing': 1.5,     # Grave
            'hidden_fifths': 0.8,      # Moderado
            'tritone': 1.0,            # Moderado
            'large_leap': 0.5,         # Leve
            'similar_motion': 0.3,     # Sugerencia
        }

    def forward(self, logits, target, context):
        """
        Args:
            logits: predicciones del modelo (batch, num_notes)
            target: nota correcta (batch,)
            context: información del contexto musical
        """
        # Pérdida estándar
        ce = self.ce_loss(logits, target)

        # Pérdida por reglas
        rules_loss = self.compute_rules_loss(logits, context)

        # Combinar
        total = ce + self.lambda_rules * rules_loss

        return total, {
            'ce_loss': ce.item(),
            'rules_loss': rules_loss.item(),
            'total_loss': total.item()
        }

    def compute_rules_loss(self, logits, context):
        """
        Calcula penalización diferenciable por violaciones.

        Truco: usamos las probabilidades (softmax) para hacer
        la pérdida diferenciable. Penalizamos las notas que
        violarían reglas, ponderado por su probabilidad.
        """
        probs = F.softmax(logits, dim=-1)

        total_penalty = 0.0

        for note_idx in range(logits.size(-1)):
            note = idx_to_note(note_idx)
            prob = probs[:, note_idx]

            # Calcular violaciones para esta nota
            violations = self.check_violations(note, context)

            # Penalizar: probabilidad * peso de violación
            for violation_type, occurred in violations.items():
                if occurred:
                    weight = self.violation_weights.get(violation_type, 1.0)
                    total_penalty += prob * weight

        return total_penalty.mean()

    def check_violations(self, note, context):
        """
        Verifica qué reglas violaría esta nota.
        (Wrapper sobre FirstSpeciesValidator)
        """
        return {
            'parallel_fifths': check_parallel_fifths(note, context),
            'parallel_octaves': check_parallel_octaves(note, context),
            'dissonance': check_dissonance(note, context),
            'voice_crossing': check_voice_crossing(note, context),
            'hidden_fifths': check_hidden_fifths(note, context),
            'tritone': check_tritone(note, context),
            'large_leap': check_large_leap(note, context),
            'similar_motion': check_similar_motion(note, context),
        }
```

**Por qué importa:**

1. **Menos dependencia del validador en inferencia** - El modelo ya "sabe" las reglas
2. **Gradientes informativos** - El backprop castiga neuronas que proponen quintas paralelas
3. **Generalización** - El modelo entiende *por qué* algo está mal, no solo *qué* está mal
4. **Eficiencia** - Menos post-procesamiento necesario

---

### Backbone: Mamba (State Space Model)

```
¿Por qué Mamba en lugar de Transformer?

                    Transformer    Mamba
Complejidad:        O(n²)          O(n)
Contexto:           Limitado       "Infinito"
Velocidad:          Base           3-5x más rápido
Memoria:            Alta           Baja
Browser:            Pesado         Viable
```

### Rule-Augmented Head

El componente clave que fusiona conocimiento neural y simbólico:

```python
class RuleAugmentedHead:
    """
    Combina predicciones neurales con scores de reglas.

    P_final(nota) = α·P_neural(nota) + β·score_reglas(nota)

    Donde α y β son pesos aprendibles que el modelo
    ajusta durante entrenamiento.
    """

    def forward(self, neural_logits, context):
        # Obtener scores de reglas (FirstSpeciesValidator)
        rule_scores = self.validator.getValidNotes(
            context.cf_note,
            context.prev_cf,
            context.prev_cp,
            context.key,
            context.mode,
            context.position
        )

        # Convertir a tensor
        rule_logits = scores_to_logits(rule_scores)

        # Fusión aprendible
        combined = self.alpha * neural_logits + self.beta * rule_logits

        return F.softmax(combined, dim=-1)
```

### Arquitectura Completa (Diagrama)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEUROFUX ARCHITECTURE                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         INPUT LAYER                                  │    │
│  │                                                                      │    │
│  │   Horizontal:  [nota_t-3, nota_t-2, nota_t-1, ???, nota_t+1, ...]   │    │
│  │                           ↓                                          │    │
│  │                  Relative Embedding                                  │    │
│  │              (grado, función, intervalo)                            │    │
│  │                                                                      │    │
│  │   Vertical:    [soprano_t, alto_t, tenor_t, bajo_t]                 │    │
│  │                           ↓                                          │    │
│  │               VerticalContextEncoder                                 │    │
│  │                  (Multi-Hot Harmony)                                 │    │
│  │                                                                      │    │
│  └──────────────────────────┬──────────────────────────────────────────┘    │
│                             │                                                │
│                             ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       MAMBA BACKBONE                                 │    │
│  │                                                                      │    │
│  │   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │    │
│  │   │  Mamba   │ →  │  Mamba   │ →  │  Mamba   │ →  │  Mamba   │     │    │
│  │   │ Block 1  │    │ Block 2  │    │ Block 3  │    │ Block N  │     │    │
│  │   └──────────┘    └──────────┘    └──────────┘    └──────────┘     │    │
│  │                                                                      │    │
│  │   • O(n) lineal           • Estado comprimido infinito              │    │
│  │   • 3-5x más rápido       • Viable en browser                       │    │
│  │                                                                      │    │
│  └──────────────────────────┬──────────────────────────────────────────┘    │
│                             │                                                │
│                             ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    RULE-AUGMENTED HEAD                               │    │
│  │                                                                      │    │
│  │   ┌─────────────────┐         ┌─────────────────┐                   │    │
│  │   │  Neural Logits  │         │   Rule Scores   │                   │    │
│  │   │                 │         │                 │                   │    │
│  │   │  Del backbone   │         │  Validator.js   │                   │    │
│  │   │  (aprendido)    │         │  (explícito)    │                   │    │
│  │   └────────┬────────┘         └────────┬────────┘                   │    │
│  │            │                           │                             │    │
│  │            └───────────┬───────────────┘                             │    │
│  │                        ▼                                             │    │
│  │              ┌─────────────────┐                                     │    │
│  │              │ Learned Fusion  │                                     │    │
│  │              │ α·neural + β·rule│                                    │    │
│  │              └────────┬────────┘                                     │    │
│  │                       │                                              │    │
│  └───────────────────────┼──────────────────────────────────────────────┘    │
│                          │                                                   │
│                          ▼                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                 LOOKAHEAD BEAM SEARCH                                │    │
│  │                                                                      │    │
│  │   Top-K candidatos → Simular futuro → Podar callejones → Top-N      │    │
│  │                                                                      │    │
│  │   Ejemplo:                                                           │    │
│  │   G4: score=0.8, futuro=5 opciones ✓ → mantener                     │    │
│  │   A4: score=0.7, futuro=0 opciones ✗ → podar                        │    │
│  │   B4: score=0.9, futuro=4 opciones ✓ → mantener                     │    │
│  │                                                                      │    │
│  └──────────────────────────┬──────────────────────────────────────────┘    │
│                             │                                                │
│                             ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         OUTPUT                                       │    │
│  │                                                                      │    │
│  │   Nota seleccionada + Explicación                                   │    │
│  │                                                                      │    │
│  │   "B4 (90%): sensible→tónica (§11), mov. contrario (§8.I),          │    │
│  │              patrón frecuente en Bach, 4 opciones futuras"          │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                           TRAINING (Fux Loss)                                │
│                                                                              │
│   L_total = L_CrossEntropy + λ · L_Rules                                    │
│                                                                              │
│   L_Rules = Σ P(nota) · peso_violación(nota)                                │
│                                                                              │
│   El modelo INTERIORIZA las reglas durante entrenamiento                    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### Curriculum Learning

El modelo se entrena progresivamente, igual que un estudiante humano:

```
Fase 1: Primera Especie
────────────────────────
- Dataset: corales simplificados a 1:1
- Reglas: FirstSpeciesValidator
- Épocas: hasta convergencia
- Checkpoint: model_species1.pt

Fase 2: Segunda Especie
────────────────────────
- Dataset: corales con notas de paso (2:1)
- Reglas: SecondSpeciesValidator
- Inicializar desde: model_species1.pt
- Fine-tune

... continúa hasta Fase 6 (SATB)
```

### Generación con Constraints

```python
def generate(melody_constraint=None, partial_score=None):
    """
    Genera un coral respetando restricciones.

    Args:
        melody_constraint: Lista de notas fijas para soprano
        partial_score: Coral parcial con algunas notas definidas

    Returns:
        Coral completo + explicaciones por nota
    """

    # Inicializar con constraints o ruido
    if melody_constraint:
        x = initialize_with_melody(melody_constraint)
        frozen_positions = get_melody_positions()
    elif partial_score:
        x = partial_score
        frozen_positions = get_defined_positions()
    else:
        x = sample_noise()
        frozen_positions = []

    # Generar iterativamente
    for position in generation_order:
        if position in frozen_positions:
            continue  # Respetar constraint

        # Predecir
        logits = model(x, position)

        # Muestrear
        note = sample(logits, temperature=0.9)

        # Explicar
        explanation = explain_choice(logits, position)

        x[position] = note

    return x, explanations
```

---

## Integración con Contrapunctus

### Flujo de Usuario

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONTRAPUNCTUS + NEUROFUX                     │
│                                                                  │
│   1. Usuario selecciona ejercicio                               │
│      [Cantus Firmus en Do Mayor - Primera Especie]              │
│                                                                  │
│   2. Usuario escribe contrapunto (parcial o completo)           │
│      CF: C4  D4  E4  F4  E4  D4  C4  C4                        │
│      CP: E4  ??  G4  ??  ??  ??  ??  C5                        │
│                                                                  │
│   3. Validador evalúa en tiempo real                            │
│      ✓ Nota 1: Tercera mayor - consonancia imperfecta          │
│      ✓ Nota 3: Tercera mayor - consonancia imperfecta          │
│      ✓ Nota 8: Octava - final correcto                         │
│                                                                  │
│   4. Usuario pide sugerencia [✨ Sugerir]                       │
│                                                                  │
│   5. NeuroFux genera opciones para huecos                       │
│      Nota 2: F4 (85%) - "tercera, mov. contrario, estilo Bach" │
│              G4 (10%) - "cuarta disonante - evitar"            │
│              A4 (5%)  - "salto grande"                         │
│                                                                  │
│   6. Usuario acepta/rechaza sugerencias                         │
│                                                                  │
│   7. Validación final + puntuación                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### API JavaScript

```javascript
// Integración propuesta
class NeuroFuxAssistant {
    constructor(modelPath) {
        this.model = await loadONNX(modelPath);
        this.validator = FirstSpeciesValidator;  // Ya existe
    }

    async suggest(cantusFirmus, partialCounterpoint, options = {}) {
        const {
            species = 1,
            numSuggestions = 3,
            temperature = 0.9,
            explainDecisions = true
        } = options;

        // Encontrar posiciones vacías
        const emptyPositions = findEmpty(partialCounterpoint);

        const suggestions = [];

        for (const pos of emptyPositions) {
            // Obtener contexto
            const context = buildContext(cantusFirmus, partialCounterpoint, pos);

            // Inferencia neural
            const neuralLogits = await this.model.run(context);

            // Combinar con reglas
            const ruleScores = this.validator.getValidNotes(
                cantusFirmus[pos],
                cantusFirmus[pos - 1],
                partialCounterpoint[pos - 1],
                options.key,
                options.mode,
                options.cpPosition,
                pos === 0,
                pos === cantusFirmus.length - 1
            );

            // Fusionar y rankear
            const candidates = fuseAndRank(neuralLogits, ruleScores);

            // Top N sugerencias con explicaciones
            suggestions.push({
                position: pos,
                options: candidates.slice(0, numSuggestions).map(c => ({
                    note: c.note,
                    confidence: c.score,
                    explanation: explainDecisions ?
                        this.explain(c, context) : null
                }))
            });
        }

        return suggestions;
    }

    explain(candidate, context) {
        const reasons = [];

        // Analizar contribución de reglas
        if (candidate.ruleFactors.cadence > 0.3) {
            reasons.push(`Cadencia correcta (§11 Schoenberg)`);
        }
        if (candidate.ruleFactors.contraryMotion > 0.2) {
            reasons.push(`Movimiento contrario preferido (§8.I)`);
        }
        if (candidate.ruleFactors.stepwise > 0.2) {
            reasons.push(`Grado conjunto (§7l)`);
        }

        // Analizar contribución neural
        if (candidate.neuralScore > 0.5) {
            reasons.push(`Patrón frecuente en Bach`);
        }

        return reasons.join('; ');
    }
}
```

---

## Roadmap Unificado

### Fase I: Contrapunctus Completo

```
COMPLETADO ✓
────────────
• Primera Especie (17 reglas Schoenberg)
• Interfaz interactiva (Canvas)
• SoundFonts (6 instrumentos)
• MusicXML export
• Modal de teoría

EN PROGRESO ○
─────────────
• Fase 2.1: Modo menor completo
• Fase 2.2: Feedback pedagógico mejorado
• Fase 2.3: Guardar/cargar progreso
• Fase 2.4: Tempo ajustable

PENDIENTE □
───────────
• Fase 3: Segunda Especie
  - SecondSpeciesValidator.js
  - UI para blancas (2:1)
  - Detección de notas de paso

• Fase 4: Tercera Especie
  - ThirdSpeciesValidator.js
  - Patrones ornamentales
  - UI para negras (4:1)

• Fase 5: Cuarta Especie
  - FourthSpeciesValidator.js
  - Suspensiones y ligaduras
  - UI para síncopas

• Fase 6: Quinta Especie
  - FifthSpeciesValidator.js
  - Mezcla libre de especies

• Fase 7: Tres Voces
  - ThreeVoiceValidator.js
  - Análisis de tríadas

• Fase 8: Cuatro Voces (SATB)
  - FourVoiceValidator.js
  - Sistema coral completo
```

### Fase II: NeuroFux

```
DISEÑO ◇
────────
• Arquitectura Mamba + Rule Head
• Representación relativa
• Curriculum learning

IMPLEMENTACIÓN □
────────────────
• Preparación de corpus (music21)
• Entrenamiento Fase 1 (primera especie)
• Exportación ONNX
• Integración browser básica

ITERACIÓN □
───────────
• Curriculum: especies 2-5
• Expansión a 3-4 voces
• Diffusion refiner
• Explicabilidad avanzada
```

---

## Métricas de Éxito

### Contrapunctus
- [ ] 100% de reglas de Schoenberg implementadas (todas las especies)
- [ ] Soporte completo para SATB
- [ ] Exportación a todos los formatos principales
- [ ] Tutorial interactivo completo

### NeuroFux
- [ ] Modelo < 10MB para browser
- [ ] Latencia < 100ms por sugerencia
- [ ] Accuracy > 90% en validación de reglas
- [ ] Explicaciones coherentes en > 80% de casos
- [ ] Preferencia humana vs DeepBach en blind test

---

## Referencias

### Teoría Musical
- Fux, J.J. (1725). *Gradus ad Parnassum*
- Schoenberg, A. (1963). *Ejercicios preliminares de contrapunto*
- Jeppesen, K. (1939). *Counterpoint*

### Machine Learning
- Hadjeres, G. et al. (2017). *DeepBach: a Steerable Model for Bach Chorales Generation*
- Huang, C.A. et al. (2018). *Music Transformer*
- Gu, A. & Dao, T. (2023). *Mamba: Linear-Time Sequence Modeling*

### Neuro-Symbolic AI
- Garcez, A. et al. (2019). *Neural-Symbolic Computing*
- Marcus, G. (2020). *The Next Decade in AI*

---

## Licencia

MIT

---

## Autores

Proyecto desarrollado como parte de EigenLab.

---

*"El contrapunto es la base de toda composición."* — J.S. Bach
