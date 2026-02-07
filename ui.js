/**
 * UI class for Maths Facts Challenge DOM manipulation and rendering
 * Handles all user interface interactions, question display, and visual feedback
 * Manages screen transitions, input handling, and dynamic content rendering
 */
import { createEl } from './utils.js';
import { Timer, StorageManager } from './gameState.js';
import * as ConfigUtils from './configUtils.js';

export class UI {
    constructor() {
        this.elements = {
            settingsScreen: document.getElementById('settings-screen'),
            gameScreen: document.getElementById('game-screen'),
            successScreen: document.getElementById('success-screen'),
            levelSelection: document.getElementById('level-selection-container'),
            streakCounter: document.getElementById('streak-counter'),
            timer: document.getElementById('timer'),
            timerPausedMessage: document.getElementById('timer-paused-message'),
            questionText: document.getElementById('question-text'),
            feedbackMessage: document.getElementById('feedback-message'),
            quitBtn: document.getElementById('quit-btn'),
            playAgainBtn: document.getElementById('play-again-btn'),
            completedLevel: document.getElementById('completed-level'),
            finalTime: document.getElementById('final-time'),
            finalRating: document.getElementById('final-rating'),
            bestTimeMessage: document.getElementById('best-time-message'),
            skillPath: document.getElementById('skill-path'),
            skillPathContainer: document.getElementById('skill-path-container'),
            masteryProgressBars: document.getElementById('mastery-progress-bars'),
            toggleGridView: document.getElementById('toggle-grid-view'),
            replayLevelBtn: document.getElementById('replay-level-btn'),
            ratingExplanation: document.getElementById('rating-explanation'),
            levelName: document.getElementById('level-name'),
        };
        this.onBackToLevels = null;
        this.questionRenderers = {
            '{{EQUIV_FRACTION_CHALLENGE}}': this._renderEquivFraction,
            '{{SIMPLIFY_FRACTION_CHALLENGE}}': this._renderSimplifyFraction,
            '{{FDP_CONVERSION_CHALLENGE}}': this._renderFDPConversion,
            '{{UNIT_CONVERSION}}': this._renderUnitConversion,
            'default': this._renderDefaultQuestion
        };
        this.currentView = 'skill-path'; // 'skill-path' or 'grid'
        this.setupToggleGridView();
        this.setupSuccessScreenButtons();
        this.setupHorizontalScrolling();
    }

    setupSuccessScreenButtons() {
        // Replay Level button
        if (this.elements.replayLevelBtn) {
            this.elements.replayLevelBtn.addEventListener('click', () => {
                if (this.onReplayLevel) {
                    this.onReplayLevel();
                }
            });
        }

        // Back to Levels button
        if (this.elements.playAgainBtn) {
            this.elements.playAgainBtn.addEventListener('click', () => {
                if (this.onBackToLevels) {
                    this.onBackToLevels();
                }
            });
        }

        // Keyboard shortcuts for success screen
        this.handleSuccessScreenKey = (e) => {
            // Only handle keys if success screen is visible
            if (this.elements.successScreen.classList.contains('hidden')) {
                return;
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.onReplayLevel) {
                    this.onReplayLevel();
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                if (this.onBackToLevels) {
                    this.onBackToLevels();
                }
            }
        };
        document.addEventListener('keydown', this.handleSuccessScreenKey);
    }

    // Set callback functions for success screen buttons
    setSuccessScreenCallbacks(onReplayLevel, onBackToLevels) {
        this.onReplayLevel = onReplayLevel;
        this.onBackToLevels = onBackToLevels;
    }

    showScreen(screenName) {
        ['settings', 'game', 'success'].forEach(s => {
            this.elements[`${s}Screen`].classList.toggle('hidden', s !== screenName);
        });
    }

