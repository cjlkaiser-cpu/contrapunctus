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
 *
 * REGLAS ADICIONALES (Schoenberg §7):
 * 12. Sin tritonos compuestos (§7c) - notas entre grados 4 y 7
 * 13. Sin saltos disonantes compuestos (§7e) - dos saltos que sumen disonancia
 * 14. Sin paralelas intermitentes (§8) - 5as/8as separadas por otra armonía
 * 15. Sin dirección prolongada (§7f) - máx 8-9 notas en una dirección
 * 16. Evitar arpegios (§7h) - 3+ notas de un acorde
 * 17. Evitar terceras/sextas paralelas excesivas
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
        LEADING_TONE: 'leading-tone',
        // New Schoenberg rules
        COMPOUND_TRITONE: 'compound-tritone',
        COMPOUND_DISSONANT_LEAP: 'compound-dissonant-leap',
        BATTUTA_FIFTHS: 'battuta-fifths',
        BATTUTA_OCTAVES: 'battuta-octaves',
        PROLONGED_DIRECTION: 'prolonged-direction',
        ARPEGGIO: 'arpeggio',
        EXCESSIVE_PARALLELS: 'excessive-parallels'
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

        // =====================================================
        // NEW SCHOENBERG RULES (§7)
        // =====================================================

        // Rule 12: Compound tritones (§7c)
        this.checkCompoundTritones(counterpoint, key, mode, results);

        // Rule 13: Compound dissonant leaps (§7e)
        this.checkCompoundDissonantLeaps(counterpoint, results);

        // Rule 14: Battuta (intermittent) fifths/octaves (§8)
        this.checkBattutaParallels(cantusFirmus, counterpoint, cpPosition, results);

        // Rule 15: Prolonged direction (§7f)
        this.checkProlongedDirection(counterpoint, results);

        // Rule 16: Arpeggios (§7h)
        this.checkArpeggios(counterpoint, key, mode, results);

        // Rule 17: Excessive parallel thirds/sixths
        this.checkExcessiveParallelConsonances(cantusFirmus, counterpoint, cpPosition, results);

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

    // =====================================================
    // NEW SCHOENBERG RULES (§7) - IMPLEMENTATIONS
    // =====================================================

    /**
     * Rule 12: Check for compound tritones (§7c)
     * A compound tritone occurs when notes between scale degrees 4 and 7
     * (or 7 and 4) are filled in with other notes, creating a hidden tritone
     */
    checkCompoundTritones(counterpoint, key, mode, results) {
        if (counterpoint.length < 3) return;

        for (let i = 0; i < counterpoint.length - 2; i++) {
            // Check spans of 3-5 notes for compound tritones
            for (let span = 3; span <= Math.min(5, counterpoint.length - i); span++) {
                const startNote = counterpoint[i];
                const endNote = counterpoint[i + span - 1];

                const startDegree = Scale.getDegree(startNote, key, mode);
                const endDegree = Scale.getDegree(endNote, key, mode);

                // Check if we span from degree 4 to 7 or 7 to 4
                if ((startDegree === 4 && endDegree === 7) ||
                    (startDegree === 7 && endDegree === 4)) {

                    // Verify intermediate notes are between them (filling the tritone)
                    const interval = Interval.between(startNote, endNote);
                    if (Interval.isTritone(interval)) {
                        const issue = {
                            rule: this.RULES.COMPOUND_TRITONE,
                            position: i,
                            message: `Notas ${i + 1}-${i + span}: Tritono compuesto entre grados 4 y 7. Evitar progresiones que contengan el tritono de forma encubierta.`,
                            severity: this.SEVERITY.WARNING
                        };
                        results.warnings.push(issue);
                        break; // Only report once per starting position
                    }
                }
            }
        }
    },

    /**
     * Rule 13: Check for compound dissonant leaps (§7e)
     * Two consecutive leaps in the same direction that sum to a dissonant interval
     * e.g., 4th + 4th = 7th, 3rd + 5th = 7th, etc.
     */
    checkCompoundDissonantLeaps(counterpoint, results) {
        if (counterpoint.length < 3) return;

        for (let i = 0; i < counterpoint.length - 2; i++) {
            const note1 = counterpoint[i];
            const note2 = counterpoint[i + 1];
            const note3 = counterpoint[i + 2];

            const interval1 = Interval.between(note1, note2);
            const interval2 = Interval.between(note2, note3);

            // Check if both are leaps (larger than a second)
            if (interval1.simple.generic > 2 && interval2.simple.generic > 2) {
                // Check if same direction
                const dir1 = Math.sign(Pitch.toMidi(note2) - Pitch.toMidi(note1));
                const dir2 = Math.sign(Pitch.toMidi(note3) - Pitch.toMidi(note2));

                if (dir1 === dir2 && dir1 !== 0) {
                    // Calculate compound interval
                    const compoundInterval = Interval.between(note1, note3);

                    // Check if the compound interval is dissonant (7th, 9th, etc.)
                    if (Interval.isDissonant(compoundInterval) ||
                        compoundInterval.simple.generic === 7 ||
                        compoundInterval.simple.generic === 9) {
                        const issue = {
                            rule: this.RULES.COMPOUND_DISSONANT_LEAP,
                            position: i + 2,
                            message: `Notas ${i + 1}-${i + 3}: Saltos disonantes compuestos (${Interval.spanishName(interval1)} + ${Interval.spanishName(interval2)} = ${Interval.spanishName(compoundInterval)}). Evitar dos saltos en la misma dirección que sumen una disonancia.`,
                            severity: this.SEVERITY.WARNING
                        };
                        results.warnings.push(issue);
                    }
                }
            }
        }
    },

    /**
     * Rule 14: Check for battuta (intermittent) fifths and octaves (§8)
     * Perfect consonances separated by one or more intervening harmonies
     * These are less severe than direct parallels but should still be avoided
     */
    checkBattutaParallels(cantusFirmus, counterpoint, cpPosition, results) {
        if (cantusFirmus.length < 3) return;

        // Look for 5ths or 8ths separated by 1-2 other intervals
        for (let i = 0; i < cantusFirmus.length - 2; i++) {
            const interval1 = Interval.between(
                cpPosition === 'upper' ? cantusFirmus[i] : counterpoint[i],
                cpPosition === 'upper' ? counterpoint[i] : cantusFirmus[i]
            );

            // Only check if first is a perfect 5th or 8th
            if (!Interval.isPerfectConsonance(interval1) || interval1.simple.name === 'P1') continue;

            // Check 2-3 positions ahead
            for (let gap = 2; gap <= Math.min(3, cantusFirmus.length - i - 1); gap++) {
                const interval2 = Interval.between(
                    cpPosition === 'upper' ? cantusFirmus[i + gap] : counterpoint[i + gap],
                    cpPosition === 'upper' ? counterpoint[i + gap] : cantusFirmus[i + gap]
                );

                // Check if same perfect interval
                if (interval1.simple.name === interval2.simple.name) {
                    // Check motion between them
                    const cfDir = Math.sign(Pitch.toMidi(cantusFirmus[i + gap]) - Pitch.toMidi(cantusFirmus[i]));
                    const cpDir = Math.sign(Pitch.toMidi(counterpoint[i + gap]) - Pitch.toMidi(counterpoint[i]));

                    // Battuta parallels in similar motion are problematic
                    if (cfDir === cpDir && cfDir !== 0) {
                        const intervalName = interval1.simple.name === 'P5' ? 'quintas' : 'octavas';
                        const rule = interval1.simple.name === 'P5' ?
                            this.RULES.BATTUTA_FIFTHS : this.RULES.BATTUTA_OCTAVES;

                        // Exception: if there's a leap of 4th or 5th and contrary approach
                        const cpLeap = Math.abs(Pitch.toMidi(counterpoint[i + gap]) - Pitch.toMidi(counterpoint[i + gap - 1]));
                        const approachMotion = this.getMotionType(
                            cantusFirmus[i + gap - 1], cantusFirmus[i + gap],
                            counterpoint[i + gap - 1], counterpoint[i + gap]
                        );

                        if (cpLeap >= 5 && cpLeap <= 7 && approachMotion === 'contrary') {
                            // Beethoven exception: tolerable if leap of 4th/5th with contrary approach
                            continue;
                        }

                        const issue = {
                            rule,
                            position: i + gap,
                            message: `Notas ${i + 1} y ${i + gap + 1}: ${intervalName.charAt(0).toUpperCase() + intervalName.slice(1)} intermitentes (paralelas ocultas separadas por ${gap - 1} nota(s)).`,
                            severity: this.SEVERITY.WARNING
                        };
                        results.warnings.push(issue);
                    }
                }
            }
        }
    },

    /**
     * Rule 15: Check for prolonged direction (§7f)
     * More than 8-9 notes in the same direction should be avoided
     */
    checkProlongedDirection(counterpoint, results) {
        if (counterpoint.length < 4) return;

        let currentDirection = 0;
        let directionCount = 1;
        let startPosition = 0;

        for (let i = 1; i < counterpoint.length; i++) {
            const direction = Math.sign(Pitch.toMidi(counterpoint[i]) - Pitch.toMidi(counterpoint[i - 1]));

            if (direction === 0) {
                // Same note, doesn't change direction count
                continue;
            }

            if (direction === currentDirection) {
                directionCount++;
            } else {
                // Direction changed, check if previous run was too long
                if (directionCount > 8) {
                    const dirName = currentDirection > 0 ? 'ascendente' : 'descendente';
                    const issue = {
                        rule: this.RULES.PROLONGED_DIRECTION,
                        position: startPosition,
                        message: `Notas ${startPosition + 1}-${i}: ${directionCount} notas en dirección ${dirName}. Máximo recomendado: 8-9. Equilibrar con movimiento en dirección opuesta.`,
                        severity: this.SEVERITY.WARNING
                    };
                    results.warnings.push(issue);
                }
                currentDirection = direction;
                directionCount = 1;
                startPosition = i - 1;
            }
        }

        // Check final run
        if (directionCount > 8) {
            const dirName = currentDirection > 0 ? 'ascendente' : 'descendente';
            const issue = {
                rule: this.RULES.PROLONGED_DIRECTION,
                position: startPosition,
                message: `Notas ${startPosition + 1}-${counterpoint.length}: ${directionCount} notas en dirección ${dirName}. Máximo recomendado: 8-9.`,
                severity: this.SEVERITY.WARNING
            };
            results.warnings.push(issue);
        }
    },

    /**
     * Rule 16: Check for arpeggiated patterns (§7h)
     * Three or more consecutive notes outlining a chord
     */
    checkArpeggios(counterpoint, key, mode, results) {
        if (counterpoint.length < 3) return;

        for (let i = 0; i < counterpoint.length - 2; i++) {
            const note1 = counterpoint[i];
            const note2 = counterpoint[i + 1];
            const note3 = counterpoint[i + 2];

            // Get scale degrees
            const degree1 = Scale.getDegree(note1, key, mode);
            const degree2 = Scale.getDegree(note2, key, mode);
            const degree3 = Scale.getDegree(note3, key, mode);

            if (!degree1 || !degree2 || !degree3) continue;

            // Check for triad patterns (1-3-5, 2-4-6, etc.)
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

                    // Verify it's actually arpeggiated (all moves are leaps, not steps)
                    const int1 = Interval.between(note1, note2);
                    const int2 = Interval.between(note2, note3);

                    if (int1.simple.generic >= 3 && int2.simple.generic >= 3) {
                        const issue = {
                            rule: this.RULES.ARPEGGIO,
                            position: i,
                            message: `Notas ${i + 1}-${i + 3}: Acorde arpegiado (grados ${degree1}-${degree2}-${degree3}). Evitar sucesión de notas de un acorde que restrinja el movimiento de otras voces.`,
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
     * Rule 17: Check for excessive parallel thirds or sixths
     * More than 4-5 consecutive thirds or sixths in parallel motion
     */
    checkExcessiveParallelConsonances(cantusFirmus, counterpoint, cpPosition, results) {
        if (cantusFirmus.length < 4) return;

        let consecutiveThirds = 0;
        let consecutiveSixths = 0;
        let thirdsStart = 0;
        let sixthsStart = 0;

        for (let i = 0; i < cantusFirmus.length; i++) {
            const interval = Interval.between(
                cpPosition === 'upper' ? cantusFirmus[i] : counterpoint[i],
                cpPosition === 'upper' ? counterpoint[i] : cantusFirmus[i]
            );

            const isThird = interval.simple.name === 'm3' || interval.simple.name === 'M3';
            const isSixth = interval.simple.name === 'm6' || interval.simple.name === 'M6';

            if (isThird) {
                if (consecutiveThirds === 0) thirdsStart = i;
                consecutiveThirds++;
                consecutiveSixths = 0;
            } else if (isSixth) {
                if (consecutiveSixths === 0) sixthsStart = i;
                consecutiveSixths++;
                consecutiveThirds = 0;
            } else {
                // Check if we exceeded the limit before resetting
                if (consecutiveThirds > 4) {
                    const issue = {
                        rule: this.RULES.EXCESSIVE_PARALLELS,
                        position: thirdsStart,
                        message: `Notas ${thirdsStart + 1}-${i}: ${consecutiveThirds} terceras paralelas consecutivas. Limitar a 4 para mantener independencia de voces.`,
                        severity: this.SEVERITY.SUGGESTION
                    };
                    results.suggestions.push(issue);
                }
                if (consecutiveSixths > 4) {
                    const issue = {
                        rule: this.RULES.EXCESSIVE_PARALLELS,
                        position: sixthsStart,
                        message: `Notas ${sixthsStart + 1}-${i}: ${consecutiveSixths} sextas paralelas consecutivas. Limitar a 4 para mantener independencia de voces.`,
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
            const issue = {
                rule: this.RULES.EXCESSIVE_PARALLELS,
                position: thirdsStart,
                message: `Notas ${thirdsStart + 1}-${cantusFirmus.length}: ${consecutiveThirds} terceras paralelas consecutivas.`,
                severity: this.SEVERITY.SUGGESTION
            };
            results.suggestions.push(issue);
        }
        if (consecutiveSixths > 4) {
            const issue = {
                rule: this.RULES.EXCESSIVE_PARALLELS,
                position: sixthsStart,
                message: `Notas ${sixthsStart + 1}-${cantusFirmus.length}: ${consecutiveSixths} sextas paralelas consecutivas.`,
                severity: this.SEVERITY.SUGGESTION
            };
            results.suggestions.push(issue);
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
