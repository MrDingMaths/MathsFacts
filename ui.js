/**
 * UI class for Maths Facts Challenge DOM manipulation and rendering
 * Handles all user interface interactions, question display, and visual feedback
 * Manages screen transitions, input handling, and dynamic content rendering
 */
import { createEl } from './utils.js';
import { Timer, StorageManager } from './gameState.js';

export class UI {
    constructor() {
        this.elements = {
            settingsScreen: document.getElementById('settings-screen'),
            gameScreen: document.getElementById('game-screen'),
            successScreen: document.getElementById('success-screen'),
            levelSelection: document.getElementById('level-selection-container'),
            streakCounter: document.getElementById('streak-counter'),
            timer: document.getElementById('timer'),
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
            continueNextBtn: document.getElementById('continue-next-btn'),
            replayLevelBtn: document.getElementById('replay-level-btn'),
        };
        this.questionRenderers = {
            '{{EQUIV_FRACTION_CHALLENGE}}': this._renderEquivFraction,
            '{{SIMPLIFY_FRACTION_CHALLENGE}}': this._renderSimplifyFraction,
            '{{FDP_CONVERSION_CHALLENGE}}': this._renderFDPConversion,
            'default': this._renderDefaultQuestion
        };
        this.currentView = 'skill-path'; // 'skill-path' or 'grid'
        this.setupToggleGridView();
        this.setupSuccessScreenButtons();
        this.setupHorizontalScrolling();
    }

    setupSuccessScreenButtons() {
        // Continue to Next Challenge button
        if (this.elements.continueNextBtn) {
            this.elements.continueNextBtn.addEventListener('click', () => {
                if (this.onContinueNext) {
                    this.onContinueNext();
                }
            });
        }

        // Replay Level button
        if (this.elements.replayLevelBtn) {
            this.elements.replayLevelBtn.addEventListener('click', () => {
                if (this.onReplayLevel) {
                    this.onReplayLevel();
                }
            });
        }
    }

    // Set callback functions for success screen buttons
    setSuccessScreenCallbacks(onContinueNext, onReplayLevel) {
        this.onContinueNext = onContinueNext;
        this.onReplayLevel = onReplayLevel;
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
        if (levelKey === 'powersOf10' || levelKey === 'unitConversions') {
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
    
    updateStreak(streak) { this.elements.streakCounter.textContent = streak; }

    showFeedback(isCorrect, message, useKatex = false) {
        this.elements.feedbackMessage.innerHTML = ''; // Use innerHTML instead of textContent
        this.elements.feedbackMessage.className = `feedback text-lg ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
        
        if (useKatex) {
            try {
                katex.render(message, this.elements.feedbackMessage, { throwOnError: false });
            } catch (e) {
                this.elements.feedbackMessage.textContent = message; // Fallback to plain text
            }
        } else {
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

    getAnswerFromUI(levelKey) {
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

    showSuccess(levelName, time, rating, isNewBest, previousBest) {
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
        
        // Make sure we're showing the right screen
        this.showScreen('success');
    }

	formatAnswerForDisplay(answer, levelKey) {
        if (levelKey === 'fdpConversions' || levelKey === 'fdpConversionsMultiples') {
            let parts = [];
            if (answer.fraction) {
                parts.push(`\\frac{${answer.fraction.num}}{${answer.fraction.den}}`);
            }
            if (answer.decimal !== undefined) {
                parts.push(answer.decimal.toString());
            }
            if (answer.percentage !== undefined) {
                parts.push(`${answer.percentage}\\%`);
            }
            return parts.join(', ');
        } else if (typeof answer === 'object' && answer !== null && answer.num !== undefined) {
            return `\\frac{${answer.num}}{${answer.den}}`;
        } else {
            return answer.toString();
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
        
        const circle = createEl('div', { className: 'skill-path-circle' });
        
        // Add level number or abbreviation with KaTeX support
        this.setLevelAbbreviation(circle, level.name);
        
        const label = createEl('div', { 
            className: 'skill-path-label',
            textContent: level.name 
        });
        
        const timeDisplay = createEl('div', { 
            className: 'skill-path-time',
            textContent: bestTime ? `Best: ${new Timer().formatTime(bestTime)}` : 'Not attempted'
        });
        
        node.append(circle, label, timeDisplay);
        return node;
    }

    getLevelAbbreviation(levelName) {
        // Create short abbreviations for level names with KaTeX support
        const abbreviations = {
            'Bonds to 10': { text: '10', useKaTeX: false },
            'Bonds to 20': { text: '20', useKaTeX: false },
            'Mixed Bonds 10-20': { text: '10-20', useKaTeX: false },
            'Bonds to 90': { text: '90', useKaTeX: false },
            'Bonds to 100': { text: '100', useKaTeX: false },
            'Bonds to -10': { text: '-10', useKaTeX: false },
            'Bonds to -20': { text: '-20', useKaTeX: false },
            'Bonds to -50': { text: '-50', useKaTeX: false },
            '2 4 5 10': { text: '\\times 2', useKaTeX: true },
            '3 6 9': { text: '\\times 3', useKaTeX: true },
            '2 to 12': { text: '\\times 12', useKaTeX: true },
            'Negatives': { text: '\\times -', useKaTeX: true },
            'Powers of 10': { text: '10^n', useKaTeX: true },
            'Doubling': { text: '\\times 2', useKaTeX: true },
            'Perfect Squares': { text: 'n^2', useKaTeX: true },
            'Unit Conversions': { text: 'mm→cm', useKaTeX: false },
            'HCF': { text: 'HCF', useKaTeX: false },
            'LCM': { text: 'LCM', useKaTeX: false },
            'Equivalent Fractions': { text: '\\frac{a}{b} = \\frac{an}{bn}', useKaTeX: true },
            'Simplifying Fractions': { text: '\\frac{\\div n}{\\div n}', useKaTeX: true },
            'Common FDP Equivalences': { text: '\\frac{1}{2} = 0.5', useKaTeX: true },
            'FDP Conversions': { text: '\\frac{a}{b} \\leftrightarrow \\%', useKaTeX: true },
            'Fraction of a Quantity': { text: '\\frac{1}{2} \\times n', useKaTeX: true },
            'Percentage of a Quantity': { text: '\\% \\times n', useKaTeX: true }
        };
        
        return abbreviations[levelName] || { text: levelName.charAt(0), useKaTeX: false };
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