    renderLevelGrid(levelGroups, onSelect) {
        this.elements.levelSelection.innerHTML = '';
        for (const groupName in levelGroups) {
            const title = createEl('h2', { className: 'level-section-title', textContent: groupName });
            const grid = createEl('div', { className: 'level-grid' });
            
            levelGroups[groupName].forEach(level => {
                const bestTime = StorageManager.getBestTime(level.key);
                const rating = bestTime ? StorageManager.getRating(bestTime, level.key) : null;
                const ratingClass = rating ? `rating-${rating.key}` : 'rating-none';
                
                const btn = createEl('div', { className: `level-btn ${ratingClass}` });
                btn.dataset.levelKey = level.key;
                
                const levelTitle = createEl('div', { className: 'level-title', textContent: level.name });
                const bestTimeText = createEl('div', { 
                    className: 'best-time', 
                    textContent: bestTime ? `Best: ${new Timer().formatTime(bestTime)}` : 'No time set'
                });

                btn.append(levelTitle, bestTimeText);
                btn.addEventListener('click', () => {
                    const level = Object.values(levelGroups).flat().find(l => l.key === btn.dataset.levelKey);
                    onSelect(level);
                });
                grid.append(btn);
            });
            this.elements.levelSelection.append(title, grid);
        }
    }

    displayQuestion(question, levelKey) {
        this.elements.questionText.innerHTML = '';
        const renderer = this.questionRenderers[question.format] || this.questionRenderers.default;
        renderer.call(this, question, levelKey);
        const input = this.elements.questionText.querySelector('input');
        if (input) input.focus();
    }
    
    // --- Question Renderers ---

    _renderDefaultQuestion(question, levelKey) {
        const parts = question.format.split('{{INPUT}}');
        const frag = document.createDocumentFragment();

        if (parts[0]) {
            const part1El = createEl('span');
            katex.render(parts[0], part1El, { throwOnError: false });
            frag.append(part1El);
        }

        const inputOptions = { type: 'number', className: 'inline-input', step: 'any', autocomplete: 'off' };
        if (levelKey === 'powersOf10' || levelKey === 'unitConversions' || levelKey === 'multiplyDivideBy100') {
            inputOptions.style = { width: '12rem' }; // Increased width for this level
        }
        const inputEl = createEl('input', inputOptions);
        frag.append(inputEl);
        
        if (parts[1]) {
            const part2El = createEl('span');
            katex.render(parts[1], part2El, { throwOnError: false });
            frag.append(part2El);
        }
        this.elements.questionText.append(frag);
    }

    _createFraction(num, den, isInput = false) {
        const container = createEl('div', { className: 'fraction-container' });
        let numEl, denEl;
        if (isInput) {
             numEl = createEl('input', { type: 'number', id: 'input-fraction-num', className: 'inline-input', width: '5rem', autocomplete: 'off' });
             denEl = createEl('input', { type: 'number', id: 'input-fraction-den', className: 'inline-input', width: '5rem', autocomplete: 'off' });
        } else {
             numEl = createEl('span', { className: 'fraction-numerator'});
             katex.render(String(num), numEl, { throwOnError: false });
             denEl = createEl('span', { className: 'fraction-denominator'});
             katex.render(String(den), denEl, { throwOnError: false });
        }
        container.append(numEl, denEl);
        return container;
    }

    _renderEquivFraction(question) {
        const qp = question.questionParts;
        const leftFraction = this._createFraction(qp.baseNum, qp.baseDen);
        leftFraction.style.fontSize = '2.5rem';

        const equals = createEl('span', { className: 'mx-4' });
        katex.render('=', equals, { throwOnError: false, displayMode: true });

        const rightFraction = createEl('div', { className: 'fraction-container', style: { fontSize: '2.5rem' } });
        
        let numContent, denContent;
        const inputOptions = {type: 'number', className: 'inline-input', style: {width: '5rem'}, autocomplete: 'off'};

        if (qp.equivNum === null) {
            numContent = createEl('input', inputOptions);
        } else {
            numContent = createEl('span');
            katex.render(String(qp.equivNum), numContent, { throwOnError: false });
        }
        
        if (qp.equivDen === null) {
            denContent = createEl('input', inputOptions);
        } else {
            denContent = createEl('span');
            katex.render(String(qp.equivDen), denContent, { throwOnError: false });
        }

        const numContainer = createEl('span', { className: 'fraction-numerator' });
        numContainer.append(numContent);
        const denContainer = createEl('span', { className: 'fraction-denominator' });
        denContainer.append(denContent);
        rightFraction.append(numContainer, denContainer);
        
        this.elements.questionText.append(leftFraction, equals, rightFraction);
    }
    
