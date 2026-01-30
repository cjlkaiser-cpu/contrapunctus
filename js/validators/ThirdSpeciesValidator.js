/**
 * ThirdSpeciesValidator.js - Third Species Counterpoint Rules
 *
 * Third Species: Four quarter-notes against each whole-note (4:1 ratio)
 * Based on Schoenberg's "Ejercicios preliminares de contrapunto" §24-§35
 *
 * DATA STRUCTURE:
 * Flat array where counterpoint.length === CF.length * 4 - 3
 * - Indices 0,4,8...  = beat 1 (downbeat, STRONG) → must be consonant
 * - Indices 1,5,9...  = beat 2 (WEAK)
 * - Indices 2,6,10... = beat 3 (SEMI-STRONG) → preferably consonant
 * - Indices 3,7,11... = beat 4 (WEAK)
 * - Last index        = final whole note (always strong/downbeat)
 * - counterpoint[0] === null = anacrusis (3 quarter-rests + entry on beat 4)
 *
 * FORMULAS:
 * §26: Passing tone (nota de paso) — same as 2nd species, weak beats only
 * §29-§32: Cambiata — 5-note pattern spanning 2 measures
 * §33: Strong-beat passing tone — occasionally on beat 3
 *
 * RULES:
 * Inherits from 1st/2nd species + new for third species
 */

