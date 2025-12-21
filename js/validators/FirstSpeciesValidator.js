/**
 * FirstSpeciesValidator.js - First Species Counterpoint Rules
 *
 * First Species: Note against note (1:1 ratio)
 * All rules from Schoenberg's "Ejercicios preliminares de contrapunto"
 *
 * REGLAS FUNDAMENTALES:
 * 1. Solo consonancias en cada tiempo (P1, P5, P8, m3, M3, m6, M6)
 * 2. Sin quintas ni octavas paralelas
 * 3. Sin quintas ni octavas directas/ocultas
 * 4. Comenzar y terminar en consonancia perfecta
 * 5. Cadencia apropiada al final
 * 6. Sin cruce de voces
 * 7. Unísonos solo al inicio/final
 * 8. Preferir movimiento contrario
 * 9. Preferir movimiento por grado conjunto
 * 10. Rango limitado para el contrapunto
 * 11. Sin tritono melódico
 */

const FirstSpeciesValidator = {
    // Rule identifiers for UI feedback
    RULES: {
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
        LEADING_TONE: 'leading-tone'
    },

    // Severity levels
    SEVERITY: {
        ERROR: 'error',       // Must fix
        WARNING: 'warning',   // Should fix
        SUGGESTION: 'suggestion'  // Nice to fix
    },

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

    /**
     * Validate a complete exercise
     * @param {Object} exercise - { cantusFirmus, counterpoint, key, mode, cpPosition }
     * @returns {Object} { valid, score, errors, warnings, suggestions }
     */
    validate(exercise) {
        const { cantusFirmus, counterpoint, key, mode = 'major', cpPosition = 'upper' } = exercise;
        const results = {
            valid: true,
            score: 100,
            errors: [],
            warnings: [],
            suggestions: [],
            noteResults: []  // Per-note feedback
        };

        // Ensure arrays are same length
        if (cantusFirmus.length !== counterpoint.length) {
            results.errors.push({
                rule: 'LENGTH',
                message: 'Cantus firmus y contrapunto deben tener la misma longitud',
                severity: this.SEVERITY.ERROR
            });
            results.valid = false;
            return results;
        }

        const length = cantusFirmus.length;

        // Initialize per-note results
        for (let i = 0; i < length; i++) {
            results.noteResults[i] = { valid: true, issues: [] };
        }

        // Check each note position
        for (let i = 0; i < length; i++) {
            const cf = cantusFirmus[i];
            const cp = counterpoint[i];
            const interval = Interval.between(
                cpPosition === 'upper' ? cf : cp,
                cpPosition === 'upper' ? cp : cf
            );

            // Rule 1: Only consonances
            this.checkConsonance(interval, i, results);

            // Rule 7: Unisons only at beginning/end
            this.checkUnison(interval, i, length, results);

            // Rule 6: Voice crossing
            this.checkVoiceCrossing(cf, cp, cpPosition, i, results);

            // Check melodic issues in counterpoint
            if (i > 0) {
                const prevCf = cantusFirmus[i - 1];
                const prevCp = counterpoint[i - 1];
                const prevInterval = Interval.between(
                    cpPosition === 'upper' ? prevCf : prevCp,
                    cpPosition === 'upper' ? prevCp : prevCf
                );

                // Rule 2 & 3: Parallel and hidden fifths/octaves
                this.checkParallels(prevInterval, interval, prevCf, cf, prevCp, cp, i, results);

                // Rule 11: Tritone in melody
                this.checkMelodicTritone(prevCp, cp, i, results);

                // Rule 8: Motion type analysis
                this.analyzeMotion(prevCf, cf, prevCp, cp, i, results);

                // Rule 9: Stepwise preference
                this.checkStepwise(prevCp, cp, i, results);
            }
        }

        // Rule 4: Start on perfect consonance
        this.checkStartInterval(cantusFirmus[0], counterpoint[0], cpPosition, results);

        // Rule 5: End on perfect consonance with proper cadence
        this.checkEndInterval(cantusFirmus, counterpoint, key, mode, cpPosition, results);

        // Rule 10: Range check
        this.checkRange(counterpoint, cpPosition, results);

        // Calculate final score
        results.score = this.calculateScore(results);
        results.valid = results.errors.length === 0;

        return results;
    },

    /**
     * Rule 1: Check that interval is consonant
     */
    checkConsonance(interval, position, results) {
        if (Interval.isDissonant(interval)) {
            const issue = {
                rule: this.RULES.CONSONANCE,
                position,
                message: `Nota ${position + 1}: ${Interval.spanishName(interval)} es disonante. Solo se permiten consonancias.`,
                severity: this.SEVERITY.ERROR,
                interval: interval.name
            };
            results.errors.push(issue);
            results.noteResults[position].valid = false;
            results.noteResults[position].issues.push(issue);
        }
    },

    /**
     * Rule 7: Unisons only at beginning and end
     */
    checkUnison(interval, position, length, results) {
        if (interval.simple.name === 'P1' && position !== 0 && position !== length - 1) {
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
     * Rule 6: No voice crossing
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
     * Rules 2 & 3: Check parallel and hidden fifths/octaves
     */
    checkParallels(prevInterval, currInterval, prevCf, currCf, prevCp, currCp, position, results) {
        const motion = this.getMotionType(prevCf, currCf, prevCp, currCp);

        // Perfect intervals to check
        const prevPerfect = Interval.isPerfectConsonance(prevInterval) && prevInterval.simple.name !== 'P1';
        const currPerfect = Interval.isPerfectConsonance(currInterval) && currInterval.simple.name !== 'P1';

        // Parallel fifths or octaves (same perfect interval by similar motion)
        if (prevPerfect && currPerfect &&
            prevInterval.simple.name === currInterval.simple.name &&
            motion === 'similar') {
            const intervalName = prevInterval.simple.name === 'P5' ? 'quintas' : 'octavas';
            const issue = {
                rule: prevInterval.simple.name === 'P5' ? this.RULES.PARALLEL_FIFTHS : this.RULES.PARALLEL_OCTAVES,
                position,
                message: `Nota ${position + 1}: ${intervalName.charAt(0).toUpperCase() + intervalName.slice(1)} paralelas prohibidas.`,
                severity: this.SEVERITY.ERROR
            };
            results.errors.push(issue);
            results.noteResults[position].valid = false;
            results.noteResults[position].issues.push(issue);
        }

        // Hidden (direct) fifths or octaves (approaching perfect interval by similar motion)
        if (!prevPerfect && currPerfect && motion === 'similar') {
            // Exception: if upper voice moves by step, hidden fifths/octaves are tolerated
            const cpInterval = Interval.between(prevCp, currCp);
            const isStepwise = cpInterval.simple.generic <= 2;

            if (!isStepwise) {
                const intervalName = currInterval.simple.name === 'P5' ? 'quintas' : 'octavas';
                const issue = {
                    rule: currInterval.simple.name === 'P5' ? this.RULES.HIDDEN_FIFTHS : this.RULES.HIDDEN_OCTAVES,
                    position,
                    message: `Nota ${position + 1}: ${intervalName.charAt(0).toUpperCase() + intervalName.slice(1)} ocultas (movimiento similar hacia consonancia perfecta sin grado conjunto).`,
                    severity: this.SEVERITY.WARNING
                };
                results.warnings.push(issue);
                results.noteResults[position].issues.push(issue);
            }
        }
    },

    /**
     * Rule 11: No melodic tritone
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
     * Rule 8: Analyze motion type (prefer contrary)
     */
    analyzeMotion(prevCf, currCf, prevCp, currCp, position, results) {
        const motion = this.getMotionType(prevCf, currCf, prevCp, currCp);

        // Track for statistics, suggest contrary motion
        if (motion === 'similar') {
            const issue = {
                rule: this.RULES.MOTION_TYPE,
                position,
                message: `Nota ${position + 1}: Movimiento similar. Preferir movimiento contrario u oblicuo.`,
                severity: this.SEVERITY.SUGGESTION,
                motionType: motion
            };
            results.suggestions.push(issue);
            results.noteResults[position].issues.push(issue);
        }
    },

    /**
     * Rule 9: Prefer stepwise motion
     */
    checkStepwise(prevNote, currNote, position, results) {
        const interval = Interval.between(prevNote, currNote);

        if (interval.simple.generic > 3) {  // Larger than a third
            const issue = {
                rule: this.RULES.STEPWISE,
                position,
                message: `Nota ${position + 1}: Salto de ${Interval.spanishName(interval)}. Preferir movimiento por grados conjuntos.`,
                severity: this.SEVERITY.SUGGESTION
            };
            results.suggestions.push(issue);
            results.noteResults[position].issues.push(issue);
        }

        // Leaps larger than a sixth are warnings
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
     * Rule 4: Start on perfect consonance
     */
    checkStartInterval(cf, cp, cpPosition, results) {
        const interval = Interval.between(
            cpPosition === 'upper' ? cf : cp,
            cpPosition === 'upper' ? cp : cf
        );

        if (!Interval.isPerfectConsonance(interval)) {
            const issue = {
                rule: this.RULES.START_CONSONANCE,
                position: 0,
                message: `Debe comenzar en consonancia perfecta (unísono, quinta u octava). Actual: ${Interval.spanishName(interval)}.`,
                severity: this.SEVERITY.ERROR
            };
            results.errors.push(issue);
            results.noteResults[0].valid = false;
            results.noteResults[0].issues.push(issue);
        }
    },

    /**
     * Rule 5: End on perfect consonance with proper cadence
     */
    checkEndInterval(cantusFirmus, counterpoint, key, mode, cpPosition, results) {
        const lastIdx = cantusFirmus.length - 1;
        const cf = cantusFirmus[lastIdx];
        const cp = counterpoint[lastIdx];

        const interval = Interval.between(
            cpPosition === 'upper' ? cf : cp,
            cpPosition === 'upper' ? cp : cf
        );

        // Must end on P1 or P8 (not P5)
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

        // Check cadence approach (penultimate note)
        if (lastIdx > 0) {
            const penultimateCp = counterpoint[lastIdx - 1];
            const penultimateDegree = Scale.getDegree(penultimateCp, key, mode);

            // Upper voice should approach from leading tone (degree 7) or supertonic (degree 2)
            if (cpPosition === 'upper') {
                if (penultimateDegree !== 7) {
                    const issue = {
                        rule: this.RULES.LEADING_TONE,
                        position: lastIdx - 1,
                        message: `Cadencia: voz superior debería llegar desde la sensible (grado 7). Actual: grado ${penultimateDegree}.`,
                        severity: this.SEVERITY.WARNING
                    };
                    results.warnings.push(issue);
                    results.noteResults[lastIdx - 1].issues.push(issue);
                }
            } else {
                if (penultimateDegree !== 2) {
                    const issue = {
                        rule: this.RULES.CADENCE,
                        position: lastIdx - 1,
                        message: `Cadencia: voz inferior debería llegar desde la supertónica (grado 2). Actual: grado ${penultimateDegree}.`,
                        severity: this.SEVERITY.WARNING
                    };
                    results.warnings.push(issue);
                    results.noteResults[lastIdx - 1].issues.push(issue);
                }
            }
        }
    },

    /**
     * Rule 10: Check voice range
     */
    checkRange(counterpoint, cpPosition, results) {
        const midis = counterpoint.map(n => Pitch.toMidi(n));
        const lowest = Math.min(...midis);
        const highest = Math.max(...midis);
        const range = highest - lowest;

        // Typical vocal range is about an octave + a fifth (17 semitones)
        if (range > 19) {  // More than an octave + major 6th
            const issue = {
                rule: this.RULES.RANGE,
                position: -1,  // Global issue
                message: `Rango del contrapunto muy amplio (${Pitch.fromMidi(lowest)} a ${Pitch.fromMidi(highest)}). Limitar a una décima o menos.`,
                severity: this.SEVERITY.WARNING
            };
            results.warnings.push(issue);
        }
    },

    /**
     * Calculate score based on issues
     */
    calculateScore(results) {
        let score = 100;

        // Errors: -15 points each
        score -= results.errors.length * 15;

        // Warnings: -5 points each
        score -= results.warnings.length * 5;

        // Suggestions: -1 point each
        score -= results.suggestions.length;

        return Math.max(0, score);
    },

    /**
     * Get valid notes for a position (for hint system)
     * @param {string} cfNote - Cantus firmus note at this position
     * @param {string} prevCfNote - Previous CF note (null if first)
     * @param {string} prevCpNote - Previous CP note (null if first)
     * @param {string} key - Key/tonic
     * @param {string} mode - Scale mode
     * @param {string} cpPosition - 'upper' or 'lower'
     * @param {boolean} isFirst - Is this the first note
     * @param {boolean} isLast - Is this the last note
     * @returns {Object[]} Array of { note, interval, recommended, issues }
     */
    getValidNotes(cfNote, prevCfNote, prevCpNote, key, mode, cpPosition, isFirst, isLast) {
        const cfMidi = Pitch.toMidi(cfNote);

        // Determine range based on position
        const range = cpPosition === 'upper'
            ? { low: cfMidi, high: cfMidi + 19 }  // Up to octave + fifth above
            : { low: cfMidi - 19, high: cfMidi }; // Down to octave + fifth below

        const candidates = [];

        for (let midi = range.low; midi <= range.high; midi++) {
            const note = Pitch.fromMidi(midi);

            // Must be in scale
            if (!Scale.containsNote(note, key, mode)) continue;

            const interval = Interval.between(
                cpPosition === 'upper' ? cfNote : note,
                cpPosition === 'upper' ? note : cfNote
            );

            // Must be consonant
            if (Interval.isDissonant(interval)) continue;

            const candidate = {
                note,
                interval: interval.simple.name,
                intervalName: Interval.spanishName(interval),
                issues: [],
                score: 10
            };

            // Check first/last requirements
            if (isFirst || isLast) {
                if (!Interval.isPerfectConsonance(interval)) {
                    if (isFirst) {
                        candidate.issues.push('Inicio debe ser consonancia perfecta');
                        candidate.score -= 10;
                    }
                    if (isLast && interval.simple.name !== 'P1' && interval.simple.name !== 'P8') {
                        candidate.issues.push('Final debe ser unísono u octava');
                        candidate.score -= 10;
                    }
                }
            }

            // Check unison restrictions (only ok at start/end)
            if (interval.simple.name === 'P1' && !isFirst && !isLast) {
                candidate.issues.push('Unísono solo al inicio/final');
                candidate.score -= 10;
            }

            // If not first note, check motion and parallels
            if (prevCfNote && prevCpNote) {
                const prevInterval = Interval.between(
                    cpPosition === 'upper' ? prevCfNote : prevCpNote,
                    cpPosition === 'upper' ? prevCpNote : prevCfNote
                );

                const motion = this.getMotionType(prevCfNote, cfNote, prevCpNote, note);

                // Check parallel fifths/octaves
                if (Interval.isPerfectConsonance(prevInterval) &&
                    Interval.isPerfectConsonance(interval) &&
                    prevInterval.simple.name === interval.simple.name &&
                    prevInterval.simple.name !== 'P1' &&
                    motion === 'similar') {
                    candidate.issues.push('Crearía quintas/octavas paralelas');
                    candidate.score -= 10;
                }

                // Check melodic tritone
                const melodicInterval = Interval.between(prevCpNote, note);
                if (Interval.isTritone(melodicInterval)) {
                    candidate.issues.push('Crearía tritono melódico');
                    candidate.score -= 10;
                }

                // Prefer contrary motion
                if (motion === 'contrary') {
                    candidate.score += 2;
                } else if (motion === 'oblique') {
                    candidate.score += 1;
                }

                // Prefer stepwise
                if (melodicInterval.simple.generic <= 2) {
                    candidate.score += 2;
                } else if (melodicInterval.simple.generic <= 3) {
                    candidate.score += 1;
                } else if (melodicInterval.simple.generic > 5) {
                    candidate.issues.push('Salto grande');
                    candidate.score -= 2;
                }
            }

            // Prefer imperfect consonances (more variety)
            if (Interval.isImperfectConsonance(interval)) {
                candidate.score += 1;
            }

            candidates.push(candidate);
        }

        // Sort by score descending
        candidates.sort((a, b) => b.score - a.score);

        return candidates;
    }
};

// Export for ES modules or make global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirstSpeciesValidator;
}