    _renderSimplifyFraction(question) {
        const qp = question.questionParts;
        const leftFraction = this._createFraction(qp.complexNum, qp.complexDen);
        leftFraction.style.fontSize = '2.5rem';
        const equals = createEl('span', { className: 'mx-4' });
        katex.render('=', equals, { throwOnError: false, displayMode: true });
        const rightFraction = this._createFraction(null, null, true);
        this.elements.questionText.append(leftFraction, equals, rightFraction);
    }

    _renderFDPConversion(question) {
        const parts = question.questionParts;
        const table = createEl('table', { className: 'fdp-table' });
        table.innerHTML = `<thead><tr><th>Fraction</th><th>Decimal</th><th>Percentage</th></tr></thead>`;
        const tbody = createEl('tbody');
        const tr = createEl('tr');

        const tdFraction = createEl('td');
        const tdDecimal = createEl('td');
        const tdPercentage = createEl('td');
        const inputOptions = { type: 'number', className: 'inline-input', step: 'any', autocomplete: 'off' };

        if (parts.givenType === 'recurring') {
            tdFraction.append(this._createFraction(null, null, true));

            const decimalSpan = createEl('span');
            katex.render(parts.values.decimal, decimalSpan, { throwOnError: false });
            tdDecimal.append(decimalSpan);

            const percentageSpan = createEl('span');
            katex.render(parts.values.percentage, percentageSpan, { throwOnError: false });
            tdPercentage.append(percentageSpan);

        } else {
            // Fraction Cell
            if (parts.givenType === 'fraction') {
                const fractionEl = this._createFraction(parts.fraction.num, parts.fraction.den);
                fractionEl.style.fontSize = '1.5rem';
                tdFraction.append(fractionEl);
            } else {
                tdFraction.append(this._createFraction(null, null, true));
            }

            // Decimal Cell
            if (parts.givenType === 'decimal') {
                const decimalSpan = createEl('span', { style: { fontSize: '1.5rem' } });
                katex.render(String(parts.decimal), decimalSpan, { throwOnError: false });
                tdDecimal.append(decimalSpan);
            } else {
                tdDecimal.append(createEl('input', { ...inputOptions, id: 'input-decimal' }));
            }

            // Percentage Cell
            if (parts.givenType === 'percentage') {
                const percentageSpan = createEl('span', { style: { fontSize: '1.5rem' } });
                katex.render(String(parts.percentage) + '\\%', percentageSpan, { throwOnError: false });
                tdPercentage.append(percentageSpan);
            } else {
                const container = createEl('div', { className: 'percentage-cell' });
                const input = createEl('input', { ...inputOptions, id: 'input-percentage' });
                const symbol = createEl('span', { style: { fontSize: '1.5rem' } });
                katex.render('\\%', symbol, { throwOnError: false });
                container.append(input, symbol);
                tdPercentage.append(container);
            }
        }

        tr.append(tdFraction, tdDecimal, tdPercentage);
        tbody.append(tr);
        table.append(tbody);
        this.elements.questionText.append(table);
    }

