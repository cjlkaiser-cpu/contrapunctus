/**
 * SchoenbergExamples.js - Ejemplos comentados del libro de Schoenberg
 *
 * "Ejercicios preliminares de contrapunto" (1963)
 * Primera Especie - Contrapunto Simple a Dos Voces
 *
 * Cada ejemplo incluye:
 * - Cantus Firmus (CF)
 * - Múltiples resoluciones de contrapunto (CP)
 * - Marcas de Schoenberg indicando problemas o advertencias
 * - Comentarios pedagógicos
 */

const SchoenbergExamples = {

    // Leyenda de marcas
    MARKS: {
        '8-8': { symbol: '8—8', name: 'Octavas paralelas', severity: 'error' },
        '5-5': { symbol: '5—5', name: 'Quintas paralelas', severity: 'error' },
        '8oc': { symbol: '\\8', name: 'Octavas ocultas', severity: 'warning' },
        '5oc': { symbol: '/5', name: 'Quintas ocultas', severity: 'warning' },
        'tr': { symbol: 'tr', name: 'Trítono', severity: 'error' },
        '(tr)': { symbol: '(tr)', name: 'Trítono compuesto', severity: 'warning' },
        '(7)': { symbol: '(7)', name: '7ª/9ª/11ª compuesta', severity: 'warning' },
        'salt': { symbol: '↗↗', name: 'Saltos misma dirección', severity: 'warning' },
        'amel': { symbol: '~~~', name: 'Progresión amelódica', severity: 'warning' },
        '6-6': { symbol: '6-6-6', name: 'Sextas paralelas excesivas', severity: 'warning' },
        '3-3': { symbol: '3-3-3', name: 'Terceras paralelas excesivas', severity: 'warning' },
        'mon': { symbol: 'mon.', name: 'Monótono', severity: 'info' },
        'rep': { symbol: 'rep.', name: 'Repetición', severity: 'info' }
    },

    // Colección de ejemplos
    EXAMPLES: {

        // ==================== EJEMPLO 1 ====================
        'ejemplo-1': {
            id: 'ejemplo-1',
            title: 'Ejemplo 1',
            key: 'C',
            mode: 'major',
            page: 34,
            cf: {
                notes: ['C4', 'D4', 'F4', 'E4', 'D4', 'C4'],
                description: 'Do Mayor - 6 notas'
            },
            solutions: [
                {
                    id: 'a',
                    position: 'arriba',
                    intervals: [1, 3, 3, 3, 6, 8],
                    marks: ['salt', '6-6', '3-3'],
                    comment: 'Saltos en misma dirección + terceras y sextas paralelas'
                },
                {
                    id: 'b',
                    position: 'arriba',
                    intervals: [8, 5, 3, 3, 6, 8],
                    marks: [],
                    comment: ''
                },
                {
                    id: 'c',
                    position: 'arriba',
                    intervals: [8, 6, 3, 3, 6, 8],
                    marks: [],
                    comment: ''
                },
                {
                    id: 'd',
                    position: 'arriba',
                    intervals: [8, 5, 6, 6, 6, 8],
                    marks: ['6-6'],
                    comment: '3 sextas consecutivas'
                },
                {
                    id: 'e',
                    position: 'abajo',
                    intervals: [1, 6, 6, 6, 3, 1],
                    marks: ['6-6'],
                    comment: '3 sextas consecutivas'
                },
                {
                    id: 'f',
                    position: 'abajo',
                    intervals: [1, 3, 3, 5, 3, 1],
                    marks: ['3-3'],
                    comment: '3 terceras'
                },
                {
                    id: 'g',
                    position: 'abajo',
                    intervals: [1, 5, 3, 3, 3, 1],
                    marks: ['3-3'],
                    comment: '3 terceras consecutivas'
                },
                {
                    id: 'h',
                    position: 'abajo',
                    intervals: [1, 3, 3, 5, 3, 1],
                    marks: [],
                    comment: ''
                },
                {
                    id: 'i',
                    position: 'arriba',
                    intervals: [8, 6, 3, 6, 6, 8],
                    marks: [],
                    comment: ''
                },
                {
                    id: 'j',
                    position: 'arriba',
                    intervals: [5, 3, 3, 3, 6, 8],
                    marks: ['3-3'],
                    comment: '3 terceras'
                },
                {
                    id: 'k',
                    position: 'arriba',
                    intervals: [3, 8, 5, 3, 6, 8],
                    marks: [],
                    comment: ''
                },
                {
                    id: 'l',
                    position: 'arriba',
                    intervals: [3, 3, 6, 6, 6, 8],
                    marks: ['salt', '6-6', '3-3'],
                    comment: 'Saltos + sextas + terceras paralelas'
                },
                {
                    id: 'm',
                    position: 'abajo',
                    intervals: [8, 6, 6, 6, 3, 1],
                    marks: ['salt', '6-6'],
                    comment: 'Saltos misma dirección + 3 sextas'
                },
                {
                    id: 'n',
                    position: 'abajo',
                    intervals: [8, 6, 3, 5, 3, 1],
                    marks: ['(7)', 'salt'],
                    comment: '7ª compuesta + saltos'
                },
                {
                    id: 'o',
                    position: 'abajo',
                    intervals: [8, 5, 8, 5, 3, 1],
                    marks: ['(tr)'],
                    comment: 'Trítono compuesto'
                },
                {
                    id: 'p',
                    position: 'abajo',
                    intervals: [8, 5, 3, 8, 5, 1],
                    marks: ['(7)', 'salt'],
                    comment: '7ª compuesta + saltos'
                }
            ]
        },

        // ==================== EJEMPLO 2 ====================
        'ejemplo-2': {
            id: 'ejemplo-2',
            title: 'Ejemplo 2',
            key: 'G',
            mode: 'major',
            page: 35,
            cf: {
                notes: ['G3', 'A3', 'C4', 'B3', 'A3', 'G3'],
                description: 'Sol Mayor - 6 notas'
            },
            solutions: [
                {
                    id: 'a',
                    position: 'arriba',
                    intervals: [3, 8, 5, 3, 6, 8],
                    marks: ['mon'],
                    comment: 'Monótono'
                },
                {
                    id: 'b',
                    position: 'arriba',
                    intervals: [3, 3, 6, 6, 6, 8],
                    marks: ['6-6'],
                    comment: '3 sextas consecutivas'
                },
                {
                    id: 'c',
                    position: 'abajo',
                    intervals: [1, 3, 6, 6, 3, 1],
                    marks: [],
                    comment: ''
                },
                {
                    id: 'd',
                    position: 'abajo',
                    intervals: [8, 6, 3, 8, 5, 8],
                    marks: [],
                    comment: ''
                }
            ]
        },

        // ==================== EJEMPLO 3 ====================
        'ejemplo-3': {
            id: 'ejemplo-3',
            title: 'Ejemplo 3',
            key: 'F',
            mode: 'major',
            page: 35,
            cf: {
                notes: ['F3', 'G3', 'Bb3', 'A3', 'G3', 'F3'],
                description: 'Fa Mayor - 6 notas'
            },
            solutions: [
                {
                    id: 'a',
                    position: 'arriba',
                    intervals: [3, 4, 6, 3, 6, 8],
                    marks: ['salt'],
                    comment: 'Demasiados saltos'
                },
                {
                    id: 'b',
                    position: 'abajo',
                    intervals: [1, 6, 6, 3, 3, 1],
                    marks: [],
                    comment: ''
                },
                {
                    id: 'c',
                    position: 'abajo',
                    intervals: [1, 5, 6, 6, 3, 1],
                    marks: [],
                    comment: ''
                }
            ]
        },

        // ==================== EJEMPLO 4 ====================
        'ejemplo-4': {
            id: 'ejemplo-4',
            title: 'Ejemplo 4',
            key: 'C',
            mode: 'major',
            page: 35,
            cf: {
                notes: ['C4', 'E4', 'A4', 'G4', 'E4', 'F4', 'D4', 'C4'],
                description: 'Do Mayor - 8 notas'
            },
            solutions: [
                {
                    id: 'a',
                    position: 'arriba',
                    intervals: [8, 5, 1, 3, 6, 6, 6, 8],
                    marks: ['6-6'],
                    comment: '3 sextas consecutivas'
                },
                {
                    id: 'b',
                    position: 'arriba',
                    intervals: [8, 5, 3, 5, 8, 3, 6, 8],
                    marks: [],
                    comment: ''
                },
                {
                    id: 'c',
                    position: 'arriba',
                    intervals: [8, 3, 3, 3, 6, 3, 6, 8],
                    marks: ['3-3'],
                    comment: '3 terceras consecutivas'
                },
                {
                    id: 'd',
                    position: 'abajo',
                    intervals: [1, 5, 3, 3, 5, 8, 5, 8],
                    marks: ['5oc'],
                    comment: 'Quintas ocultas'
                },
                {
                    id: 'e',
                    position: 'abajo',
                    intervals: [1, 6, 6, 6, 6, 8, 5, 8],
                    marks: ['6-6'],
                    comment: '4 sextas consecutivas'
                },
                {
                    id: 'f',
                    position: 'abajo',
                    intervals: [1, 3, 3, 8, 5, 3, 5, 8],
                    marks: ['5oc'],
                    comment: 'Quintas ocultas'
                },
                {
                    id: 'g',
                    position: 'arriba',
                    intervals: [5, 6, 3, 5, 8, 5, 6, 6],
                    marks: ['5oc'],
                    comment: 'Quintas ocultas'
                },
                {
                    id: 'h',
                    position: 'arriba',
                    intervals: [5, 6, 6, 6, 6, 6, null, null],
                    marks: ['salt'],
                    comment: 'MAL REALIZADO - Ejemplo de qué evitar',
                    isError: true
                }
            ]
        }
    },

    /**
     * Calcula las notas del contrapunto a partir del CF e intervalos
     * Usa cálculo diatónico correcto basado en la escala
     *
     * @param {string[]} cfNotes - Notas del cantus firmus
     * @param {number[]} intervals - Intervalos del contrapunto (1, 3, 5, 6, 8, etc.)
     * @param {string} position - 'arriba' o 'abajo'
     * @param {string} key - Tonalidad (ej: 'C', 'G', 'F')
     * @param {string} mode - Modo (ej: 'major', 'minor')
     * @returns {string[]} Notas del contrapunto
     */
    calculateCPNotes(cfNotes, intervals, position, key, mode = 'major') {
        // Obtener la escala diatónica completa (varias octavas)
        const scaleNotes = this.buildDiatonicScale(key, mode);

        return cfNotes.map((cfNote, i) => {
            const interval = intervals[i];
            if (interval === null || interval === undefined) return null;

            // Encontrar la posición del CF en la escala diatónica
            const cfIndex = this.findNoteInScale(cfNote, scaleNotes);
            if (cfIndex === -1) {
                console.warn(`CF note ${cfNote} not found in scale`);
                return null;
            }

            // Calcular el índice del CP (intervalo - 1 porque unísono = 0 pasos)
            const steps = interval - 1;
            let cpIndex;

            if (position === 'arriba') {
                cpIndex = cfIndex + steps;
            } else {
                cpIndex = cfIndex - steps;
            }

            // Verificar que el índice esté en rango
            if (cpIndex < 0 || cpIndex >= scaleNotes.length) {
                console.warn(`CP index ${cpIndex} out of range for interval ${interval}`);
                return null;
            }

            return scaleNotes[cpIndex];
        });
    },

    /**
     * Construye una escala diatónica extendida (C2-C7) para una tonalidad
     */
    buildDiatonicScale(key, mode = 'major') {
        const notes = [];
        const pattern = mode === 'major'
            ? [0, 2, 4, 5, 7, 9, 11]  // W-W-H-W-W-W-H
            : [0, 2, 3, 5, 7, 8, 10]; // Natural minor

        // Obtener MIDI de la tónica en octava 0
        const tonicMidi = Pitch.toMidi(key + '0');

        // Generar notas desde octava 1 hasta octava 7
        for (let octave = 1; octave <= 7; octave++) {
            for (const offset of pattern) {
                const midi = tonicMidi + (octave * 12) + offset;
                if (midi >= 24 && midi <= 108) { // C1 a C8
                    notes.push(Pitch.fromMidi(midi));
                }
            }
        }

        return notes;
    },

    /**
     * Encuentra una nota en la escala diatónica
     */
    findNoteInScale(noteStr, scaleNotes) {
        const targetMidi = Pitch.toMidi(noteStr);
        return scaleNotes.findIndex(n => Pitch.toMidi(n) === targetMidi);
    },

    /**
     * Obtiene un ejemplo por ID
     */
    get(exampleId) {
        return this.EXAMPLES[exampleId] || null;
    },

    /**
     * Obtiene todos los ejemplos
     */
    getAll() {
        return Object.values(this.EXAMPLES);
    },

    /**
     * Obtiene una solución específica
     */
    getSolution(exampleId, solutionId) {
        const example = this.get(exampleId);
        if (!example) return null;
        return example.solutions.find(s => s.id === solutionId);
    },

    /**
     * Obtiene soluciones con una marca específica
     */
    getSolutionsWithMark(markType) {
        const results = [];
        this.getAll().forEach(example => {
            example.solutions.forEach(solution => {
                if (solution.marks.includes(markType)) {
                    results.push({
                        example: example,
                        solution: solution
                    });
                }
            });
        });
        return results;
    },

    /**
     * Obtiene estadísticas de intervalos usados
     */
    getIntervalStats() {
        const stats = {};
        this.getAll().forEach(example => {
            example.solutions.forEach(solution => {
                solution.intervals.forEach((interval, position) => {
                    if (interval === null) return;

                    const key = `pos_${position}_int_${interval}`;
                    if (!stats[key]) {
                        stats[key] = { position, interval, count: 0 };
                    }
                    stats[key].count++;
                });
            });
        });
        return Object.values(stats);
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SchoenbergExamples;
}
