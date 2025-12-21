/**
 * Scale.js - Scale and key handling for Contrapunctus
 *
 * Manages major and minor scales, key signatures, and scale degrees.
 * Essential for determining which notes belong to a key in counterpoint.
 */

const Scale = {
    // Scale patterns (semitones from tonic)
    PATTERNS: {
        major:          [0, 2, 4, 5, 7, 9, 11],
        naturalMinor:   [0, 2, 3, 5, 7, 8, 10],
        harmonicMinor:  [0, 2, 3, 5, 7, 8, 11],
        melodicMinor:   [0, 2, 3, 5, 7, 9, 11],  // Ascending
        dorian:         [0, 2, 3, 5, 7, 9, 10],
        phrygian:       [0, 1, 3, 5, 7, 8, 10],
        lydian:         [0, 2, 4, 6, 7, 9, 11],
        mixolydian:     [0, 2, 4, 5, 7, 9, 10],
        aeolian:        [0, 2, 3, 5, 7, 8, 10],  // Same as natural minor
        locrian:        [0, 1, 3, 5, 6, 8, 10]
    },

    // Key signatures (number of sharps/flats)
    KEY_SIGNATURES: {
        // Major keys
        'C':  { sharps: 0, flats: 0 },
        'G':  { sharps: 1, flats: 0, sharpNotes: ['F'] },
        'D':  { sharps: 2, flats: 0, sharpNotes: ['F', 'C'] },
        'A':  { sharps: 3, flats: 0, sharpNotes: ['F', 'C', 'G'] },
        'E':  { sharps: 4, flats: 0, sharpNotes: ['F', 'C', 'G', 'D'] },
        'B':  { sharps: 5, flats: 0, sharpNotes: ['F', 'C', 'G', 'D', 'A'] },
        'F#': { sharps: 6, flats: 0, sharpNotes: ['F', 'C', 'G', 'D', 'A', 'E'] },
        'F':  { sharps: 0, flats: 1, flatNotes: ['B'] },
        'Bb': { sharps: 0, flats: 2, flatNotes: ['B', 'E'] },
        'Eb': { sharps: 0, flats: 3, flatNotes: ['B', 'E', 'A'] },
        'Ab': { sharps: 0, flats: 4, flatNotes: ['B', 'E', 'A', 'D'] },
        'Db': { sharps: 0, flats: 5, flatNotes: ['B', 'E', 'A', 'D', 'G'] },
        'Gb': { sharps: 0, flats: 6, flatNotes: ['B', 'E', 'A', 'D', 'G', 'C'] }
    },

    // Relative minors (offset from major)
    RELATIVE_MINOR_OFFSET: -3,  // Minor is 3 semitones below major

    // Scale degree names
    DEGREE_NAMES: {
        1: 'tónica',
        2: 'supertónica',
        3: 'mediante',
        4: 'subdominante',
        5: 'dominante',
        6: 'superdominante',
        7: 'sensible'
    },

    /**
     * Get scale notes for a given tonic and mode
     * @param {string} tonic - Tonic note (e.g., "C", "F#")
     * @param {string} mode - Scale type (default: 'major')
     * @returns {number[]} Array of MIDI offsets from tonic
     */
    getPattern(mode = 'major') {
        return this.PATTERNS[mode] || this.PATTERNS.major;
    },

    /**
     * Get all notes in a scale within an octave range
     * @param {string} tonic - Tonic note with octave (e.g., "C4")
     * @param {string} mode - Scale type
     * @param {number} octaves - Number of octaves to generate
     * @returns {string[]} Array of note names
     */
    getNotes(tonic, mode = 'major', octaves = 1) {
        const tonicMidi = Pitch.toMidi(tonic);
        const pattern = this.getPattern(mode);
        const notes = [];

        for (let oct = 0; oct < octaves; oct++) {
            for (const offset of pattern) {
                const midi = tonicMidi + offset + (oct * 12);
                notes.push(Pitch.fromMidi(midi));
            }
        }

        // Add final tonic if spanning octaves
        if (octaves > 0) {
            notes.push(Pitch.fromMidi(tonicMidi + octaves * 12));
        }

        return notes;
    },

    /**
     * Check if a note belongs to a scale
     * @param {string} note - Note to check (e.g., "E4")
     * @param {string} tonic - Scale tonic (e.g., "C")
     * @param {string} mode - Scale type
     * @returns {boolean} True if note is in scale
     */
    containsNote(note, tonic, mode = 'major') {
        const noteMidi = Pitch.toMidi(note);
        const tonicMidi = Pitch.toMidi(tonic + '0');  // Use octave 0 for reference
        const pattern = this.getPattern(mode);

        // Get note's position relative to tonic (mod 12)
        const relativePosition = ((noteMidi - tonicMidi) % 12 + 12) % 12;

        return pattern.includes(relativePosition);
    },

    /**
     * Get the scale degree of a note
     * @param {string} note - Note to check
     * @param {string} tonic - Scale tonic
     * @param {string} mode - Scale type
     * @returns {number|null} Scale degree (1-7) or null if not in scale
     */
    getDegree(note, tonic, mode = 'major') {
        const noteMidi = Pitch.toMidi(note);
        const tonicMidi = Pitch.toMidi(tonic + '0');
        const pattern = this.getPattern(mode);

        const relativePosition = ((noteMidi - tonicMidi) % 12 + 12) % 12;
        const degreeIndex = pattern.indexOf(relativePosition);

        return degreeIndex !== -1 ? degreeIndex + 1 : null;
    },

    /**
     * Get the note for a scale degree
     * @param {number} degree - Scale degree (1-7)
     * @param {string} tonic - Scale tonic with octave
     * @param {string} mode - Scale type
     * @returns {string} Note name
     */
    getNotFromDegree(degree, tonic, mode = 'major') {
        const tonicMidi = Pitch.toMidi(tonic);
        const pattern = this.getPattern(mode);
        const offset = pattern[(degree - 1) % 7];
        const octaveAdjust = Math.floor((degree - 1) / 7) * 12;

        return Pitch.fromMidi(tonicMidi + offset + octaveAdjust);
    },

    /**
     * Get relative minor of a major key
     * @param {string} majorKey - Major key tonic (e.g., "C")
     * @returns {string} Relative minor tonic
     */
    relativeMinor(majorKey) {
        const midi = Pitch.toMidi(majorKey + '4');
        return Pitch.fromMidi(midi + this.RELATIVE_MINOR_OFFSET).slice(0, -1);
    },

    /**
     * Get relative major of a minor key
     * @param {string} minorKey - Minor key tonic (e.g., "A")
     * @returns {string} Relative major tonic
     */
    relativeMajor(minorKey) {
        const midi = Pitch.toMidi(minorKey + '4');
        return Pitch.fromMidi(midi - this.RELATIVE_MINOR_OFFSET).slice(0, -1);
    },

    /**
     * Get the leading tone (7th degree) for a key
     * @param {string} tonic - Scale tonic
     * @param {string} mode - Scale type
     * @returns {string} Leading tone note name (without octave)
     */
    getLeadingTone(tonic, mode = 'major') {
        const pattern = this.getPattern(mode);
        const midi = Pitch.toMidi(tonic + '4') + pattern[6];
        return Pitch.fromMidi(midi).slice(0, -1);
    },

    /**
     * Check if note is the leading tone
     * @param {string} note - Note to check
     * @param {string} tonic - Scale tonic
     * @param {string} mode - Scale type
     * @returns {boolean} True if note is leading tone
     */
    isLeadingTone(note, tonic, mode = 'major') {
        return this.getDegree(note, tonic, mode) === 7;
    },

    /**
     * Check if note is the tonic
     * @param {string} note - Note to check
     * @param {string} tonic - Scale tonic
     * @returns {boolean} True if note is tonic
     */
    isTonic(note, tonic) {
        return this.getDegree(note, tonic) === 1;
    },

    /**
     * Get all available keys
     * @returns {string[]} Array of key names
     */
    getAllKeys() {
        return Object.keys(this.KEY_SIGNATURES);
    },

    /**
     * Get diatonic notes within a range for a key
     * @param {string} tonic - Scale tonic
     * @param {string} mode - Scale type
     * @param {string} lowNote - Lowest note of range
     * @param {string} highNote - Highest note of range
     * @returns {string[]} Diatonic notes in range
     */
    getDiatonicRange(tonic, mode, lowNote, highNote) {
        const lowMidi = Pitch.toMidi(lowNote);
        const highMidi = Pitch.toMidi(highNote);
        const notes = [];

        for (let midi = lowMidi; midi <= highMidi; midi++) {
            const note = Pitch.fromMidi(midi);
            if (this.containsNote(note, tonic, mode)) {
                notes.push(note);
            }
        }

        return notes;
    },

    /**
     * Get Spanish name for scale degree
     * @param {number} degree - Scale degree (1-7)
     * @returns {string} Spanish name
     */
    getDegreeName(degree) {
        return this.DEGREE_NAMES[degree] || `grado ${degree}`;
    }
};

// Export for ES modules or make global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Scale;
}
