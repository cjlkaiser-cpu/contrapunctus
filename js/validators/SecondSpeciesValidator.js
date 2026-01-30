/**
 * SecondSpeciesValidator.js - Second Species Counterpoint Rules
 *
 * Second Species: Two half-notes against each whole-note (2:1 ratio)
 * Based on Schoenberg's "Ejercicios preliminares de contrapunto" §15-§22
 *
 * DATA STRUCTURE:
 * Flat array where counterpoint.length === CF.length * 2 - 1
 * - Even indices (0, 2, 4...) = STRONG beats → must be consonant
 * - Odd indices (1, 3, 5...)  = WEAK beats   → dissonance only as passing tone
 * - Last index = final whole note (always strong)
 * - counterpoint[0] === null  = anacrusis (half-rest)
 *
 * RULES (28 total):
 * Inherits 17 from FirstSpeciesValidator + 7 new for second species
 *
 * NEW RULES:
 * §16: Dissonance only on weak beats
 * §18: Dissonance must be a passing tone (stepwise, same direction, flanked by consonances)
 * §19: Consonances on weak beats are free
 * §20: Last note is a whole note
 * §20-22: Cadence specific to second species
 * Anacrusis handling
 * Note repetition D→F avoidance
 * Cross-beat parallels F↔D (warning)
 */

