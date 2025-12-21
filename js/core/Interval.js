/**
 * Interval.js - Interval calculation and classification for Contrapunctus
 *
 * Classifies intervals according to traditional counterpoint theory:
 * - Perfect consonances: unison (P1), fifth (P5), octave (P8)
 * - Imperfect consonances: thirds (m3, M3), sixths (m6, M6)
 * - Dissonances: seconds, fourths, sevenths, all aug/dim
 *
 * Based on Schoenberg's "Ejercicios preliminares de contrapunto"
 */

const Interval = {
    // Interval qualities
    PERFECT: 'P',
    MAJOR: 'M',
    MINOR: 'm',
    AUGMENTED: 'A',
    DIMINISHED: 'd',

    // Semitones for each interval type
    INTERVAL_SEMITONES: {
        1: { 'd': -1, 'P': 0, 'A': 1 },           // Unison
        2: { 'd': 0, 'm': 1, 'M': 2, 'A': 3 },    // Second
        3: { 'd': 2, 'm': 3, 'M': 4, 'A': 5 },    // Third
        4: { 'd': 4, 'P': 5, 'A': 6 },            // Fourth
        5: { 'd': 6, 'P': 7, 'A': 8 },            // Fifth
        6: { 'd': 7, 'm': 8, 'M': 9, 'A': 10 },   // Sixth
        7: { 'd': 9, 'm': 10, 'M': 11, 'A': 12 }, // Seventh
        8: { 'd': 11, 'P': 12, 'A': 13 }          // Octave
    },

    // Reverse lookup: semitones to quality for simple intervals
    SEMITONE_TO_QUALITY: {
        0: { generic: 1, quality: 'P' },   // P1
        1: { generic: 2, quality: 'm' },   // m2
        2: { generic: 2, quality: 'M' },   // M2
        3: { generic: 3, quality: 'm' },   // m3
        4: { generic: 3, quality: 'M' },   // M3
        5: { generic: 4, quality: 'P' },   // P4
        6: { generic: 5, quality: 'd' },   // d5 (tritone)
        7: { generic: 5, quality: 'P' },   // P5
        8: { generic: 6, quality: 'm' },   // m6
        9: { generic: 6, quality: 'M' },   // M6
        10: { generic: 7, quality: 'm' },  // m7
        11: { generic: 7, quality: 'M' },  // M7
        12: { generic: 8, quality: 'P' }   // P8
    },

    /**
     * Calculate interval between two notes
     * @param {string} note1 - Lower note (e.g., "C4")
     * @param {string} note2 - Upper note (e.g., "E4")
     * @returns {Object} { semitones, generic, quality, name, simple, compound }
     */
    between(note1, note2) {
        const midi1 = Pitch.toMidi(note1);
        const midi2 = Pitch.toMidi(note2);

        // Calculate semitones (always positive for interval calculation)
        let semitones = midi2 - midi1;
        const direction = semitones >= 0 ? 1 : -1;
        semitones = Math.abs(semitones);

        // Generic interval from letter names
        const generic = Pitch.genericInterval(note1, note2);

        // Simple interval (reduce compounds)
        const simpleGeneric = ((generic - 1) % 7) + 1;
        const simpleSemitones = semitones % 12;

        // Calculate quality based on semitones and generic interval
        const quality = this.calculateQuality(simpleGeneric, simpleSemitones);

        // Build interval name
        const name = quality + generic;
        const simpleName = quality + simpleGeneric;

        return {
            semitones: semitones * direction,
            generic,
            quality,
            name,
            simple: {
                generic: simpleGeneric,
                semitones: simpleSemitones,
                name: simpleName
            },
            compound: generic > 8,
            direction
        };
    },

    /**
     * Calculate quality from generic interval and semitones
     * @param {number} generic - Generic interval (1-7)
     * @param {number} semitones - Semitones (0-11)
     * @returns {string} Quality (P, M, m, A, d)
     */
    calculateQuality(generic, semitones) {
        // Perfect intervals: 1, 4, 5, 8
        const perfectIntervals = [1, 4, 5, 8];
        const isPerfectType = perfectIntervals.includes(generic);

        // Expected semitones for each generic interval
        const expected = {
            1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11, 8: 12
        };

        const diff = semitones - expected[generic];

        if (isPerfectType) {
            if (diff === 0) return 'P';
            if (diff === 1) return 'A';
            if (diff === -1) return 'd';
            if (diff > 1) return 'A';  // doubly augmented, etc.
            return 'd';  // doubly diminished, etc.
        } else {
            // Major/minor intervals: 2, 3, 6, 7
            if (diff === 0) return 'M';
            if (diff === -1) return 'm';
            if (diff === 1) return 'A';
            if (diff < -1) return 'd';
            return 'A';
        }
    },

    /**
     * Check if interval is consonant (for 2-voice counterpoint)
     * Perfect: P1, P5, P8
     * Imperfect: m3, M3, m6, M6
     * @param {Object|string} interval - Interval object or name
     * @returns {boolean} True if consonant
     */
    isConsonant(interval) {
        const name = typeof interval === 'string' ? interval : interval.simple.name;
        const consonances = ['P1', 'P5', 'P8', 'm3', 'M3', 'm6', 'M6'];
        return consonances.includes(name);
    },

    /**
     * Check if interval is a perfect consonance
     * @param {Object|string} interval - Interval object or name
     * @returns {boolean} True if perfect consonance
     */
    isPerfectConsonance(interval) {
        const name = typeof interval === 'string' ? interval : interval.simple.name;
        return ['P1', 'P5', 'P8'].includes(name);
    },

    /**
     * Check if interval is an imperfect consonance
     * @param {Object|string} interval - Interval object or name
     * @returns {boolean} True if imperfect consonance
     */
    isImperfectConsonance(interval) {
        const name = typeof interval === 'string' ? interval : interval.simple.name;
        return ['m3', 'M3', 'm6', 'M6'].includes(name);
    },

    /**
     * Check if interval is dissonant
     * @param {Object|string} interval - Interval object or name
     * @returns {boolean} True if dissonant
     */
    isDissonant(interval) {
        return !this.isConsonant(interval);
    },

    /**
     * Check if interval is a tritone (augmented 4th / diminished 5th)
     * @param {Object|string} interval - Interval object or name
     * @returns {boolean} True if tritone
     */
    isTritone(interval) {
        if (typeof interval === 'object') {
            return interval.simple.semitones === 6;
        }
        return ['A4', 'd5'].includes(interval);
    },

    /**
     * Get the inversion of an interval
     * @param {Object} interval - Interval object
     * @returns {Object} Inverted interval info
     */
    invert(interval) {
        const simple = interval.simple;

        // Inversion rules
        const invertedGeneric = 9 - simple.generic;
        const invertedSemitones = 12 - simple.semitones;

        // Quality inversion: P<->P, M<->m, A<->d
        const qualityInversion = {
            'P': 'P', 'M': 'm', 'm': 'M', 'A': 'd', 'd': 'A'
        };
        const invertedQuality = qualityInversion[simple.quality] || simple.quality;

        return {
            generic: invertedGeneric,
            semitones: invertedSemitones,
            quality: invertedQuality,
            name: invertedQuality + invertedGeneric
        };
    },

    /**
     * Get consonance type for display
     * @param {Object} interval - Interval object
     * @returns {string} 'perfect', 'imperfect', or 'dissonant'
     */
    consonanceType(interval) {
        if (this.isPerfectConsonance(interval)) return 'perfect';
        if (this.isImperfectConsonance(interval)) return 'imperfect';
        return 'dissonant';
    },

    /**
     * Get Spanish name for interval
     * @param {Object|string} interval - Interval object or name
     * @returns {string} Spanish interval name
     */
    spanishName(interval) {
        const name = typeof interval === 'string' ? interval : interval.name;
        const quality = name.charAt(0);
        const generic = parseInt(name.substring(1));

        const genericNames = {
            1: 'unísono', 2: 'segunda', 3: 'tercera', 4: 'cuarta',
            5: 'quinta', 6: 'sexta', 7: 'séptima', 8: 'octava',
            9: 'novena', 10: 'décima', 11: 'undécima', 12: 'duodécima'
        };

        const qualityNames = {
            'P': 'justa', 'M': 'mayor', 'm': 'menor',
            'A': 'aumentada', 'd': 'disminuida'
        };

        const qualityName = qualityNames[quality] || '';
        const genericName = genericNames[generic] || `${generic}ª`;

        return `${genericName} ${qualityName}`.trim();
    },

    /**
     * Create interval from quality and generic number
     * @param {string} quality - P, M, m, A, d
     * @param {number} generic - 1-8 (or compound)
     * @returns {number} Semitones
     */
    toSemitones(quality, generic) {
        const simpleGeneric = ((generic - 1) % 7) + 1;
        const octaves = Math.floor((generic - 1) / 7);

        const semitones = this.INTERVAL_SEMITONES[simpleGeneric];
        if (!semitones || semitones[quality] === undefined) {
            throw new Error(`Invalid interval: ${quality}${generic}`);
        }

        return semitones[quality] + (octaves * 12);
    }
};

// Export for ES modules or make global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Interval;
}
