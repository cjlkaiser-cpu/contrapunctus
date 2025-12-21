/**
 * CantusFirmus.js - Cantus Firmus storage and management for Contrapunctus
 *
 * The Cantus Firmus (CF) is the "fixed song" - a simple melody in whole notes
 * against which students write counterpoint. This module stores classic CF
 * examples and provides methods to work with them.
 *
 * Based on examples from Fux's "Gradus ad Parnassum" and Schoenberg's
 * "Ejercicios preliminares de contrapunto"
 */

const CantusFirmus = {
    // Collection of cantus firmi organized by key and difficulty
    COLLECTION: {
        // From Fux's Gradus ad Parnassum
        'fux-d-dorian': {
            id: 'fux-d-dorian',
            name: 'Fux - Re Dórico',
            source: 'Gradus ad Parnassum (1725)',
            key: 'D',
            mode: 'dorian',
            notes: ['D4', 'F4', 'E4', 'D4', 'G4', 'F4', 'A4', 'G4', 'F4', 'E4', 'D4'],
            difficulty: 1
        },

        'fux-d-dorian-2': {
            id: 'fux-d-dorian-2',
            name: 'Fux - Re Dórico II',
            source: 'Gradus ad Parnassum (1725)',
            key: 'D',
            mode: 'dorian',
            notes: ['D4', 'A4', 'G4', 'F4', 'E4', 'D4', 'F4', 'E4', 'D4'],
            difficulty: 1
        },

        // Classic major key examples
        'c-major-basic': {
            id: 'c-major-basic',
            name: 'Do Mayor - Básico',
            source: 'Tradicional',
            key: 'C',
            mode: 'major',
            notes: ['C4', 'D4', 'F4', 'E4', 'G4', 'F4', 'E4', 'D4', 'C4'],
            difficulty: 1
        },

        'c-major-extended': {
            id: 'c-major-extended',
            name: 'Do Mayor - Extendido',
            source: 'Tradicional',
            key: 'C',
            mode: 'major',
            notes: ['C4', 'E4', 'D4', 'C4', 'F4', 'E4', 'G4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'],
            difficulty: 2
        },

        'g-major': {
            id: 'g-major',
            name: 'Sol Mayor',
            source: 'Tradicional',
            key: 'G',
            mode: 'major',
            notes: ['G3', 'A3', 'B3', 'G3', 'C4', 'B3', 'A3', 'D4', 'B3', 'A3', 'G3'],
            difficulty: 1
        },

        'f-major': {
            id: 'f-major',
            name: 'Fa Mayor',
            source: 'Tradicional',
            key: 'F',
            mode: 'major',
            notes: ['F3', 'A3', 'G3', 'F3', 'C4', 'Bb3', 'A3', 'G3', 'F3'],
            difficulty: 2
        },

        // Minor key examples
        'a-minor-natural': {
            id: 'a-minor-natural',
            name: 'La Menor Natural',
            source: 'Tradicional',
            key: 'A',
            mode: 'naturalMinor',
            notes: ['A3', 'C4', 'B3', 'A3', 'E4', 'D4', 'C4', 'B3', 'A3'],
            difficulty: 2
        },

        'd-minor': {
            id: 'd-minor',
            name: 'Re Menor',
            source: 'Tradicional',
            key: 'D',
            mode: 'naturalMinor',
            notes: ['D4', 'F4', 'E4', 'D4', 'A4', 'G4', 'F4', 'E4', 'D4'],
            difficulty: 2
        },

        // More challenging CF
        'e-minor-schoenberg': {
            id: 'e-minor-schoenberg',
            name: 'Mi Menor - Schoenberg',
            source: 'Ejercicios preliminares',
            key: 'E',
            mode: 'naturalMinor',
            notes: ['E4', 'G4', 'F#4', 'E4', 'A4', 'G4', 'B4', 'A4', 'G4', 'F#4', 'E4'],
            difficulty: 3
        },

        'b-flat-major': {
            id: 'b-flat-major',
            name: 'Si bemol Mayor',
            source: 'Tradicional',
            key: 'Bb',
            mode: 'major',
            notes: ['Bb3', 'D4', 'C4', 'Bb3', 'F4', 'Eb4', 'D4', 'C4', 'Bb3'],
            difficulty: 3
        }
    },

    /**
     * Get a cantus firmus by ID
     * @param {string} id - CF identifier
     * @returns {Object|null} CF object or null
     */
    get(id) {
        return this.COLLECTION[id] || null;
    },

    /**
     * Get all cantus firmi
     * @returns {Object[]} Array of CF objects
     */
    getAll() {
        return Object.values(this.COLLECTION);
    },

    /**
     * Get cantus firmi filtered by criteria
     * @param {Object} filters - { key, mode, difficulty, source }
     * @returns {Object[]} Filtered CF array
     */
    filter(filters = {}) {
        return this.getAll().filter(cf => {
            if (filters.key && cf.key !== filters.key) return false;
            if (filters.mode && cf.mode !== filters.mode) return false;
            if (filters.difficulty && cf.difficulty > filters.difficulty) return false;
            if (filters.source && !cf.source.includes(filters.source)) return false;
            return true;
        });
    },

    /**
     * Get available keys in collection
     * @returns {string[]} Array of unique keys
     */
    getAvailableKeys() {
        const keys = new Set(this.getAll().map(cf => cf.key));
        return Array.from(keys).sort();
    },

    /**
     * Get range of a cantus firmus
     * @param {string} id - CF identifier
     * @returns {Object} { lowest, highest, range }
     */
    getRange(id) {
        const cf = this.get(id);
        if (!cf) return null;

        const midis = cf.notes.map(n => Pitch.toMidi(n));
        const lowest = Math.min(...midis);
        const highest = Math.max(...midis);

        return {
            lowest: Pitch.fromMidi(lowest),
            highest: Pitch.fromMidi(highest),
            range: highest - lowest
        };
    },

    /**
     * Transpose a cantus firmus to a new key
     * @param {string} id - CF identifier
     * @param {string} newTonic - New tonic note
     * @returns {Object} New CF object with transposed notes
     */
    transpose(id, newTonic) {
        const cf = this.get(id);
        if (!cf) return null;

        const originalTonic = Pitch.toMidi(cf.key + '4');
        const targetTonic = Pitch.toMidi(newTonic + '4');
        const interval = targetTonic - originalTonic;

        const transposedNotes = cf.notes.map(note =>
            Pitch.transpose(note, interval)
        );

        return {
            ...cf,
            id: `${id}-transposed-${newTonic}`,
            key: newTonic,
            notes: transposedNotes,
            originalId: id
        };
    },

    /**
     * Get the climax (highest note) position
     * @param {string} id - CF identifier
     * @returns {Object} { note, position, isUnique }
     */
    getClimax(id) {
        const cf = this.get(id);
        if (!cf) return null;

        const midis = cf.notes.map(n => Pitch.toMidi(n));
        const highest = Math.max(...midis);
        const positions = midis.reduce((acc, m, i) => {
            if (m === highest) acc.push(i);
            return acc;
        }, []);

        return {
            note: Pitch.fromMidi(highest),
            position: positions[0],
            isUnique: positions.length === 1
        };
    },

    /**
     * Validate a cantus firmus according to traditional rules
     * @param {string[]} notes - Array of note strings
     * @param {string} key - Key/tonic
     * @param {string} mode - Scale mode
     * @returns {Object} { valid, errors }
     */
    validate(notes, key, mode = 'major') {
        const errors = [];

        // Rule 1: Must start and end on tonic
        if (!Scale.isTonic(notes[0], key)) {
            errors.push('Debe comenzar en la tónica');
        }
        if (!Scale.isTonic(notes[notes.length - 1], key)) {
            errors.push('Debe terminar en la tónica');
        }

        // Rule 2: All notes must be in the scale
        notes.forEach((note, i) => {
            if (!Scale.containsNote(note, key, mode)) {
                errors.push(`Nota ${i + 1} (${note}) no pertenece a la escala`);
            }
        });

        // Rule 3: Move primarily by step (seconds)
        let leaps = 0;
        for (let i = 1; i < notes.length; i++) {
            const interval = Interval.between(notes[i - 1], notes[i]);
            if (interval.simple.generic > 3) {
                leaps++;
            }
            // No leaps larger than an octave
            if (interval.generic > 8) {
                errors.push(`Salto demasiado grande entre notas ${i} y ${i + 1}`);
            }
        }
        if (leaps > notes.length / 3) {
            errors.push('Demasiados saltos, preferir movimiento por grados conjuntos');
        }

        // Rule 4: Single climax
        const climax = this.getClimax({ notes });
        if (climax && !climax.isUnique) {
            errors.push('El clímax (nota más aguda) debe aparecer una sola vez');
        }

        // Rule 5: No tritones (melodic)
        for (let i = 1; i < notes.length; i++) {
            const interval = Interval.between(notes[i - 1], notes[i]);
            if (Interval.isTritone(interval)) {
                errors.push(`Tritono melódico entre notas ${i} y ${i + 1}`);
            }
        }

        // Rule 6: Penultimate note should be scale degree 2 or 7
        if (notes.length > 2) {
            const penultimate = notes[notes.length - 2];
            const degree = Scale.getDegree(penultimate, key, mode);
            if (degree !== 2 && degree !== 7) {
                errors.push('Penúltima nota debería ser grado 2 o 7 para preparar la cadencia');
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Get difficulty level description
     * @param {number} level - 1, 2, or 3
     * @returns {string} Description
     */
    getDifficultyName(level) {
        const names = {
            1: 'Principiante',
            2: 'Intermedio',
            3: 'Avanzado'
        };
        return names[level] || 'Desconocido';
    },

    /**
     * Add a custom cantus firmus to the collection
     * @param {Object} cf - CF object { id, name, key, mode, notes, difficulty }
     */
    add(cf) {
        if (!cf.id || !cf.notes || !cf.key) {
            throw new Error('CF must have id, notes, and key');
        }
        this.COLLECTION[cf.id] = {
            source: 'Usuario',
            mode: 'major',
            difficulty: 2,
            ...cf
        };
    }
};

// Export for ES modules or make global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CantusFirmus;
}