const SecondSpeciesValidator = {
    // Rule identifiers — inherits from first species + new
    RULES: {
        // Inherited from first species
        CONSONANCE: 'consonance',
        PARALLEL_FIFTHS: 'parallel-fifths',
        PARALLEL_OCTAVES: 'parallel-octaves',
        HIDDEN_FIFTHS: 'hidden-fifths',
        HIDDEN_OCTAVES: 'hidden-octaves',
        START_CONSONANCE: 'start-consonance',
        END_CONSONANCE: 'end-consonance',
        CADENCE: 'cadence',
        VOICE_CROSSING: 'voice-crossing',
        UNISON: 'unison',
        MOTION_TYPE: 'motion-type',
        STEPWISE: 'stepwise',
        RANGE: 'range',
        TRITONE: 'tritone',
        LEADING_TONE: 'leading-tone',
        COMPOUND_TRITONE: 'compound-tritone',
        COMPOUND_DISSONANT_LEAP: 'compound-dissonant-leap',
        BATTUTA_FIFTHS: 'battuta-fifths',
        BATTUTA_OCTAVES: 'battuta-octaves',
        PROLONGED_DIRECTION: 'prolonged-direction',
        ARPEGGIO: 'arpeggio',
        EXCESSIVE_PARALLELS: 'excessive-parallels',
        // New for second species
        PASSING_TONE: 'passing-tone',
        WEAK_BEAT_DISSONANCE: 'weak-beat-dissonance',
        LAST_NOTE_WHOLE: 'last-note-whole',
        ANACRUSIS: 'anacrusis',
        STRONG_WEAK_PARALLELS: 'strong-weak-parallels',
        CADENCE_SECOND_SPECIES: 'cadence-second-species',
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
     * @param {number} cpIndex - Index in the counterpoint array
     * @returns {number} Corresponding CF measure index
     */
    getMeasureIndex(cpIndex) {
        return Math.floor(cpIndex / 2);
    },

    /**
     * Check if a CP index falls on a strong beat
     * Strong beats: even indices + the last index (final whole note)
     * @param {number} cpIndex - Index in the counterpoint array
     * @param {number} cpLen - Total length of the counterpoint array
     * @returns {boolean}
     */
    isStrongBeat(cpIndex, cpLen) {
        return cpIndex % 2 === 0 || cpIndex === cpLen - 1;
    },

    /**
     * Check if a CP index falls on a weak beat
     * Weak beats: odd indices that are NOT the last index
     * @param {number} cpIndex - Index in the counterpoint array
     * @param {number} cpLen - Total length of the counterpoint array
     * @returns {boolean}
     */
    isWeakBeat(cpIndex, cpLen) {
        return cpIndex % 2 === 1 && cpIndex !== cpLen - 1;
    },

    /**
     * Get the CF note corresponding to a CP index
     * @param {number} cpIndex - Index in the counterpoint array
     * @param {string[]} cf - Cantus firmus array
     * @returns {string} The CF note
     */
    getCFNote(cpIndex, cf) {
        return cf[this.getMeasureIndex(cpIndex)];
    },

    /**
     * Get all strong beat indices
     * @param {number} cpLen - Total length of the counterpoint array
     * @returns {number[]} Array of strong beat indices
     */
    getStrongBeatIndices(cpLen) {
        const indices = [];
        for (let i = 0; i < cpLen; i++) {
            if (this.isStrongBeat(i, cpLen)) {
                indices.push(i);
            }
        }
        return indices;
    },

    /**
     * Get all sounding (non-null) notes from the counterpoint
     * @param {Array} counterpoint - The counterpoint array (may contain null for anacrusis)
     * @returns {{ note: string, index: number }[]} Sounding notes with their indices
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
    // MOTION TYPE (copied from FirstSpeciesValidator)
    // =========================================================================

    /**
     * Motion types between two voice pairs
     */
    getMotionType(cf1, cf2, cp1, cp2) {
        const cfDirection = Math.sign(Pitch.toMidi(cf2) - Pitch.toMidi(cf1));
        const cpDirection = Math.sign(Pitch.toMidi(cp2) - Pitch.toMidi(cp1));

        if (cfDirection === 0 && cpDirection === 0) return 'stationary';
        if (cfDirection === 0 || cpDirection === 0) return 'oblique';
        if (cfDirection === cpDirection) return 'similar';
        return 'contrary';
    },

    // =========================================================================
    // PASSING TONE DETECTION (§18)
    // =========================================================================

    /**
     * Check if a weak-beat note is a valid passing tone
     *
     * Requirements:
     * 1. Must be on a weak beat
     * 2. Previous note (strong beat) and next note (strong beat) must be consonant with CF
     * 3. Stepwise motion from prev to current AND from current to next
     * 4. Same direction (ascending or descending throughout)
     *
     * @param {number} cpIndex - Index of the note to check (must be odd)
     * @param {Array} counterpoint - Full counterpoint array
     * @param {string[]} cf - Cantus firmus
     * @param {string} cpPosition - 'upper' or 'lower'
     * @returns {{ valid: boolean, reason: string }}
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

        // Previous strong beat
        const prevIndex = cpIndex - 1;
        const prev = counterpoint[prevIndex];
        if (prev === null) {
            return { valid: false, reason: 'Nota anterior es silencio (anacrusa)' };
        }

        // Next strong beat
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

        // Check that prev (strong) is consonant with its CF
        const prevCF = this.getCFNote(prevIndex, cf);
        const prevInterval = Interval.between(
            cpPosition === 'upper' ? prevCF : prev,
            cpPosition === 'upper' ? prev : prevCF
        );
        if (Interval.isDissonant(prevInterval)) {
            return { valid: false, reason: 'Nota anterior (tiempo fuerte) no es consonante con el CF' };
        }

        // Check that next (strong) is consonant with its CF
        const nextCF = this.getCFNote(nextIndex, cf);
        const nextInterval = Interval.between(
            cpPosition === 'upper' ? nextCF : next,
            cpPosition === 'upper' ? next : nextCF
        );
        if (Interval.isDissonant(nextInterval)) {
            return { valid: false, reason: 'Nota siguiente (tiempo fuerte) no es consonante con el CF' };
        }

        return { valid: true, reason: 'Nota de paso válida' };
    },

    // =========================================================================
    // MAIN VALIDATION
    // =========================================================================

    /**
     * Validate a complete second species exercise
     * @param {Object} exercise - { cantusFirmus, counterpoint, key, mode, cpPosition }
     * @returns {Object} { valid, score, errors, warnings, suggestions, noteResults }
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
        const expectedCpLen = cfLen * 2 - 1;

        // Verify length: CP must be 2*CF - 1
        if (cpLen !== expectedCpLen) {
            results.errors.push({
                rule: 'LENGTH',
                message: `Longitud incorrecta: el contrapunto debe tener ${expectedCpLen} notas (2×${cfLen}−1), tiene ${cpLen}.`,
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

            // --- Strong beat checks ---
            if (this.isStrongBeat(i, cpLen)) {
                // Rule: Strong beats must be consonant
                this.checkStrongBeatConsonance(interval, i, results);

                // Rule: Unison only at start or end
                this.checkUnison(interval, i, cpLen, counterpoint, results);
            }

            // --- Weak beat checks ---
            if (this.isWeakBeat(i, cpLen)) {
                // Rule: Dissonance on weak beat must be passing tone
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

            // Stepwise preference
            this.checkStepwise(prevEntry.note, currEntry.note, currEntry.index, results);

            // Note repetition D→F
            this.checkNoteRepetition(prevEntry, currEntry, cpLen, results);
        }

        // =====================================================================
        // STRONG-TO-STRONG CHECKS (first species rules between downbeats)
        // =====================================================================
        this.checkStrongBeatParallels(cantusFirmus, counterpoint, cpPosition, cpLen, results);
        this.checkStrongBeatHiddenParallels(cantusFirmus, counterpoint, cpPosition, cpLen, results);
        this.checkStrongBeatMotion(cantusFirmus, counterpoint, cpPosition, cpLen, results);

        // =====================================================================
        // CROSS-BEAT PARALLELS (F↔D, warning)
        // =====================================================================
        this.checkCrossBeatParallels(cantusFirmus, counterpoint, cpPosition, cpLen, results);

        // =====================================================================
        // STRUCTURAL CHECKS
        // =====================================================================

        // Start interval (first sounding note)
        this.checkStartInterval(cantusFirmus, counterpoint, cpPosition, results);

        // End interval (last note = whole note)
        this.checkEndInterval(cantusFirmus, counterpoint, key, mode, cpPosition, cpLen, results);

        // Last note must be whole note (implicit in structure: last index is strong)
        this.checkLastNoteWhole(cpLen, results);

        // Cadence (§20-22)
        this.checkCadence(cantusFirmus, counterpoint, key, mode, cpPosition, cpLen, results);

        // Range
        this.checkRange(counterpoint, cpPosition, results);

        // =====================================================================
        // GLOBAL MELODIC CHECKS (on sounding notes)
        // =====================================================================
        const soundingNotes = sounding.map(s => s.note);

        // Compound tritones (§7c)
        this.checkCompoundTritones(soundingNotes, sounding, key, mode, results);

        // Compound dissonant leaps (§7e)
        this.checkCompoundDissonantLeaps(soundingNotes, sounding, results);

        // Prolonged direction (§7f)
        this.checkProlongedDirection(soundingNotes, sounding, results);

        // Arpeggios (§7h)
        this.checkArpeggios(soundingNotes, sounding, key, mode, results);

        // Excessive parallel consonances
        this.checkExcessiveParallelConsonances(cantusFirmus, counterpoint, cpPosition, cpLen, results);

        // Battuta parallels (§8) — between strong beats
        this.checkBattutaParallels(cantusFirmus, counterpoint, cpPosition, cpLen, results);

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
     * Check anacrusis validity: only counterpoint[0] may be null
     */
    checkAnacrusis(counterpoint, cpLen, results) {
        for (let i = 0; i < cpLen; i++) {
            if (counterpoint[i] === null && i !== 0) {
                const issue = {
                    rule: this.RULES.ANACRUSIS,
                    position: i,
                    message: `Nota ${i + 1}: Solo la primera posición puede ser silencio (anacrusa).`,
                    severity: this.SEVERITY.ERROR
                };
                results.errors.push(issue);
                results.noteResults[i].valid = false;
                results.noteResults[i].issues.push(issue);
            }
        }
    },

    /**
     * Strong beats must be consonant with CF (§16)
     */
    checkStrongBeatConsonance(interval, position, results) {
        if (Interval.isDissonant(interval)) {
            const issue = {
                rule: this.RULES.CONSONANCE,
                position,
                message: `Nota ${position + 1} (tiempo fuerte): ${Interval.spanishName(interval)} es disonante. Los tiempos fuertes deben ser consonantes.`,
                severity: this.SEVERITY.ERROR,
                interval: interval.name
            };
            results.errors.push(issue);
            results.noteResults[position].valid = false;
            results.noteResults[position].issues.push(issue);
        }
    },

    /**
     * Weak beat dissonance must be a valid passing tone (§18)
     */
    checkWeakBeatDissonance(interval, position, counterpoint, cf, cpPosition, results) {
        if (!Interval.isDissonant(interval)) return; // consonant on weak beat = free

        const ptResult = this.isPassingTone(position, counterpoint, cf, cpPosition);
        if (!ptResult.valid) {
            const issue = {
                rule: this.RULES.PASSING_TONE,
                position,
                message: `Nota ${position + 1} (tiempo débil): ${Interval.spanishName(interval)} es disonante pero no es nota de paso válida. ${ptResult.reason}.`,
                severity: this.SEVERITY.ERROR,
                interval: interval.name
            };
            results.errors.push(issue);
            results.noteResults[position].valid = false;
            results.noteResults[position].issues.push(issue);
        }
    },

    /**
     * Unison only at beginning and end (on strong beats)
     */
    checkUnison(interval, position, cpLen, counterpoint, results) {
        if (interval.simple.name !== 'P1') return;

        // Determine if this is the first sounding strong beat or the last note
        const isFirstSounding = (position === 0 && counterpoint[0] !== null) ||
                                (position === 1 && counterpoint[0] === null);
        const isLast = position === cpLen - 1;

        if (!isFirstSounding && !isLast) {
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

    /**
     * Prefer stepwise motion
     */
    checkStepwise(prevNote, currNote, position, results) {
        const interval = Interval.between(prevNote, currNote);

        if (interval.simple.generic > 3) {
            const issue = {
                rule: this.RULES.STEPWISE,
                position,
                message: `Nota ${position + 1}: Salto de ${Interval.spanishName(interval)}. Preferir movimiento por grados conjuntos.`,
                severity: this.SEVERITY.SUGGESTION
            };
            results.suggestions.push(issue);
            results.noteResults[position].issues.push(issue);
        }

        if (interval.simple.generic > 6) {
            const issue = {
                rule: this.RULES.STEPWISE,
                position,
                message: `Nota ${position + 1}: Salto grande de ${Interval.spanishName(interval)}. Evitar saltos mayores a una sexta.`,
                severity: this.SEVERITY.WARNING
            };
            results.warnings.push(issue);
            results.noteResults[position].issues.push(issue);
        }
    },

    /**
     * Avoid note repetition from weak beat to next strong beat (D→F)
     * Repeating a note across the barline weakens rhythmic independence
     */
    checkNoteRepetition(prevEntry, currEntry, cpLen, results) {
        // Only flag if prev is weak and curr is strong
        if (!this.isWeakBeat(prevEntry.index, cpLen)) return;
        if (!this.isStrongBeat(currEntry.index, cpLen)) return;

        if (Pitch.toMidi(prevEntry.note) === Pitch.toMidi(currEntry.note)) {
            const issue = {
                rule: this.RULES.NOTE_REPETITION,
                position: currEntry.index,
                message: `Nota ${currEntry.index + 1}: Repetición de nota del tiempo débil al fuerte. Evitar repetición ${prevEntry.note}→${currEntry.note}.`,
                severity: this.SEVERITY.WARNING
            };
            results.warnings.push(issue);
            results.noteResults[currEntry.index].issues.push(issue);
        }
    },

    // =========================================================================
    // STRONG-TO-STRONG PARALLELS (first species rules between downbeats)
    // =========================================================================

    /**
     * Check parallel fifths/octaves between consecutive strong beats
     */
    checkStrongBeatParallels(cf, counterpoint, cpPosition, cpLen, results) {
        const strongIndices = this.getStrongBeatIndices(cpLen);

        for (let si = 1; si < strongIndices.length; si++) {
            const prevIdx = strongIndices[si - 1];
            const currIdx = strongIndices[si];

            const prevCp = counterpoint[prevIdx];
            const currCp = counterpoint[currIdx];

            // Skip nulls (anacrusis)
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

            // Parallel fifths or octaves
            if (prevPerfect && currPerfect &&
                prevInterval.simple.name === currInterval.simple.name &&
                motion === 'similar') {
                const intervalName = prevInterval.simple.name === 'P5' ? 'quintas' : 'octavas';
                const issue = {
                    rule: prevInterval.simple.name === 'P5' ? this.RULES.PARALLEL_FIFTHS : this.RULES.PARALLEL_OCTAVES,
                    position: currIdx,
                    message: `Notas ${prevIdx + 1} y ${currIdx + 1} (tiempos fuertes): ${intervalName.charAt(0).toUpperCase() + intervalName.slice(1)} paralelas prohibidas.`,
                    severity: this.SEVERITY.ERROR
                };
                results.errors.push(issue);
                results.noteResults[currIdx].valid = false;
                results.noteResults[currIdx].issues.push(issue);
            }
        }
    },

    /**
     * Check hidden (direct) fifths/octaves between consecutive strong beats
     */
    checkStrongBeatHiddenParallels(cf, counterpoint, cpPosition, cpLen, results) {
        const strongIndices = this.getStrongBeatIndices(cpLen);

        for (let si = 1; si < strongIndices.length; si++) {
            const prevIdx = strongIndices[si - 1];
            const currIdx = strongIndices[si];

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

            // Hidden fifths/octaves: approaching a perfect interval by similar motion
            if (!prevPerfect && currPerfect && motion === 'similar') {
                const cpInterval = Interval.between(prevCp, currCp);
                const isStepwise = cpInterval.simple.generic <= 2;

                if (!isStepwise) {
                    const intervalName = currInterval.simple.name === 'P5' ? 'quintas' : 'octavas';
                    const issue = {
                        rule: currInterval.simple.name === 'P5' ? this.RULES.HIDDEN_FIFTHS : this.RULES.HIDDEN_OCTAVES,
                        position: currIdx,
                        message: `Notas ${prevIdx + 1} y ${currIdx + 1} (tiempos fuertes): ${intervalName.charAt(0).toUpperCase() + intervalName.slice(1)} ocultas (movimiento similar hacia consonancia perfecta sin grado conjunto).`,
                        severity: this.SEVERITY.WARNING
                    };
                    results.warnings.push(issue);
                    results.noteResults[currIdx].issues.push(issue);
                }
            }
        }
    },

    /**
     * Analyze motion between strong beats (prefer contrary)
     */
    checkStrongBeatMotion(cf, counterpoint, cpPosition, cpLen, results) {
        const strongIndices = this.getStrongBeatIndices(cpLen);

        for (let si = 1; si < strongIndices.length; si++) {
            const prevIdx = strongIndices[si - 1];
            const currIdx = strongIndices[si];

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
                    message: `Nota ${currIdx + 1} (tiempo fuerte): Movimiento similar entre tiempos fuertes. Preferir movimiento contrario u oblicuo.`,
                    severity: this.SEVERITY.SUGGESTION,
                    motionType: motion
                };
                results.suggestions.push(issue);
                results.noteResults[currIdx].issues.push(issue);
            }
        }
    },

    // =========================================================================
    // CROSS-BEAT PARALLELS (F↔D, warning)
    // =========================================================================

    /**
     * Check for perfect fifths/octaves between a strong beat and the
     * adjacent weak beat (or vice versa) moving in similar motion.
     * Less severe than strong-to-strong, but still worth warning about.
     */
    checkCrossBeatParallels(cf, counterpoint, cpPosition, cpLen, results) {
        for (let i = 0; i < cpLen - 1; i++) {
            const cp1 = counterpoint[i];
            const cp2 = counterpoint[i + 1];

            if (cp1 === null || cp2 === null) continue;

            // One must be strong, the other weak
            const oneStrong = this.isStrongBeat(i, cpLen) !== this.isStrongBeat(i + 1, cpLen);
            if (!oneStrong) continue;

            const cf1 = this.getCFNote(i, cf);
            const cf2 = this.getCFNote(i + 1, cf);

            const interval1 = Interval.between(
                cpPosition === 'upper' ? cf1 : cp1,
                cpPosition === 'upper' ? cp1 : cf1
            );
            const interval2 = Interval.between(
                cpPosition === 'upper' ? cf2 : cp2,
                cpPosition === 'upper' ? cp2 : cf2
            );

            const perf1 = Interval.isPerfectConsonance(interval1) && interval1.simple.name !== 'P1';
            const perf2 = Interval.isPerfectConsonance(interval2) && interval2.simple.name !== 'P1';

            if (perf1 && perf2 &&
                interval1.simple.name === interval2.simple.name) {
                const motion = this.getMotionType(cf1, cf2, cp1, cp2);
                if (motion === 'similar') {
                    const intervalName = interval1.simple.name === 'P5' ? 'quintas' : 'octavas';
                    const issue = {
                        rule: this.RULES.STRONG_WEAK_PARALLELS,
                        position: i + 1,
                        message: `Notas ${i + 1} y ${i + 2}: ${intervalName.charAt(0).toUpperCase() + intervalName.slice(1)} paralelas entre tiempo fuerte y débil (menos grave, pero evitar).`,
                        severity: this.SEVERITY.WARNING
                    };
                    results.warnings.push(issue);
                    results.noteResults[i + 1].issues.push(issue);
                }
            }
        }
    },

    // =========================================================================
    // STRUCTURAL CHECKS
    // =========================================================================

    /**
     * Start on perfect consonance (first sounding note)
     * Supports anacrusis: if counterpoint[0] is null, first sounding is index 1
     */
    checkStartInterval(cf, counterpoint, cpPosition, results) {
        let startIdx = 0;
        if (counterpoint[0] === null) {
            startIdx = 1;
        }

        const cp = counterpoint[startIdx];
        if (cp === null) return; // degenerate case

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
    checkEndInterval(cf, counterpoint, key, mode, cpPosition, cpLen, results) {
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
     * Verify that the last note is structurally a whole note.
     * In our data model, this is guaranteed if cpLen === 2*cfLen - 1
     * and the last index is even (strong beat). This check validates that.
     */
    checkLastNoteWhole(cpLen, results) {
        // The last index is cpLen - 1
        // For cpLen = 2n-1, last index = 2n-2 (even) → strong beat → whole note ✓
        // This is structurally guaranteed by the length check, but we verify anyway
        if (cpLen > 1 && cpLen % 2 === 0) {
            // If cpLen is even, something is wrong — the last note would be weak
            const issue = {
                rule: this.RULES.LAST_NOTE_WHOLE,
                position: cpLen - 1,
                message: `La última nota del contrapunto debe ser una redonda (tiempo fuerte).`,
                severity: this.SEVERITY.ERROR
            };
            results.errors.push(issue);
            results.noteResults[cpLen - 1].valid = false;
            results.noteResults[cpLen - 1].issues.push(issue);
        }
    },

    /**
     * Cadence check for second species (§20-22)
     *
     * For CP upper voice:
     *   - Penultimate measure: the WEAK beat (index cpLen-2) should be
     *     the leading tone (degree 7), resolving up to tonic (octave/unison)
     *   - The strong beat of the penultimate measure should be a consonance
     *     that leads to the leading tone by step (typically degree 6)
     *
     * For CP lower voice:
     *   - More flexibility; penultimate measure should approach tonic from
     *     degree 2 (supertonic) or degree 5 (dominant)
     */
    checkCadence(cf, counterpoint, key, mode, cpPosition, cpLen, results) {
        if (cpLen < 3) return;

        // The penultimate weak beat is at cpLen - 2 (if cpLen >= 3)
        const penultimateWeakIdx = cpLen - 2;
        const penultimateWeakNote = counterpoint[penultimateWeakIdx];

        if (penultimateWeakNote === null) return;

        // This should be a weak beat in the penultimate measure
        if (!this.isWeakBeat(penultimateWeakIdx, cpLen)) return;

        const degree = Scale.getDegree(penultimateWeakNote, key, mode);

        if (cpPosition === 'upper') {
            // Upper voice: penultimate weak beat should be leading tone (degree 7)
            if (degree !== 7) {
                const issue = {
                    rule: this.RULES.CADENCE_SECOND_SPECIES,
                    position: penultimateWeakIdx,
                    message: `Cadencia: en voz superior, la última blanca del penúltimo compás debería ser la sensible (grado 7). Actual: grado ${degree || '?'}.`,
                    severity: this.SEVERITY.WARNING
                };
                results.warnings.push(issue);
                results.noteResults[penultimateWeakIdx].issues.push(issue);
            }
        } else {
            // Lower voice: penultimate weak beat should approach tonic
            // Typical: degree 2 (step down) or degree 5 (leap down or step)
            if (degree !== 2 && degree !== 5 && degree !== 7) {
                const issue = {
                    rule: this.RULES.CADENCE_SECOND_SPECIES,
                    position: penultimateWeakIdx,
                    message: `Cadencia: en voz inferior, la última blanca del penúltimo compás debería ser grado 2, 5 o 7. Actual: grado ${degree || '?'}.`,
                    severity: this.SEVERITY.WARNING
                };
                results.warnings.push(issue);
                results.noteResults[penultimateWeakIdx].issues.push(issue);
            }
        }

        // Also check the strong beat of the penultimate measure
        const penultimateStrongIdx = cpLen - 3;
        if (penultimateStrongIdx >= 0) {
            const penultimateStrongNote = counterpoint[penultimateStrongIdx];
            if (penultimateStrongNote !== null && cpPosition === 'upper') {
                const strongDegree = Scale.getDegree(penultimateStrongNote, key, mode);
                // Typically degree 6 (leading naturally to degree 7 by step)
                if (strongDegree !== 6 && strongDegree !== 5) {
                    const issue = {
                        rule: this.RULES.CADENCE_SECOND_SPECIES,
                        position: penultimateStrongIdx,
                        message: `Cadencia: la primera blanca del penúltimo compás en voz superior suele ser grado 5 o 6 (para descender/ascender a la sensible). Actual: grado ${strongDegree || '?'}.`,
                        severity: this.SEVERITY.SUGGESTION
                    };
                    results.suggestions.push(issue);
                    results.noteResults[penultimateStrongIdx].issues.push(issue);
                }
            }
        }
    },

    /**
     * Check voice range (on sounding notes only)
     */
    checkRange(counterpoint, cpPosition, results) {
        const midis = counterpoint.filter(n => n !== null).map(n => Pitch.toMidi(n));
        if (midis.length === 0) return;

        const lowest = Math.min(...midis);
        const highest = Math.max(...midis);
        const range = highest - lowest;

        if (range > 19) {
            const issue = {
                rule: this.RULES.RANGE,
                position: -1,
                message: `Rango del contrapunto muy amplio (${Pitch.fromMidi(lowest)} a ${Pitch.fromMidi(highest)}). Limitar a una décima o menos.`,
                severity: this.SEVERITY.WARNING
            };
            results.warnings.push(issue);
        }
    },

    // =========================================================================
    // GLOBAL MELODIC CHECKS (adapted from first species, operating on sounding notes)
    // =========================================================================

    /**
     * Rule 12: Compound tritones (§7c)
     * Notes between scale degrees 4 and 7 that outline a hidden tritone
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

                        // Exception: cadential tritone in penultimate measure
                        // If end note is degree 7 and it resolves to degree 1, allow
                        if (endDegree === 7 && i + span - 1 === soundingNotes.length - 2) {
                            break; // Cadential exception
                        }

                        const issue = {
                            rule: this.RULES.COMPOUND_TRITONE,
                            position: startPos,
                            message: `Notas ${startPos + 1}-${endPos + 1}: Tritono compuesto entre grados 4 y 7. Evitar progresiones que contengan el tritono de forma encubierta.`,
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
     * Rule 13: Compound dissonant leaps (§7e)
     * Two consecutive leaps in the same direction summing to a dissonance
     */
    checkCompoundDissonantLeaps(soundingNotes, sounding, results) {
        if (soundingNotes.length < 3) return;

        for (let i = 0; i < soundingNotes.length - 2; i++) {
            const note1 = soundingNotes[i];
            const note2 = soundingNotes[i + 1];
            const note3 = soundingNotes[i + 2];

            const interval1 = Interval.between(note1, note2);
            const interval2 = Interval.between(note2, note3);

            if (interval1.simple.generic > 2 && interval2.simple.generic > 2) {
                const dir1 = Math.sign(Pitch.toMidi(note2) - Pitch.toMidi(note1));
                const dir2 = Math.sign(Pitch.toMidi(note3) - Pitch.toMidi(note2));

                if (dir1 === dir2 && dir1 !== 0) {
                    const compoundInterval = Interval.between(note1, note3);

                    if (Interval.isDissonant(compoundInterval) ||
                        compoundInterval.simple.generic === 7 ||
                        compoundInterval.simple.generic === 9) {
                        const pos = sounding[i + 2].index;
                        const issue = {
                            rule: this.RULES.COMPOUND_DISSONANT_LEAP,
                            position: pos,
                            message: `Notas ${sounding[i].index + 1}-${pos + 1}: Saltos disonantes compuestos (${Interval.spanishName(interval1)} + ${Interval.spanishName(interval2)} = ${Interval.spanishName(compoundInterval)}).`,
                            severity: this.SEVERITY.WARNING
                        };
                        results.warnings.push(issue);
                    }
                }
            }
        }
    },

    /**
     * Rule 15: Prolonged direction (§7f)
     * More than 8-9 notes in the same direction
     */
    checkProlongedDirection(soundingNotes, sounding, results) {
        if (soundingNotes.length < 4) return;

        let currentDirection = 0;
        let directionCount = 1;
        let startSoundingIdx = 0;

        for (let i = 1; i < soundingNotes.length; i++) {
            const direction = Math.sign(Pitch.toMidi(soundingNotes[i]) - Pitch.toMidi(soundingNotes[i - 1]));

            if (direction === 0) continue;

            if (direction === currentDirection) {
                directionCount++;
            } else {
                if (directionCount > 8) {
                    const dirName = currentDirection > 0 ? 'ascendente' : 'descendente';
                    const startPos = sounding[startSoundingIdx].index;
                    const endPos = sounding[i - 1].index;
                    const issue = {
                        rule: this.RULES.PROLONGED_DIRECTION,
                        position: startPos,
                        message: `Notas ${startPos + 1}-${endPos + 1}: ${directionCount} notas en dirección ${dirName}. Máximo recomendado: 8-9.`,
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
        if (directionCount > 8) {
            const dirName = currentDirection > 0 ? 'ascendente' : 'descendente';
            const startPos = sounding[startSoundingIdx].index;
            const endPos = sounding[soundingNotes.length - 1].index;
            const issue = {
                rule: this.RULES.PROLONGED_DIRECTION,
                position: startPos,
                message: `Notas ${startPos + 1}-${endPos + 1}: ${directionCount} notas en dirección ${dirName}. Máximo recomendado: 8-9.`,
                severity: this.SEVERITY.WARNING
            };
            results.warnings.push(issue);
        }
    },

    /**
     * Rule 16: Arpeggiated patterns (§7h)
     * Three or more consecutive notes outlining a chord
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
                            message: `Notas ${pos + 1}-${sounding[i + 2].index + 1}: Acorde arpegiado (grados ${degree1}-${degree2}-${degree3}). Evitar sucesión de notas de un acorde.`,
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
     * Rule 17: Excessive parallel thirds or sixths (between strong beats)
     */
    checkExcessiveParallelConsonances(cf, counterpoint, cpPosition, cpLen, results) {
        const strongIndices = this.getStrongBeatIndices(cpLen);
        if (strongIndices.length < 4) return;

        let consecutiveThirds = 0;
        let consecutiveSixths = 0;
        let thirdsStart = 0;
        let sixthsStart = 0;

        for (let si = 0; si < strongIndices.length; si++) {
            const idx = strongIndices[si];
            const cp = counterpoint[idx];
            if (cp === null) {
                consecutiveThirds = 0;
                consecutiveSixths = 0;
                continue;
            }

            const cfNote = this.getCFNote(idx, cf);
            const interval = Interval.between(
                cpPosition === 'upper' ? cfNote : cp,
                cpPosition === 'upper' ? cp : cfNote
            );

            const isThird = interval.simple.name === 'm3' || interval.simple.name === 'M3';
            const isSixth = interval.simple.name === 'm6' || interval.simple.name === 'M6';

            if (isThird) {
                if (consecutiveThirds === 0) thirdsStart = idx;
                consecutiveThirds++;
                consecutiveSixths = 0;
            } else if (isSixth) {
                if (consecutiveSixths === 0) sixthsStart = idx;
                consecutiveSixths++;
                consecutiveThirds = 0;
            } else {
                if (consecutiveThirds > 4) {
                    const issue = {
                        rule: this.RULES.EXCESSIVE_PARALLELS,
                        position: thirdsStart,
                        message: `Notas ${thirdsStart + 1}-${idx + 1}: ${consecutiveThirds} terceras paralelas consecutivas en tiempos fuertes. Limitar a 4.`,
                        severity: this.SEVERITY.SUGGESTION
                    };
                    results.suggestions.push(issue);
                }
                if (consecutiveSixths > 4) {
                    const issue = {
                        rule: this.RULES.EXCESSIVE_PARALLELS,
                        position: sixthsStart,
                        message: `Notas ${sixthsStart + 1}-${idx + 1}: ${consecutiveSixths} sextas paralelas consecutivas en tiempos fuertes. Limitar a 4.`,
                        severity: this.SEVERITY.SUGGESTION
                    };
                    results.suggestions.push(issue);
                }
                consecutiveThirds = 0;
                consecutiveSixths = 0;
            }
        }

        // Final check
        if (consecutiveThirds > 4) {
            const lastIdx = strongIndices[strongIndices.length - 1];
            const issue = {
                rule: this.RULES.EXCESSIVE_PARALLELS,
                position: thirdsStart,
                message: `Notas ${thirdsStart + 1}-${lastIdx + 1}: ${consecutiveThirds} terceras paralelas consecutivas en tiempos fuertes.`,
                severity: this.SEVERITY.SUGGESTION
            };
            results.suggestions.push(issue);
        }
        if (consecutiveSixths > 4) {
            const lastIdx = strongIndices[strongIndices.length - 1];
            const issue = {
                rule: this.RULES.EXCESSIVE_PARALLELS,
                position: sixthsStart,
                message: `Notas ${sixthsStart + 1}-${lastIdx + 1}: ${consecutiveSixths} sextas paralelas consecutivas en tiempos fuertes.`,
                severity: this.SEVERITY.SUGGESTION
            };
            results.suggestions.push(issue);
        }
    },

    /**
     * Rule 14: Battuta (intermittent) fifths/octaves (§8)
     * Perfect consonances separated by intervening harmonies (between strong beats)
     */
    checkBattutaParallels(cf, counterpoint, cpPosition, cpLen, results) {
        const strongIndices = this.getStrongBeatIndices(cpLen);
        if (strongIndices.length < 3) return;

        for (let si = 0; si < strongIndices.length - 2; si++) {
            const idx1 = strongIndices[si];
            const cp1 = counterpoint[idx1];
            if (cp1 === null) continue;

            const cf1 = this.getCFNote(idx1, cf);
            const interval1 = Interval.between(
                cpPosition === 'upper' ? cf1 : cp1,
                cpPosition === 'upper' ? cp1 : cf1
            );

            if (!Interval.isPerfectConsonance(interval1) || interval1.simple.name === 'P1') continue;

            // Check 2-3 strong beats ahead
            for (let gap = 2; gap <= Math.min(3, strongIndices.length - si - 1); gap++) {
                const idx2 = strongIndices[si + gap];
                const cp2 = counterpoint[idx2];
                if (cp2 === null) continue;

                const cf2 = this.getCFNote(idx2, cf);
                const interval2 = Interval.between(
                    cpPosition === 'upper' ? cf2 : cp2,
                    cpPosition === 'upper' ? cp2 : cf2
                );

                if (interval1.simple.name === interval2.simple.name) {
                    const cfDir = Math.sign(Pitch.toMidi(cf2) - Pitch.toMidi(cf1));
                    const cpDir = Math.sign(Pitch.toMidi(cp2) - Pitch.toMidi(cp1));

                    if (cfDir === cpDir && cfDir !== 0) {
                        // Exception: leap of 4th/5th with contrary approach
                        const prevStrongIdx = strongIndices[si + gap - 1];
                        const prevCp = counterpoint[prevStrongIdx];
                        if (prevCp !== null) {
                            const cpLeap = Math.abs(Pitch.toMidi(cp2) - Pitch.toMidi(prevCp));
                            const prevCF = this.getCFNote(prevStrongIdx, cf);
                            const approachMotion = this.getMotionType(prevCF, cf2, prevCp, cp2);

                            if (cpLeap >= 5 && cpLeap <= 7 && approachMotion === 'contrary') {
                                continue;
                            }
                        }

                        const intervalName = interval1.simple.name === 'P5' ? 'quintas' : 'octavas';
                        const rule = interval1.simple.name === 'P5' ?
                            this.RULES.BATTUTA_FIFTHS : this.RULES.BATTUTA_OCTAVES;

                        const issue = {
                            rule,
                            position: idx2,
                            message: `Notas ${idx1 + 1} y ${idx2 + 1}: ${intervalName.charAt(0).toUpperCase() + intervalName.slice(1)} intermitentes en tiempos fuertes (separadas por ${gap - 1} compás/es).`,
                            severity: this.SEVERITY.WARNING
                        };
                        results.warnings.push(issue);
                    }
                }
            }
        }
    },

    // =========================================================================
    // SCORING
    // =========================================================================

    /**
     * Calculate score based on issues
     * Adjusted for second species having more notes (and thus more potential issues)
     */
    calculateScore(results) {
        let score = 100;

        // Errors: -10 points each (slightly less than 1st species due to more notes)
        score -= results.errors.length * 10;

        // Warnings: -4 points each
        score -= results.warnings.length * 4;

        // Suggestions: -1 point each
        score -= results.suggestions.length;

        return Math.max(0, score);
    }
};

// Export for ES modules or make global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecondSpeciesValidator;
}