const ThirdSpeciesValidator = {
    // Rule identifiers
    RULES: {
        // Inherited from first/second species
        CONSONANCE: 'consonance',
        PASSING_TONE: 'passing-tone',
        PARALLEL_FIFTHS: 'parallel-fifths',
        PARALLEL_OCTAVES: 'parallel-octaves',
        HIDDEN_FIFTHS: 'hidden-fifths',
        HIDDEN_OCTAVES: 'hidden-octaves',
        START_CONSONANCE: 'start-consonance',
        END_CONSONANCE: 'end-consonance',
        VOICE_CROSSING: 'voice-crossing',
        TRITONE: 'tritone',
        COMPOUND_TRITONE: 'compound-tritone',
        PROLONGED_DIRECTION: 'prolonged-direction',
        ARPEGGIO: 'arpeggio',
        UNISON: 'unison',
        MOTION_TYPE: 'motion-type',
        STEPWISE: 'stepwise',

        // New for third species
        CAMBIATA: 'cambiata',
        PASSING_TONE_STRONG: 'passing-tone-strong',
        CADENCE_THIRD_SPECIES: 'cadence-third-species',
        BEAT_THREE_CONSONANCE: 'beat-three-consonance',
        NOTE_REPETITION: 'note-repetition'
    },

    // Severity levels
    SEVERITY: {
        ERROR: 'error',
        WARNING: 'warning',
        SUGGESTION: 'suggestion'
    },

    // =========================================================================
    // POSITION HELPERS
    // =========================================================================

    /**
     * Get the CF measure index for a given CP index
     */
    getMeasureIndex(cpIndex) {
        return Math.floor(cpIndex / 4);
    },

    /**
     * Get the beat number (1-4) within a measure
     */
    getBeatInMeasure(cpIndex) {
        return (cpIndex % 4) + 1;
    },

    /**
     * Check if a CP index falls on a downbeat (beat 1)
     * Also true for the last index (final whole note)
     */
    isDownbeat(cpIndex, cpLen) {
        return cpIndex % 4 === 0 || cpIndex === cpLen - 1;
    },

    /**
     * Check if a CP index falls on a semi-strong beat (beat 3)
     * Not true for the last index
     */
    isSemiStrong(cpIndex, cpLen) {
        return cpIndex % 4 === 2 && cpIndex !== cpLen - 1;
    },

    /**
     * Check if a CP index falls on a weak beat (beat 2 or 4)
     * Not true for the last index
     */
    isWeakBeat(cpIndex, cpLen) {
        const beat = cpIndex % 4;
        return (beat === 1 || beat === 3) && cpIndex !== cpLen - 1;
    },

    /**
     * Get the CF note corresponding to a CP index
     */
    getCFNote(cpIndex, cf) {
        return cf[this.getMeasureIndex(cpIndex)];
    },

    /**
     * Get all downbeat indices (beat 1 positions + last)
     */
    getDownbeatIndices(cpLen) {
        const indices = [];
        for (let i = 0; i < cpLen; i++) {
            if (this.isDownbeat(i, cpLen)) {
                indices.push(i);
            }
        }
        return indices;
    },

    /**
     * Get all sounding (non-null) notes from the counterpoint
     */
    getSoundingNotes(counterpoint) {
        const notes = [];
        for (let i = 0; i < counterpoint.length; i++) {
            if (counterpoint[i] !== null) {
                notes.push({ note: counterpoint[i], index: i });
            }
        }
        return notes;
    },

    // =========================================================================
    // MOTION TYPE
    // =========================================================================

    getMotionType(cf1, cf2, cp1, cp2) {
        const cfDirection = Math.sign(Pitch.toMidi(cf2) - Pitch.toMidi(cf1));
        const cpDirection = Math.sign(Pitch.toMidi(cp2) - Pitch.toMidi(cp1));

        if (cfDirection === 0 && cpDirection === 0) return 'stationary';
        if (cfDirection === 0 || cpDirection === 0) return 'oblique';
        if (cfDirection === cpDirection) return 'similar';
        return 'contrary';
    },

    // =========================================================================
    // FORMULA DETECTION
    // =========================================================================

    /**
     * Check if a note is a valid passing tone (§26)
     *
     * Requirements:
     * 1. Must be on a weak beat (beat 2 or 4)
     * 2. Stepwise motion from previous note
     * 3. Stepwise motion to next note
     * 4. Same direction (ascending or descending throughout)
     * 5. Previous and next notes consonant with CF
     */
    isPassingTone(cpIndex, counterpoint, cf, cpPosition) {
        const cpLen = counterpoint.length;

        // Must be a weak beat
        if (!this.isWeakBeat(cpIndex, cpLen)) {
            return { valid: false, reason: 'No es tiempo débil' };
        }

        const current = counterpoint[cpIndex];
        if (current === null) {
            return { valid: false, reason: 'Silencio, no nota de paso' };
        }

        // Previous note
        const prevIndex = cpIndex - 1;
        if (prevIndex < 0) {
            return { valid: false, reason: 'No hay nota anterior' };
        }
        const prev = counterpoint[prevIndex];
        if (prev === null) {
            return { valid: false, reason: 'Nota anterior es silencio' };
        }

        // Next note
        const nextIndex = cpIndex + 1;
        if (nextIndex >= cpLen) {
            return { valid: false, reason: 'No hay nota siguiente' };
        }
        const next = counterpoint[nextIndex];
        if (next === null) {
            return { valid: false, reason: 'Nota siguiente es nula' };
        }

        // Check stepwise motion prev → current
        const intervalPrevCurr = Interval.between(prev, current);
        if (intervalPrevCurr.simple.generic > 2) {
            return { valid: false, reason: 'No hay grado conjunto desde la nota anterior' };
        }

        // Check stepwise motion current → next
        const intervalCurrNext = Interval.between(current, next);
        if (intervalCurrNext.simple.generic > 2) {
            return { valid: false, reason: 'No hay grado conjunto hacia la nota siguiente' };
        }

        // Check same direction
        const dir1 = Math.sign(Pitch.toMidi(current) - Pitch.toMidi(prev));
        const dir2 = Math.sign(Pitch.toMidi(next) - Pitch.toMidi(current));

        if (dir1 === 0 || dir2 === 0) {
            return { valid: false, reason: 'Repetición de nota, no movimiento de escala' };
        }

        if (dir1 !== dir2) {
            return { valid: false, reason: 'Cambio de dirección: no es nota de paso' };
        }

        // Check that prev is consonant with its CF
        const prevCF = this.getCFNote(prevIndex, cf);
        const prevInterval = Interval.between(
            cpPosition === 'upper' ? prevCF : prev,
            cpPosition === 'upper' ? prev : prevCF
        );
        if (Interval.isDissonant(prevInterval)) {
            return { valid: false, reason: 'Nota anterior no es consonante con el CF' };
        }

        // Check that next is consonant with its CF
        const nextCF = this.getCFNote(nextIndex, cf);
        const nextInterval = Interval.between(
            cpPosition === 'upper' ? nextCF : next,
            cpPosition === 'upper' ? next : nextCF
        );
        if (Interval.isDissonant(nextInterval)) {
            return { valid: false, reason: 'Nota siguiente no es consonante con el CF' };
        }

        return { valid: true, reason: 'Nota de paso válida' };
    },

    /**
     * Check if a note is part of a valid cambiata pattern (§29-§32)
     *
     * The cambiata is a 5-note pattern spanning 2 measures:
     * Descending: N1 → step down N2 → 3rd down N3 → step up N4 → step up N5
     * Ascending:  N1 → step up N2 → 3rd up N3 → step down N4 → step down N5
     *
     * N1 and N5 must be consonant with CF
     * N2 can be dissonant (the "changed" note)
     * §32: Exclude if N5 forms a diminished 5th with CF
     *
     * @returns {{ valid: boolean, reason: string, notePosition: number }}
     *   notePosition: which note in the pattern (2, 3, or 4) this cpIndex is
     */
    isCambiata(cpIndex, counterpoint, cf, cpPosition) {
        const cpLen = counterpoint.length;
        const current = counterpoint[cpIndex];
        if (current === null) {
            return { valid: false, reason: 'Silencio' };
        }

        // Try to find a cambiata pattern where cpIndex is note 2, 3, or 4
        // (those are the potentially dissonant notes)

        // Try cpIndex as N2 (the "changed" note)
        if (this._checkCambiataAt(cpIndex - 1, counterpoint, cf, cpPosition, cpLen)) {
            return { valid: true, reason: 'Nota 2 de cambiata válida', notePosition: 2 };
        }

        // Try cpIndex as N3 (after the 3rd leap)
        if (this._checkCambiataAt(cpIndex - 2, counterpoint, cf, cpPosition, cpLen)) {
            return { valid: true, reason: 'Nota 3 de cambiata válida', notePosition: 3 };
        }

        // Try cpIndex as N4
        if (this._checkCambiataAt(cpIndex - 3, counterpoint, cf, cpPosition, cpLen)) {
            return { valid: true, reason: 'Nota 4 de cambiata válida', notePosition: 4 };
        }

        return { valid: false, reason: 'No es parte de una cambiata válida' };
    },

    /**
     * Check if a valid cambiata pattern starts at startIndex
     * @private
     */
    _checkCambiataAt(startIndex, counterpoint, cf, cpPosition, cpLen) {
        // Need 5 consecutive notes starting at startIndex
        if (startIndex < 0 || startIndex + 4 >= cpLen) return false;

        const n1 = counterpoint[startIndex];
        const n2 = counterpoint[startIndex + 1];
        const n3 = counterpoint[startIndex + 2];
        const n4 = counterpoint[startIndex + 3];
        const n5 = counterpoint[startIndex + 4];

        // All must be sounding notes
        if (!n1 || !n2 || !n3 || !n4 || !n5) return false;

        const m1 = Pitch.toMidi(n1);
        const m2 = Pitch.toMidi(n2);
        const m3 = Pitch.toMidi(n3);
        const m4 = Pitch.toMidi(n4);
        const m5 = Pitch.toMidi(n5);

        // Check intervals using diatonic (generic) intervals
        const int12 = Interval.between(n1, n2);
        const int23 = Interval.between(n2, n3);
        const int34 = Interval.between(n3, n4);
        const int45 = Interval.between(n4, n5);

        // Direction of first step determines form
        const dir1 = Math.sign(m2 - m1);
        if (dir1 === 0) return false;

        // Check descending cambiata: step down, 3rd down, step up, step up
        if (dir1 < 0) {
            // N1→N2: step down (generic 2nd)
            if (int12.simple.generic !== 2 || m2 >= m1) return false;
            // N2→N3: 3rd down (generic 3rd)
            if (int23.simple.generic !== 3 || m3 >= m2) return false;
            // N3→N4: step up (generic 2nd)
            if (int34.simple.generic !== 2 || m4 <= m3) return false;
            // N4→N5: step up (generic 2nd)
            if (int45.simple.generic !== 2 || m5 <= m4) return false;
        }

        // Check ascending cambiata: step up, 3rd up, step down, step down
        if (dir1 > 0) {
            // N1→N2: step up (generic 2nd)
            if (int12.simple.generic !== 2 || m2 <= m1) return false;
            // N2→N3: 3rd up (generic 3rd)
            if (int23.simple.generic !== 3 || m3 <= m2) return false;
            // N3→N4: step down (generic 2nd)
            if (int34.simple.generic !== 2 || m4 >= m3) return false;
            // N4→N5: step down (generic 2nd)
            if (int45.simple.generic !== 2 || m5 >= m4) return false;
        }

        // N1 must be consonant with its CF
        const cf1 = this.getCFNote(startIndex, cf);
        const interval1 = Interval.between(
            cpPosition === 'upper' ? cf1 : n1,
            cpPosition === 'upper' ? n1 : cf1
        );
        if (Interval.isDissonant(interval1)) return false;

        // N5 must be consonant with its CF
        const cf5 = this.getCFNote(startIndex + 4, cf);
        const interval5 = Interval.between(
            cpPosition === 'upper' ? cf5 : n5,
            cpPosition === 'upper' ? n5 : cf5
        );
        if (Interval.isDissonant(interval5)) return false;

        // §32: Exclude if N5 is a diminished 5th with CF
        if (Interval.isTritone(interval5)) return false;

        return true;
    },

    /**
     * Check if a note is a valid strong-beat passing tone (§33)
     *
     * Requirements:
     * 1. Only on beat 3 (semi-strong) — NOT beat 1
     * 2. Center of a 3rd interval (prev and next form a 3rd)
     * 3. Stepwise motion from prev and to next
     * 4. Prev and next consonant with CF
     */
    isStrongBeatPassingTone(cpIndex, counterpoint, cf, cpPosition) {
        const cpLen = counterpoint.length;

        // Must be on beat 3 (semi-strong)
        if (!this.isSemiStrong(cpIndex, cpLen)) {
            return { valid: false, reason: 'No es tiempo 3 (semi-fuerte)' };
        }

        const current = counterpoint[cpIndex];
        if (current === null) {
            return { valid: false, reason: 'Silencio' };
        }

        // Previous note
        const prevIndex = cpIndex - 1;
        if (prevIndex < 0) return { valid: false, reason: 'No hay nota anterior' };
        const prev = counterpoint[prevIndex];
        if (prev === null) return { valid: false, reason: 'Nota anterior es silencio' };

        // Next note
        const nextIndex = cpIndex + 1;
        if (nextIndex >= cpLen) return { valid: false, reason: 'No hay nota siguiente' };
        const next = counterpoint[nextIndex];
        if (next === null) return { valid: false, reason: 'Nota siguiente es nula' };

        // Stepwise from prev
        const intPrev = Interval.between(prev, current);
        if (intPrev.simple.generic > 2) {
            return { valid: false, reason: 'No hay grado conjunto desde la nota anterior' };
        }

        // Stepwise to next
        const intNext = Interval.between(current, next);
        if (intNext.simple.generic > 2) {
            return { valid: false, reason: 'No hay grado conjunto hacia la nota siguiente' };
        }

        // Same direction (must be ascending or descending through)
        const dir1 = Math.sign(Pitch.toMidi(current) - Pitch.toMidi(prev));
        const dir2 = Math.sign(Pitch.toMidi(next) - Pitch.toMidi(current));
        if (dir1 === 0 || dir2 === 0 || dir1 !== dir2) {
            return { valid: false, reason: 'No es movimiento escalar continuo' };
        }

        // Prev and next form a 3rd (center of a 3rd)
        const intPrevNext = Interval.between(prev, next);
        if (intPrevNext.simple.generic !== 3) {
            return { valid: false, reason: 'No es el centro de un intervalo de 3ª' };
        }

        // Prev consonant with CF
        const prevCF = this.getCFNote(prevIndex, cf);
        const prevInterval = Interval.between(
            cpPosition === 'upper' ? prevCF : prev,
            cpPosition === 'upper' ? prev : prevCF
        );
        if (Interval.isDissonant(prevInterval)) {
            return { valid: false, reason: 'Nota anterior no es consonante con el CF' };
        }

        // Next consonant with CF
        const nextCF = this.getCFNote(nextIndex, cf);
        const nextInterval = Interval.between(
            cpPosition === 'upper' ? nextCF : next,
            cpPosition === 'upper' ? next : nextCF
        );
        if (Interval.isDissonant(nextInterval)) {
            return { valid: false, reason: 'Nota siguiente no es consonante con el CF' };
        }

        return { valid: true, reason: 'Nota de paso en tiempo fuerte válida (§33)' };
    },

    /**
     * Classify a dissonance: determine if it's a valid formula or an error
     */
    classifyDissonance(cpIndex, counterpoint, cf, cpPosition) {
        const cpLen = counterpoint.length;

        // Beat 1 (downbeat): dissonance ALWAYS invalid
        if (this.isDownbeat(cpIndex, cpLen)) {
            return { type: 'invalid', valid: false, reason: 'Disonancia en tiempo 1 (fuerte) — prohibida' };
        }

        // Beat 3 (semi-strong): try strong-beat passing tone
        if (this.isSemiStrong(cpIndex, cpLen)) {
            const spt = this.isStrongBeatPassingTone(cpIndex, counterpoint, cf, cpPosition);
            if (spt.valid) {
                return { type: 'strong-passing-tone', valid: true, reason: spt.reason };
            }
            // Also check cambiata (a note at beat 3 could be part of a cambiata)
            const cam = this.isCambiata(cpIndex, counterpoint, cf, cpPosition);
            if (cam.valid) {
                return { type: 'cambiata', valid: true, reason: cam.reason };
            }
            return { type: 'invalid', valid: false, reason: 'Disonancia en tiempo 3 no es nota de paso válida ni cambiata' };
        }

        // Beat 2 or 4 (weak): try passing tone → cambiata → invalid
        if (this.isWeakBeat(cpIndex, cpLen)) {
            const pt = this.isPassingTone(cpIndex, counterpoint, cf, cpPosition);
            if (pt.valid) {
                return { type: 'passing-tone', valid: true, reason: pt.reason };
            }

            const cam = this.isCambiata(cpIndex, counterpoint, cf, cpPosition);
            if (cam.valid) {
                return { type: 'cambiata', valid: true, reason: cam.reason };
            }

            return { type: 'invalid', valid: false, reason: `Disonancia en tiempo débil no es nota de paso ni cambiata. ${pt.reason}` };
        }

        return { type: 'invalid', valid: false, reason: 'Posición no reconocida' };
    },

    // =========================================================================
    // MAIN VALIDATION
    // =========================================================================

    /**
     * Validate a complete third species exercise
     */
    validate(exercise) {
        const { cantusFirmus, counterpoint, key, mode = 'major', cpPosition = 'upper' } = exercise;
        const results = {
            valid: true,
            score: 100,
            errors: [],
            warnings: [],
            suggestions: [],
            noteResults: []
        };

        const cfLen = cantusFirmus.length;
        const cpLen = counterpoint.length;
        const expectedCpLen = cfLen * 4 - 3;

        // Verify length
        if (cpLen !== expectedCpLen) {
            results.errors.push({
                rule: 'LENGTH',
                message: `Longitud incorrecta: el contrapunto debe tener ${expectedCpLen} notas (4×${cfLen}−3), tiene ${cpLen}.`,
                severity: this.SEVERITY.ERROR
            });
            results.valid = false;
            return results;
        }

        // Initialize per-note results
        for (let i = 0; i < cpLen; i++) {
            results.noteResults[i] = { valid: true, issues: [] };
        }

        // Check anacrusis validity
        this.checkAnacrusis(counterpoint, cpLen, results);

        // =====================================================================
        // PER-NOTE CHECKS
        // =====================================================================
        const sounding = this.getSoundingNotes(counterpoint);

        for (let i = 0; i < cpLen; i++) {
            const cp = counterpoint[i];

            // Skip null (anacrusis silence)
            if (cp === null) continue;

            const cfNote = this.getCFNote(i, cantusFirmus);
            const interval = Interval.between(
                cpPosition === 'upper' ? cfNote : cp,
                cpPosition === 'upper' ? cp : cfNote
            );

            // --- Downbeat checks (beat 1) ---
            if (this.isDownbeat(i, cpLen)) {
                this.checkDownbeatConsonance(interval, i, results);
                this.checkUnison(interval, i, cpLen, counterpoint, results);
            }

            // --- Semi-strong beat checks (beat 3) ---
            if (this.isSemiStrong(i, cpLen)) {
                this.checkBeatThreeConsonance(interval, i, counterpoint, cantusFirmus, cpPosition, results);
            }

            // --- Weak beat checks (beat 2, 4) ---
            if (this.isWeakBeat(i, cpLen)) {
                this.checkWeakBeatDissonance(interval, i, counterpoint, cantusFirmus, cpPosition, results);
            }

            // --- All notes: voice crossing ---
            this.checkVoiceCrossing(cfNote, cp, cpPosition, i, results);
        }

        // =====================================================================
        // CONSECUTIVE NOTE CHECKS (melodic)
        // =====================================================================
        for (let si = 1; si < sounding.length; si++) {
            const prevEntry = sounding[si - 1];
            const currEntry = sounding[si];

            // Melodic tritone
            this.checkMelodicTritone(prevEntry.note, currEntry.note, currEntry.index, results);
        }

        // =====================================================================
        // DOWNBEAT-TO-DOWNBEAT CHECKS (first species rules between beat 1s)
        // =====================================================================
        this.checkDownbeatParallels(cantusFirmus, counterpoint, cpPosition, cpLen, results);
        this.checkDownbeatHiddenParallels(cantusFirmus, counterpoint, cpPosition, cpLen, results);
        this.checkDownbeatMotion(cantusFirmus, counterpoint, cpPosition, cpLen, results);

        // =====================================================================
        // STRUCTURAL CHECKS
        // =====================================================================
        this.checkStartInterval(cantusFirmus, counterpoint, cpPosition, results);
        this.checkEndInterval(cantusFirmus, counterpoint, cpPosition, cpLen, results);
        this.checkLastNoteWhole(cpLen, results);
        this.checkCadence(cantusFirmus, counterpoint, key, mode, cpPosition, cpLen, results);

        // =====================================================================
        // GLOBAL MELODIC CHECKS
        // =====================================================================
        const soundingNotes = sounding.map(s => s.note);

        this.checkCompoundTritones(soundingNotes, sounding, key, mode, results);
        this.checkProlongedDirection(soundingNotes, sounding, results);
        this.checkArpeggios(soundingNotes, sounding, key, mode, results);
        this.checkNoteRepetition(sounding, results);

        // =====================================================================
        // SCORE
        // =====================================================================
        results.score = this.calculateScore(results);
        results.valid = results.errors.length === 0;

        return results;
    },

    // =========================================================================
    // INDIVIDUAL RULE CHECKS
    // =========================================================================

    /**
     * Check anacrusis validity: in 3rd species, first 3 positions can be null
     * (3 quarter-rests + entry on beat 4)
     */
    checkAnacrusis(counterpoint, cpLen, results) {
        const hasAnacrusis = counterpoint[0] === null;

        if (hasAnacrusis) {
            // In anacrusis mode, positions 0,1,2 should be null, position 3 should be a note
            for (let i = 0; i < Math.min(3, cpLen); i++) {
                if (counterpoint[i] !== null) {
                    // Partial anacrusis — not strictly an error, but unusual
                    // Allow it as long as null only appears in first 3 positions
                }
            }
        }

        // No null allowed after position 3 (or 0 if no anacrusis)
        const startCheck = hasAnacrusis ? 3 : 0;
        for (let i = startCheck; i < cpLen; i++) {
            if (counterpoint[i] === null) {
                const issue = {
                    rule: this.RULES.UNISON, // reuse, as there's no specific anacrusis rule
                    position: i,
                    message: `Nota ${i + 1}: Silencio no permitido en esta posición.`,
                    severity: this.SEVERITY.ERROR
                };
                results.errors.push(issue);
                results.noteResults[i].valid = false;
                results.noteResults[i].issues.push(issue);
            }
        }
    },

    /**
     * Downbeat (beat 1) must be consonant — §24
     */
    checkDownbeatConsonance(interval, position, results) {
        if (Interval.isDissonant(interval)) {
            const issue = {
                rule: this.RULES.CONSONANCE,
                position,
                message: `Nota ${position + 1} (t1, tiempo fuerte): ${Interval.spanishName(interval)} es disonante. Los tiempos fuertes deben ser consonantes.`,
                severity: this.SEVERITY.ERROR,
                interval: interval.name
            };
            results.errors.push(issue);
            results.noteResults[position].valid = false;
            results.noteResults[position].issues.push(issue);
        }
    },

    /**
     * Beat 3 (semi-strong) — preferably consonant (§24, §33)
     * If dissonant, must be a valid strong-beat passing tone or cambiata
     */
    checkBeatThreeConsonance(interval, position, counterpoint, cf, cpPosition, results) {
        if (!Interval.isDissonant(interval)) return; // consonant = fine

        // Dissonant on beat 3: classify it
        const classification = this.classifyDissonance(position, counterpoint, cf, cpPosition);

        if (!classification.valid) {
            const issue = {
                rule: this.RULES.BEAT_THREE_CONSONANCE,
                position,
                message: `Nota ${position + 1} (t3, semi-fuerte): ${Interval.spanishName(interval)} es disonante y no es nota de paso válida en tiempo fuerte. ${classification.reason}.`,
                severity: this.SEVERITY.ERROR,
                interval: interval.name
            };
            results.errors.push(issue);
            results.noteResults[position].valid = false;
            results.noteResults[position].issues.push(issue);
        } else {
            // Valid but worth noting
            const issue = {
                rule: this.RULES.PASSING_TONE_STRONG,
                position,
                message: `Nota ${position + 1} (t3): ${classification.reason}. Disonancia permitida como ${classification.type === 'cambiata' ? 'cambiata' : 'nota de paso en tiempo fuerte (§33)'}.`,
                severity: this.SEVERITY.SUGGESTION,
                interval: interval.name
            };
            results.suggestions.push(issue);
            results.noteResults[position].issues.push(issue);
        }
    },

    /**
     * Weak beat (beat 2, 4) dissonance must be passing tone or cambiata — §26, §29
     */
    checkWeakBeatDissonance(interval, position, counterpoint, cf, cpPosition, results) {
        if (!Interval.isDissonant(interval)) return; // consonant on weak beat = free

        const classification = this.classifyDissonance(position, counterpoint, cf, cpPosition);

        if (!classification.valid) {
            const issue = {
                rule: this.RULES.PASSING_TONE,
                position,
                message: `Nota ${position + 1} (tiempo débil): ${Interval.spanishName(interval)} es disonante pero no es nota de paso ni cambiata válida. ${classification.reason}.`,
                severity: this.SEVERITY.ERROR,
                interval: interval.name
            };
            results.errors.push(issue);
            results.noteResults[position].valid = false;
            results.noteResults[position].issues.push(issue);
        }
    },

    /**
     * Unison only at beginning and end
     */
    checkUnison(interval, position, cpLen, counterpoint, results) {
        if (interval.simple.name !== 'P1') return;

        // Determine if this is the first sounding note or the last note
        const firstSounding = this._getFirstSoundingIndex(counterpoint);
        const isFirst = position === firstSounding;
        const isLast = position === cpLen - 1;

        if (!isFirst && !isLast) {
            const issue = {
                rule: this.RULES.UNISON,
                position,
                message: `Nota ${position + 1}: Unísono solo permitido al inicio o final.`,
                severity: this.SEVERITY.ERROR
            };
            results.errors.push(issue);
            results.noteResults[position].valid = false;
            results.noteResults[position].issues.push(issue);
        }
    },

    _getFirstSoundingIndex(counterpoint) {
        for (let i = 0; i < counterpoint.length; i++) {
            if (counterpoint[i] !== null) return i;
        }
        return 0;
    },

    /**
     * No voice crossing at any point
     */
    checkVoiceCrossing(cf, cp, cpPosition, position, results) {
        const cfMidi = Pitch.toMidi(cf);
        const cpMidi = Pitch.toMidi(cp);

        const crossed = (cpPosition === 'upper' && cpMidi < cfMidi) ||
                        (cpPosition === 'lower' && cpMidi > cfMidi);

        if (crossed) {
            const issue = {
                rule: this.RULES.VOICE_CROSSING,
                position,
                message: `Nota ${position + 1}: Cruce de voces. El contrapunto ${cpPosition === 'upper' ? 'superior' : 'inferior'} cruza al cantus firmus.`,
                severity: this.SEVERITY.ERROR
            };
            results.errors.push(issue);
            results.noteResults[position].valid = false;
            results.noteResults[position].issues.push(issue);
        }
    },

    /**
     * Melodic tritone between consecutive sounding notes
     */
    checkMelodicTritone(prevNote, currNote, position, results) {
        const interval = Interval.between(prevNote, currNote);
        if (Interval.isTritone(interval)) {
            const issue = {
                rule: this.RULES.TRITONE,
                position,
                message: `Nota ${position + 1}: Tritono melódico prohibido (${Interval.spanishName(interval)}).`,
                severity: this.SEVERITY.ERROR
            };
            results.errors.push(issue);
            results.noteResults[position].valid = false;
            results.noteResults[position].issues.push(issue);
        }
    },

    // =========================================================================
    // DOWNBEAT-TO-DOWNBEAT CHECKS
    // =========================================================================

    /**
     * Check parallel fifths/octaves between consecutive downbeats
     */
    checkDownbeatParallels(cf, counterpoint, cpPosition, cpLen, results) {
        const downbeats = this.getDownbeatIndices(cpLen);

        for (let di = 1; di < downbeats.length; di++) {
            const prevIdx = downbeats[di - 1];
            const currIdx = downbeats[di];

            const prevCp = counterpoint[prevIdx];
            const currCp = counterpoint[currIdx];

            if (prevCp === null || currCp === null) continue;

            const prevCF = this.getCFNote(prevIdx, cf);
            const currCF = this.getCFNote(currIdx, cf);

            const prevInterval = Interval.between(
                cpPosition === 'upper' ? prevCF : prevCp,
                cpPosition === 'upper' ? prevCp : prevCF
            );
            const currInterval = Interval.between(
                cpPosition === 'upper' ? currCF : currCp,
                cpPosition === 'upper' ? currCp : currCF
            );

            const motion = this.getMotionType(prevCF, currCF, prevCp, currCp);

            const prevPerfect = Interval.isPerfectConsonance(prevInterval) && prevInterval.simple.name !== 'P1';
            const currPerfect = Interval.isPerfectConsonance(currInterval) && currInterval.simple.name !== 'P1';

            if (prevPerfect && currPerfect &&
                prevInterval.simple.name === currInterval.simple.name &&
                motion === 'similar') {
                const intervalName = prevInterval.simple.name === 'P5' ? 'quintas' : 'octavas';
                const issue = {
                    rule: prevInterval.simple.name === 'P5' ? this.RULES.PARALLEL_FIFTHS : this.RULES.PARALLEL_OCTAVES,
                    position: currIdx,
                    message: `Notas ${prevIdx + 1} y ${currIdx + 1} (t1→t1): ${intervalName.charAt(0).toUpperCase() + intervalName.slice(1)} paralelas prohibidas.`,
                    severity: this.SEVERITY.ERROR
                };
                results.errors.push(issue);
                results.noteResults[currIdx].valid = false;
                results.noteResults[currIdx].issues.push(issue);
            }
        }
    },

    /**
     * Check hidden fifths/octaves between consecutive downbeats
     */
    checkDownbeatHiddenParallels(cf, counterpoint, cpPosition, cpLen, results) {
        const downbeats = this.getDownbeatIndices(cpLen);

        for (let di = 1; di < downbeats.length; di++) {
            const prevIdx = downbeats[di - 1];
            const currIdx = downbeats[di];

            const prevCp = counterpoint[prevIdx];
            const currCp = counterpoint[currIdx];

            if (prevCp === null || currCp === null) continue;

            const prevCF = this.getCFNote(prevIdx, cf);
            const currCF = this.getCFNote(currIdx, cf);

            const prevInterval = Interval.between(
                cpPosition === 'upper' ? prevCF : prevCp,
                cpPosition === 'upper' ? prevCp : prevCF
            );
            const currInterval = Interval.between(
                cpPosition === 'upper' ? currCF : currCp,
                cpPosition === 'upper' ? currCp : currCF
            );

            const motion = this.getMotionType(prevCF, currCF, prevCp, currCp);

            const prevPerfect = Interval.isPerfectConsonance(prevInterval) && prevInterval.simple.name !== 'P1';
            const currPerfect = Interval.isPerfectConsonance(currInterval) && currInterval.simple.name !== 'P1';

            // Hidden: approaching a perfect interval by similar motion (not from another perfect of same type)
            if (!prevPerfect && currPerfect && motion === 'similar') {
                const cpInterval = Interval.between(prevCp, currCp);
                const isStepwise = cpInterval.simple.generic <= 2;

                if (!isStepwise) {
                    const intervalName = currInterval.simple.name === 'P5' ? 'quintas' : 'octavas';
                    const issue = {
                        rule: currInterval.simple.name === 'P5' ? this.RULES.HIDDEN_FIFTHS : this.RULES.HIDDEN_OCTAVES,
                        position: currIdx,
                        message: `Notas ${prevIdx + 1} y ${currIdx + 1} (t1→t1): ${intervalName.charAt(0).toUpperCase() + intervalName.slice(1)} ocultas (movimiento similar sin grado conjunto).`,
                        severity: this.SEVERITY.WARNING
                    };
                    results.warnings.push(issue);
                    results.noteResults[currIdx].issues.push(issue);
                }
            }
        }
    },

    /**
     * Analyze motion between downbeats (prefer contrary)
     */
    checkDownbeatMotion(cf, counterpoint, cpPosition, cpLen, results) {
        const downbeats = this.getDownbeatIndices(cpLen);

        for (let di = 1; di < downbeats.length; di++) {
            const prevIdx = downbeats[di - 1];
            const currIdx = downbeats[di];

            const prevCp = counterpoint[prevIdx];
            const currCp = counterpoint[currIdx];

            if (prevCp === null || currCp === null) continue;

            const prevCF = this.getCFNote(prevIdx, cf);
            const currCF = this.getCFNote(currIdx, cf);

            const motion = this.getMotionType(prevCF, currCF, prevCp, currCp);

            if (motion === 'similar') {
                const issue = {
                    rule: this.RULES.MOTION_TYPE,
                    position: currIdx,
                    message: `Nota ${currIdx + 1} (t1): Movimiento similar entre downbeats. Preferir movimiento contrario.`,
                    severity: this.SEVERITY.SUGGESTION,
                    motionType: motion
                };
                results.suggestions.push(issue);
                results.noteResults[currIdx].issues.push(issue);
            }
        }
    },

    // =========================================================================
    // STRUCTURAL CHECKS
    // =========================================================================

    /**
     * Start on perfect consonance (first sounding note)
     */
    checkStartInterval(cf, counterpoint, cpPosition, results) {
        const startIdx = this._getFirstSoundingIndex(counterpoint);
        const cp = counterpoint[startIdx];
        if (cp === null) return;

        const cfNote = this.getCFNote(startIdx, cf);
        const interval = Interval.between(
            cpPosition === 'upper' ? cfNote : cp,
            cpPosition === 'upper' ? cp : cfNote
        );

        if (!Interval.isPerfectConsonance(interval)) {
            const issue = {
                rule: this.RULES.START_CONSONANCE,
                position: startIdx,
                message: `Debe comenzar en consonancia perfecta (unísono, quinta u octava). Actual: ${Interval.spanishName(interval)}.`,
                severity: this.SEVERITY.ERROR
            };
            results.errors.push(issue);
            results.noteResults[startIdx].valid = false;
            results.noteResults[startIdx].issues.push(issue);
        }
    },

    /**
     * End on unison or octave (last note)
     */
    checkEndInterval(cf, counterpoint, cpPosition, cpLen, results) {
        const lastIdx = cpLen - 1;
        const cp = counterpoint[lastIdx];
        if (cp === null) return;

        const cfNote = this.getCFNote(lastIdx, cf);
        const interval = Interval.between(
            cpPosition === 'upper' ? cfNote : cp,
            cpPosition === 'upper' ? cp : cfNote
        );

        if (interval.simple.name !== 'P1' && interval.simple.name !== 'P8') {
            const issue = {
                rule: this.RULES.END_CONSONANCE,
                position: lastIdx,
                message: `Debe terminar en unísono u octava. Actual: ${Interval.spanishName(interval)}.`,
                severity: this.SEVERITY.ERROR
            };
            results.errors.push(issue);
            results.noteResults[lastIdx].valid = false;
            results.noteResults[lastIdx].issues.push(issue);
        }
    },

    /**
     * Verify last note is structurally a whole note.
     * For 3rd species: cpLen = 4n-3, last index = 4n-4, which mod 4 = (4n-4)%4 = 0 → downbeat ✓
     */
    checkLastNoteWhole(cpLen, results) {
        // For cpLen = 4n-3: last index = cpLen-1 = 4n-4
        // (4n-4) % 4 = 0 → always a downbeat (structurally guaranteed)
        // Just verify cpLen has the right form: cpLen + 3 should be divisible by 4
        if ((cpLen + 3) % 4 !== 0) {
            const issue = {
                rule: this.RULES.CONSONANCE,
                position: cpLen - 1,
                message: `La estructura del contrapunto no es válida para tercera especie.`,
                severity: this.SEVERITY.ERROR
            };
            results.errors.push(issue);
        }
    },

    /**
     * Cadence check for third species (§34)
     * Leading tone (degree 7) should appear on beat 4 of the penultimate measure
     */
    checkCadence(cf, counterpoint, key, mode, cpPosition, cpLen, results) {
        if (cpLen < 5) return;

        // The penultimate measure's beat 4 is at index cpLen - 2
        // (last note is cpLen-1 = redonda, before that is beat 4 of penultimate)
        const penultimateBeat4Idx = cpLen - 2;
        const penultimateBeat4Note = counterpoint[penultimateBeat4Idx];

        if (penultimateBeat4Note === null) return;

        const degree = Scale.getDegree(penultimateBeat4Note, key, mode);

        if (cpPosition === 'upper') {
            if (degree !== 7) {
                const issue = {
                    rule: this.RULES.CADENCE_THIRD_SPECIES,
                    position: penultimateBeat4Idx,
                    message: `Cadencia: en voz superior, el 4º tiempo del penúltimo compás debería ser la sensible (grado 7). Actual: grado ${degree || '?'}.`,
                    severity: this.SEVERITY.WARNING
                };
                results.warnings.push(issue);
                results.noteResults[penultimateBeat4Idx].issues.push(issue);
            }
        } else {
            // Lower voice: degree 2, 5, or 7
            if (degree !== 2 && degree !== 5 && degree !== 7) {
                const issue = {
                    rule: this.RULES.CADENCE_THIRD_SPECIES,
                    position: penultimateBeat4Idx,
                    message: `Cadencia: en voz inferior, el 4º tiempo del penúltimo compás debería ser grado 2, 5 o 7. Actual: grado ${degree || '?'}.`,
                    severity: this.SEVERITY.WARNING
                };
                results.warnings.push(issue);
                results.noteResults[penultimateBeat4Idx].issues.push(issue);
            }
        }
    },

    // =========================================================================
    // GLOBAL MELODIC CHECKS
    // =========================================================================

    /**
     * Compound tritones (§7c)
     */
    checkCompoundTritones(soundingNotes, sounding, key, mode, results) {
        if (soundingNotes.length < 3) return;

        for (let i = 0; i < soundingNotes.length - 2; i++) {
            for (let span = 3; span <= Math.min(5, soundingNotes.length - i); span++) {
                const startNote = soundingNotes[i];
                const endNote = soundingNotes[i + span - 1];

                const startDegree = Scale.getDegree(startNote, key, mode);
                const endDegree = Scale.getDegree(endNote, key, mode);

                if ((startDegree === 4 && endDegree === 7) ||
                    (startDegree === 7 && endDegree === 4)) {

                    const interval = Interval.between(startNote, endNote);
                    if (Interval.isTritone(interval)) {
                        const startPos = sounding[i].index;
                        const endPos = sounding[i + span - 1].index;

                        // Cadential exception
                        if (endDegree === 7 && i + span - 1 === soundingNotes.length - 2) {
                            break;
                        }

                        const issue = {
                            rule: this.RULES.COMPOUND_TRITONE,
                            position: startPos,
                            message: `Notas ${startPos + 1}-${endPos + 1}: Tritono compuesto entre grados 4 y 7.`,
                            severity: this.SEVERITY.WARNING
                        };
                        results.warnings.push(issue);
                        break;
                    }
                }
            }
        }
    },

    /**
     * Prolonged direction (§7f) — threshold raised to 10-12 for 3rd species density
     */
    checkProlongedDirection(soundingNotes, sounding, results) {
        if (soundingNotes.length < 4) return;

        const threshold = 11; // Higher threshold for 3rd species (4 notes per measure)

        let currentDirection = 0;
        let directionCount = 1;
        let startSoundingIdx = 0;

        for (let i = 1; i < soundingNotes.length; i++) {
            const direction = Math.sign(Pitch.toMidi(soundingNotes[i]) - Pitch.toMidi(soundingNotes[i - 1]));

            if (direction === 0) continue;

            if (direction === currentDirection) {
                directionCount++;
            } else {
                if (directionCount > threshold) {
                    const dirName = currentDirection > 0 ? 'ascendente' : 'descendente';
                    const startPos = sounding[startSoundingIdx].index;
                    const endPos = sounding[i - 1].index;
                    const issue = {
                        rule: this.RULES.PROLONGED_DIRECTION,
                        position: startPos,
                        message: `Notas ${startPos + 1}-${endPos + 1}: ${directionCount} notas en dirección ${dirName}. Máximo recomendado: ${threshold}.`,
                        severity: this.SEVERITY.WARNING
                    };
                    results.warnings.push(issue);
                }
                currentDirection = direction;
                directionCount = 1;
                startSoundingIdx = i - 1;
            }
        }

        // Final run
        if (directionCount > threshold) {
            const dirName = currentDirection > 0 ? 'ascendente' : 'descendente';
            const startPos = sounding[startSoundingIdx].index;
            const endPos = sounding[soundingNotes.length - 1].index;
            const issue = {
                rule: this.RULES.PROLONGED_DIRECTION,
                position: startPos,
                message: `Notas ${startPos + 1}-${endPos + 1}: ${directionCount} notas en dirección ${dirName}. Máximo recomendado: ${threshold}.`,
                severity: this.SEVERITY.WARNING
            };
            results.warnings.push(issue);
        }
    },

    /**
     * Arpeggiated patterns (§7h)
     */
    checkArpeggios(soundingNotes, sounding, key, mode, results) {
        if (soundingNotes.length < 3) return;

        for (let i = 0; i < soundingNotes.length - 2; i++) {
            const note1 = soundingNotes[i];
            const note2 = soundingNotes[i + 1];
            const note3 = soundingNotes[i + 2];

            const degree1 = Scale.getDegree(note1, key, mode);
            const degree2 = Scale.getDegree(note2, key, mode);
            const degree3 = Scale.getDegree(note3, key, mode);

            if (!degree1 || !degree2 || !degree3) continue;

            const triadPatterns = [
                [1, 3, 5], [1, 5, 3], [3, 1, 5], [3, 5, 1], [5, 1, 3], [5, 3, 1],
                [2, 4, 6], [2, 6, 4], [4, 2, 6], [4, 6, 2], [6, 2, 4], [6, 4, 2],
                [3, 5, 7], [3, 7, 5], [5, 3, 7], [5, 7, 3], [7, 3, 5], [7, 5, 3],
                [4, 6, 1], [4, 1, 6], [6, 4, 1], [6, 1, 4], [1, 4, 6], [1, 6, 4],
                [5, 7, 2], [5, 2, 7], [7, 5, 2], [7, 2, 5], [2, 5, 7], [2, 7, 5],
                [6, 1, 3], [6, 3, 1], [1, 6, 3], [1, 3, 6], [3, 6, 1], [3, 1, 6],
                [7, 2, 4], [7, 4, 2], [2, 7, 4], [2, 4, 7], [4, 7, 2], [4, 2, 7]
            ];

            const currentPattern = [degree1, degree2, degree3];

            for (const pattern of triadPatterns) {
                if (pattern[0] === currentPattern[0] &&
                    pattern[1] === currentPattern[1] &&
                    pattern[2] === currentPattern[2]) {

                    const int1 = Interval.between(note1, note2);
                    const int2 = Interval.between(note2, note3);

                    if (int1.simple.generic >= 3 && int2.simple.generic >= 3) {
                        const pos = sounding[i].index;
                        const issue = {
                            rule: this.RULES.ARPEGGIO,
                            position: pos,
                            message: `Notas ${pos + 1}-${sounding[i + 2].index + 1}: Acorde arpegiado (grados ${degree1}-${degree2}-${degree3}).`,
                            severity: this.SEVERITY.SUGGESTION
                        };
                        results.suggestions.push(issue);
                    }
                    break;
                }
            }
        }
    },

    /**
     * Avoid excessive note repetition
     */
    checkNoteRepetition(sounding, results) {
        if (sounding.length < 3) return;

        let repeatCount = 1;
        for (let i = 1; i < sounding.length; i++) {
            if (Pitch.toMidi(sounding[i].note) === Pitch.toMidi(sounding[i - 1].note)) {
                repeatCount++;
                if (repeatCount >= 3) {
                    const issue = {
                        rule: this.RULES.NOTE_REPETITION,
                        position: sounding[i].index,
                        message: `Nota ${sounding[i].index + 1}: ${repeatCount} repeticiones consecutivas de ${sounding[i].note}. Evitar monotonía.`,
                        severity: this.SEVERITY.WARNING
                    };
                    results.warnings.push(issue);
                }
            } else {
                repeatCount = 1;
            }
        }
    },

    // =========================================================================
    // SCORING
    // =========================================================================

    /**
     * Calculate score — adjusted for 3rd species having more notes
     */
    calculateScore(results) {
        let score = 100;

        // Errors: -8 points each (slightly less per error due to more notes/opportunities)
        score -= results.errors.length * 8;

        // Warnings: -3 points each
        score -= results.warnings.length * 3;

        // Suggestions: -1 point each
        score -= results.suggestions.length;

        return Math.max(0, score);
    }
};

// Export for ES modules or make global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThirdSpeciesValidator;
}