    _renderUnitConversion(question) {
        const frag = document.createDocumentFragment();

        // Helper function to convert units to plain text with unicode powers
        const convertUnitToPlainText = (unit) => {
            return unit
                .replace(/²/g, '²')  // Keep unicode superscript 2
                .replace(/³/g, '³')  // Keep unicode superscript 3
                .replace(/\^2/g, '²')  // Convert ^2 to unicode superscript 2
                .replace(/\^3/g, '³')  // Convert ^3 to unicode superscript 3
                .replace(/km²/g, 'km²')
                .replace(/m²/g, 'm²')
                .replace(/cm²/g, 'cm²')
                .replace(/mm²/g, 'mm²');
        };

        // Source unit - plain text with unicode powers
        const sourceUnitSpan = createEl('span', { style: { fontSize: '2rem', marginRight: '0.5rem' } });
        sourceUnitSpan.textContent = convertUnitToPlainText(question.sourceUnit);
        frag.append(sourceUnitSpan);

        // Operation dropdown (multiply/divide)
        const operationSelect = createEl('select', {
            id: 'input-unit-operation',
            className: 'unit-conversion-select',
            style: { marginRight: '0.5rem', marginLeft: '0.5rem', fontSize: '1.5rem', border: '1px solid #999', borderRadius: '4px', padding: '4px', color: '#0066cc' }
        });
        const multiplyOption = createEl('option', { value: 'multiply', textContent: '×' });
        const divideOption = createEl('option', { value: 'divide', textContent: '÷' });
        operationSelect.append(multiplyOption, divideOption);
        frag.append(operationSelect);

        // Factor dropdown
        const factorSelect = createEl('select', {
            id: 'input-unit-factor',
            className: 'unit-conversion-select',
            style: { marginRight: '0.5rem', marginLeft: '0.5rem', fontSize: '1.5rem', border: '1px solid #999', borderRadius: '4px', padding: '4px', color: '#0066cc', textAlign: 'right' }
        });
        // Add placeholder option
        const placeholderOption = createEl('option', { value: '', textContent: 'factor', disabled: true, selected: true });
        factorSelect.append(placeholderOption);

        question.factorOptions.forEach(factor => {
            // Handle both objects (area) and primitives (other types)
            let label, optionValue;
            if (typeof factor === 'object' && factor.display) {
                // Area conversion option with display and value
                label = factor.display;
                optionValue = factor.value;
            } else {
                // Other conversion types (time, length, mass, capacity)
                label = typeof factor === 'string' ? factor : factor.toString();
                optionValue = factor;
            }

            // Convert caret notation to unicode superscripts
            label = label.replace(/\^(\d+)/g, (_, exponent) => {
                const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
                return exponent.split('').map(digit => superscripts[digit]).join('');
            });
            // Add half spaces for readability in large numbers (e.g., 10000 -> 10 000)
            // This regex adds spaces every 3 digits from the right, but skip if it has superscripts
            if (!label.match(/[⁰-⁹]/)) {
                label = label.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            }
            const option = createEl('option', { value: optionValue, textContent: label });
            factorSelect.append(option);
        });
        frag.append(factorSelect);

        // Target unit - plain text with unicode powers
        const equals = createEl('span', { style: { marginRight: '0.5rem', marginLeft: '0.5rem' } });
        equals.textContent = '=';
        frag.append(equals);

        const targetUnitSpan = createEl('span', { style: { fontSize: '2rem' } });
        targetUnitSpan.textContent = convertUnitToPlainText(question.targetUnit);
        frag.append(targetUnitSpan);

        this.elements.questionText.append(frag);

        // Render factor options with KaTeX for mathematical notation
        // This updates the display of factors after they're added to the DOM
        setTimeout(() => {
            const factorOptions = factorSelect.querySelectorAll('option');
            factorOptions.forEach((option, index) => {
                if (index === 0) return; // Skip placeholder
                const value = option.value;
                if (typeof value === 'string' && value.includes('^')) {
                    // Create a temporary container to render KaTeX
                    const tempContainer = document.createElement('span');
                    katex.render(value, tempContainer, { throwOnError: false });
                    // Store the rendered HTML for reference (though option elements don't support HTML)
                    option.dataset.katexHtml = tempContainer.innerHTML;
                }
            });
        }, 0);

        // Note: Enter key handling is now done globally in gameController
        // so that it works from anywhere on the game screen, not just dropdowns
    }
    
