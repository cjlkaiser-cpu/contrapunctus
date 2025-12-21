/**
 * Pitch.js - Core pitch representation for Contrapunctus
 *
 * Handles note names, MIDI numbers, frequencies, and octave notation.
 * Uses scientific pitch notation (C4 = middle C = MIDI 60)
 */

const Pitch = {
    // Note names in chromatic order
    NOTE_NAMES: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],

    // Enharmonic equivalents
    ENHARMONICS: {
        'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B',
        'E#': 'F', 'B#': 'C'
    },

    // Diatonic note names (for scale degrees)
    DIATONIC_NAMES: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],

    /**
     * Parse a note string like "C4", "F#5", "Bb3" into components
     * @param {string} noteStr - Note in scientific pitch notation
     * @returns {Object} { name, accidental, octave, midi }
     */
    parse(noteStr) {
        const match = noteStr.match(/^([A-Ga-g])([#b]?)(\d)$/);
        if (!match) {
            throw new Error(`Invalid note format: ${noteStr}`);
        }

        let [, name, accidental, octave] = match;
        name = name.toUpperCase();
        octave = parseInt(octave);

        // Normalize enharmonics for MIDI calculation
        let normalizedName = name + accidental;
        if (this.ENHARMONICS[normalizedName]) {
            normalizedName = this.ENHARMONICS[normalizedName];
        }

        // Calculate MIDI number
        const noteIndex = this.NOTE_NAMES.indexOf(normalizedName.replace('#', '').replace('b', ''));
        let semitone = this.NOTE_NAMES.indexOf(normalizedName);

        // Handle accidentals not in NOTE_NAMES
        if (semitone === -1) {
            const baseIndex = this.NOTE_NAMES.indexOf(name);
            semitone = accidental === '#' ? baseIndex + 1 : baseIndex - 1;
            semitone = (semitone + 12) % 12;
        }

        const midi = (octave + 1) * 12 + semitone;

        return {
            name,
            accidental,
            octave,
            midi,
            fullName: name + accidental + octave
        };
    },

    /**
     * Convert MIDI number to note string
     * @param {number} midi - MIDI note number (0-127)
     * @param {boolean} preferSharps - Use sharps instead of flats
     * @returns {string} Note in scientific pitch notation
     */
    fromMidi(midi, preferSharps = true) {
        const octave = Math.floor(midi / 12) - 1;
        const noteIndex = midi % 12;
        const noteName = this.NOTE_NAMES[noteIndex];
        return noteName + octave;
    },

    /**
     * Get frequency in Hz for a MIDI number (A4 = 440Hz)
     * @param {number} midi - MIDI note number
     * @returns {number} Frequency in Hz
     */
    midiToFreq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    },

    /**
     * Get MIDI number from note string
     * @param {string} noteStr - Note in scientific pitch notation
     * @returns {number} MIDI note number
     */
    toMidi(noteStr) {
        return this.parse(noteStr).midi;
    },

    /**
     * Get the diatonic index (0-6) of a note name
     * C=0, D=1, E=2, F=3, G=4, A=5, B=6
     * @param {string} noteName - Note name without octave (e.g., "C", "F#")
     * @returns {number} Diatonic index 0-6
     */
    diatonicIndex(noteName) {
        const base = noteName.charAt(0).toUpperCase();
        return this.DIATONIC_NAMES.indexOf(base);
    },

    /**
     * Calculate the generic interval between two notes (counting letter names)
     * @param {string} note1 - Lower note
     * @param {string} note2 - Upper note
     * @returns {number} Generic interval (1 = unison, 2 = second, etc.)
     */
    genericInterval(note1, note2) {
        const p1 = this.parse(note1);
        const p2 = this.parse(note2);

        const d1 = this.diatonicIndex(p1.name) + p1.octave * 7;
        const d2 = this.diatonicIndex(p2.name) + p2.octave * 7;

        return Math.abs(d2 - d1) + 1;
    },

    /**
     * Transpose a note by semitones
     * @param {string} noteStr - Original note
     * @param {number} semitones - Semitones to transpose (positive = up)
     * @returns {string} Transposed note
     */
    transpose(noteStr, semitones) {
        const midi = this.toMidi(noteStr) + semitones;
        return this.fromMidi(midi);
    },

    /**
     * Check if note is within vocal range
     * @param {string} noteStr - Note to check
     * @param {string} voice - 'bass', 'tenor', 'alto', 'soprano'
     * @returns {boolean} True if in range
     */
    inVocalRange(noteStr, voice) {
        const midi = this.toMidi(noteStr);
        const ranges = {
            bass:    { low: 40, high: 60 },  // E2 - C4
            tenor:   { low: 48, high: 67 },  // C3 - G4
            alto:    { low: 53, high: 72 },  // F3 - C5
            soprano: { low: 60, high: 79 }   // C4 - G5
        };
        const range = ranges[voice.toLowerCase()];
        return range && midi >= range.low && midi <= range.high;
    },

    /**
     * Get all notes in a range
     * @param {string} low - Lowest note
     * @param {string} high - Highest note
     * @returns {string[]} Array of note strings
     */
    range(low, high) {
        const lowMidi = this.toMidi(low);
        const highMidi = this.toMidi(high);
        const notes = [];

        for (let midi = lowMidi; midi <= highMidi; midi++) {
            notes.push(this.fromMidi(midi));
        }

        return notes;
    }
};

// Export for ES modules or make global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pitch;
}