    updateStreak(streak) { this.elements.streakCounter.textContent = streak; }
    updateLevelName(name) { this.elements.levelName.innerHTML = name; }

    showFeedback(isCorrect, message, correctAnswer = null, question = null) {
        this.elements.feedbackMessage.innerHTML = '';
        this.elements.feedbackMessage.className = `feedback text-lg ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;

        // Display correct answer on second incorrect attempt
        if (!isCorrect && correctAnswer) {
            const answerLine = createEl('div');

            // Text label
            const textPart = createEl('span', {
                textContent: 'Correct answer: ',
                className: 'font-semibold'
            });
            answerLine.appendChild(textPart);

            // Container for KaTeX rendering
            const answerSpan = createEl('span', { className: 'inline-block' });
            answerLine.appendChild(answerSpan);

            this.elements.feedbackMessage.appendChild(answerLine);

            // Render KaTeX using the correctAnswer parameter
            try {
                katex.render(correctAnswer, answerSpan, { throwOnError: false });
            } catch (e) {
                answerSpan.textContent = correctAnswer; // Fallback to plain text
            }
        } else {
            // For correct or first incorrect feedback (simple text)
            this.elements.feedbackMessage.textContent = message;
        }
    }

    clearFeedback() { this.elements.feedbackMessage.textContent = ''; }

    showInputFeedback(isCorrect) {
        const inputs = this.elements.questionText.querySelectorAll('input');
        
        // Remove any existing feedback classes
        inputs.forEach(input => input.classList.remove('correct', 'incorrect'));
        
        // Add appropriate feedback class
        const feedbackClass = isCorrect ? 'correct' : 'incorrect';
        inputs.forEach(input => input.classList.add(feedbackClass));
    }

    clearInputFeedback() {
        const inputs = this.elements.questionText.querySelectorAll('input');
        inputs.forEach(input => input.classList.remove('correct', 'incorrect'));
    }

    /**
     * Show the timer paused message
     */
    showTimerPausedMessage() {
        if (this.elements.timerPausedMessage) {
            this.elements.timerPausedMessage.classList.remove('hidden');
        }
    }

    /**
     * Hide the timer paused message
     */
    hideTimerPausedMessage() {
        if (this.elements.timerPausedMessage) {
            this.elements.timerPausedMessage.classList.add('hidden');
        }
    }

    /**
     * Clear the answer input field(s)
     */
    clearAnswer() {
        const inputs = this.elements.questionText.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
    }

    getAnswerFromUI(levelKey) {
        if (levelKey === 'unitConversions') {
            const operationSelect = document.getElementById('input-unit-operation');
            const factorSelect = document.getElementById('input-unit-factor');

            if (operationSelect && factorSelect) {
                // Check if factor dropdown has a valid selection (not the placeholder)
                const factorValue = factorSelect.value;
                if (!factorValue) {
                    // Placeholder is still selected, return null to trigger validation error
                    return null;
                }
                return {
                    operation: operationSelect.value,
                    factor: parseFloat(factorValue)
                };
            }
            return null;
        }

        if (levelKey === 'fdpConversions' || levelKey === 'fdpConversionsMultiples') {
            const answer = {};
            const decInput = document.getElementById('input-decimal');
            const perInput = document.getElementById('input-percentage');
            const fracNumInput = document.getElementById('input-fraction-num');
            const fracDenInput = document.getElementById('input-fraction-den');

            if (decInput) answer.decimal = parseFloat(decInput.value);
            if (perInput) answer.percentage = parseFloat(perInput.value);
            if (fracNumInput && fracDenInput) {
                answer.fraction = {
                    num: parseInt(fracNumInput.value, 10),
                    den: parseInt(fracDenInput.value, 10)
                };
            }
            return answer;
        }

        const numInput = document.getElementById('input-fraction-num');
        if (numInput) {
            return {
                num: parseInt(numInput.value, 10),
                den: parseInt(document.getElementById('input-fraction-den').value, 10)
            };
        }

        if (this.elements.questionText.querySelectorAll('.inline-input').length > 1) {
            const inputs = this.elements.questionText.querySelectorAll('.inline-input');
            const filledInput = Array.from(inputs).find(i => i.value !== '');
            return filledInput ? parseFloat(filledInput.value) : null;
        }

        const input = this.elements.questionText.querySelector('.inline-input');
        return input ? parseFloat(input.value) : null;
    }

    showSuccess(levelName, time, rating, isNewBest, previousBest, levelKey, questionCount) {
        // Store debug reference for success screen display
        // Display success screen with completion details

        this.elements.completedLevel.textContent = levelName;
        this.elements.finalTime.textContent = new Timer().formatTime(time);
        this.elements.finalRating.textContent = rating.name;

        if (isNewBest) {
            this.elements.bestTimeMessage.textContent = previousBest
                ? `New personal best! Beat your old time of ${new Timer().formatTime(previousBest)}.`
                : `You've set your first record!`;
        } else {
            this.elements.bestTimeMessage.textContent = `Your best time is still ${new Timer().formatTime(previousBest)}.`;
        }

        // Show rating improvement guidance based on THIS attempt's rating
        try {
            const nextTarget = RatingUtils.getNextRatingTarget(rating, levelKey, questionCount, CONFIG);

            if (nextTarget) {
                const targetTimeFormatted = new Timer().formatTime(Math.round(nextTarget.targetTime * 10) / 10);
                this.elements.ratingExplanation.textContent =
                    `Complete in ${targetTimeFormatted} or less for ${nextTarget.nextRating.name}.`;
            } else if (rating.key === 'true-mastery') {
                const threshold = 1.5;
                const difficultyMultiplier = (levelKey && CONFIG && CONFIG.LEVEL_DIFFICULTY_MULTIPLIERS)
                    ? (CONFIG.LEVEL_DIFFICULTY_MULTIPLIERS[levelKey] || 1.0)
                    : 1.0;
                const maxTime = threshold * difficultyMultiplier * questionCount;
                const maxTimeFormatted = new Timer().formatTime(maxTime);
                this.elements.ratingExplanation.textContent =
                    `You completed this level in under ${maxTimeFormatted}.`;
            }
        } catch (error) {
            console.error('Failed to set rating explanation:', error);
        }

        // Make sure we're showing the right screen
        this.showScreen('success');
    }

	formatAnswerForDisplay(answer, levelKey) {
        if (levelKey === 'unitConversions') {
            if (answer && typeof answer === 'object') {
                const operationSymbol = answer.correctOperation === 'multiply' ? '×' : '÷';
                const factorLabel = typeof answer.correctFactor === 'string' ? answer.correctFactor : answer.correctFactor.toString();
                return `${operationSymbol} ${factorLabel}`;
            }
            return String(answer);
        } else if (levelKey === 'fdpConversions' || levelKey === 'fdpConversionsMultiples') {
            let parts = [];

            // Handle FDP answers - can be any combination of fraction, decimal, percentage
            if (answer && typeof answer === 'object') {
                // Add fraction if it exists
                if (answer.fraction && answer.fraction.num !== undefined && answer.fraction.den !== undefined) {
                    parts.push(`\\frac{${answer.fraction.num}}{${answer.fraction.den}}`);
                }

                // Add decimal if it exists
                if (answer.decimal !== undefined) {
                    parts.push(answer.decimal.toString());
                }

                // Add percentage if it exists
                if (answer.percentage !== undefined) {
                    parts.push(`${answer.percentage}\\%`);
                }

                // If we found any FDP components, return the formatted string
                if (parts.length > 0) {
                    return parts.join(', ');
                }
            }

            // Fallback for non-object answers
            return String(answer);
        } else if (typeof answer === 'object' && answer !== null && answer.num !== undefined) {
            return `\\frac{${answer.num}}{${answer.den}}`;
        } else {
            return String(answer);
        }
    }

    // --- Skill Path Methods ---

    setupToggleGridView() {
        if (this.elements.toggleGridView) {
            this.elements.toggleGridView.addEventListener('click', () => {
                this.toggleView();
            });
        }
    }

    setupHorizontalScrolling() {
        // Add horizontal scrolling with mouse wheel to skill path
        const skillPathScroll = document.querySelector('.skill-path-scroll');
        if (skillPathScroll) {
            skillPathScroll.addEventListener('wheel', (e) => {
                // Only intercept wheel events when horizontally scrollable
                if (skillPathScroll.scrollWidth > skillPathScroll.clientWidth) {
                    e.preventDefault();
                    skillPathScroll.scrollLeft += e.deltaY;
                }
            }, { passive: false });
        }
    }

    toggleView() {
        if (this.currentView === 'skill-path') {
            this.currentView = 'grid';
            this.elements.skillPath.classList.add('hidden');
            this.elements.levelSelection.classList.remove('hidden');
            this.elements.toggleGridView.textContent = 'Show Learning Path';
        } else {
            this.currentView = 'skill-path';
            this.elements.levelSelection.classList.add('hidden');
            this.elements.skillPath.classList.remove('hidden');
            this.elements.toggleGridView.textContent = 'Show All Levels';
        }
    }

    renderSkillPath(levelGroups, onSelect) {
        this.elements.skillPath.innerHTML = '';
        const pathContainer = createEl('div', { className: 'skill-path' });
        
        // Flatten all levels to create linear path
        const allLevels = [];
        let currentSection = '';
        
        Object.keys(levelGroups).forEach(groupName => {
            levelGroups[groupName].forEach(level => {
                if (groupName !== currentSection) {
                    allLevels.push({ type: 'section', name: groupName });
                    currentSection = groupName;
                }
                allLevels.push({ type: 'level', ...level, groupName });
            });
        });

        // Find next available level (first level without mastery or true mastery)
        let nextAvailableIndex = -1;
        allLevels.forEach((item, index) => {
            if (item.type === 'level' && nextAvailableIndex === -1) {
                const bestTime = StorageManager.getBestTime(item.key);
                const rating = bestTime ? StorageManager.getRating(bestTime, item.key) : null;
                // Check if level needs attention (not mastered)
                if (!rating || (rating.key !== 'mastery' && rating.key !== 'true-mastery')) {
                    // Found the next level that needs practice
                    nextAvailableIndex = index;
                }
            }
        });

        // Render path items
        allLevels.forEach((item, index) => {
            if (item.type === 'section') {
                const section = createEl('div', { className: 'skill-path-section' });
                const sectionTitle = createEl('div', { 
                    className: 'skill-path-section-title',
                    textContent: item.name 
                });
                section.appendChild(sectionTitle);
                pathContainer.appendChild(section);
            } else if (item.type === 'level') {
                const node = this.createSkillPathNode(item, index === nextAvailableIndex);
                node.addEventListener('click', () => onSelect(item));
                pathContainer.appendChild(node);
            }
        });

        this.elements.skillPath.appendChild(pathContainer);

        // Auto-scroll to next available level
        if (nextAvailableIndex !== -1) {
            // Convert allLevels index to level-only index (excluding sections)
            let levelOnlyIndex = 0;
            for (let i = 0; i < nextAvailableIndex; i++) {
                if (allLevels[i].type === 'level') {
                    levelOnlyIndex++;
                }
            }
            // Auto-scroll to the next level after a brief delay for smooth rendering
            setTimeout(() => {
                this.scrollToNextLevel(levelOnlyIndex);
            }, 100);
        }
    }

    createSkillPathNode(level, isNext = false) {
        const bestTime = StorageManager.getBestTime(level.key);
        const rating = bestTime ? StorageManager.getRating(bestTime, level.key) : null;
        const ratingClass = rating ? `rating-${rating.key}` : 'rating-none';

        const node = createEl('div', {
            className: `skill-path-node ${ratingClass} ${isNext ? 'current' : ''}`
        });
        node.dataset.levelKey = level.key;

        const label = createEl('div', {
            className: 'skill-path-label',
            textContent: level.name
        });

        const timeDisplay = createEl('div', {
            className: 'skill-path-time',
            textContent: bestTime ? `Best: ${new Timer().formatTime(bestTime)}` : 'Not attempted'
        });

        node.append(label, timeDisplay);
        return node;
    }

    getLevelAbbreviation(levelName) {
        // Use ConfigUtils to get abbreviations from centralized CONFIG.LEVEL_ABBREVIATIONS
        return ConfigUtils.getLevelAbbreviation(levelName);
    }

    setLevelAbbreviation(element, levelName) {
        const abbrev = this.getLevelAbbreviation(levelName);
        
        if (abbrev.useKaTeX) {
            try {
                katex.render(abbrev.text, element, { 
                    throwOnError: false,
                    displayMode: false,
                    output: 'html'
                });
            } catch (error) {
                // KaTeX rendering failed - fall back to plain text without LaTeX syntax
                console.warn('KaTeX rendering failed for abbreviation:', abbrev.text, error);
                element.textContent = abbrev.text.replace(/\\\\/g, '').replace(/\{|\}/g, '');
            }
        } else {
            element.textContent = abbrev.text;
        }
    }

    scrollToNextLevel(levelIndex) {
        const nodes = this.elements.skillPath.querySelectorAll('.skill-path-node');
        // Scroll to the specified level node if it exists
        if (nodes[levelIndex]) {
            const scrollContainer = this.elements.skillPath.closest('.skill-path-scroll');
            const nodeLeft = nodes[levelIndex].offsetLeft;
            const containerWidth = scrollContainer.clientWidth;
            // Center the node in the viewport
            const scrollPosition = nodeLeft - (containerWidth / 2) + 50;
            
            scrollContainer.scrollTo({
                left: Math.max(0, scrollPosition),
                behavior: 'smooth'
            });
        }
    }

    // --- Mastery Progress Bar Methods ---

    renderMasteryProgressBars(progressData) {
        this.elements.masteryProgressBars.innerHTML = '';
        
        progressData.forEach(topic => {
            const container = createEl('div', { className: 'mb-3' });
            
            const label = createEl('div', { className: 'mastery-progress-label' });
            const titleSpan = createEl('span', { textContent: topic.name });
            const statsSpan = createEl('span', { 
                className: 'mastery-progress-stats',
                textContent: `${topic.masteredCount}/${topic.totalCount} mastered`
            });
            label.append(titleSpan, statsSpan);
            
            const progressBar = createEl('div', { className: 'mastery-progress-bar' });
            const progressFill = createEl('div', { 
                className: 'mastery-progress-fill',
                style: { 
                    width: `${topic.percentage}%`,
                    backgroundColor: topic.color
                }
            });
            
            if (topic.percentage > 15) {
                progressFill.textContent = `${topic.percentage}%`;
            }
            
            progressBar.appendChild(progressFill);
            container.append(label, progressBar);
            this.elements.masteryProgressBars.appendChild(container);
        });
    }

    updateLevelsInterface(levelGroups, onSelect, masteryData) {
        // Render mastery progress bars first
        if (masteryData) {
            this.renderMasteryProgressBars(masteryData);
        }

        // Render both skill path and grid (grid starts hidden)
        this.renderSkillPath(levelGroups, onSelect);
        this.renderLevelGrid(levelGroups, onSelect);
        
        // Show skill path by default
        if (this.currentView === 'skill-path') {
            this.elements.levelSelection.classList.add('hidden');
            this.elements.skillPath.classList.remove('hidden');
        }
    }
}