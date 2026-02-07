// GameController - Main orchestrator class for Maths Facts Challenge
import { CONFIG } from './config.js';
import { GameState, Timer, StorageManager } from './gameState.js';
import { UI } from './ui.js';
import { QuestionGenerator } from './questionGenerator.js';
import { Confetti } from './effects.js';
import { MasteryTracker } from './masteryTracker.js';
import { RatingUtils } from './ratingUtils.js';

export class GameController {
    constructor() {
        // Make CONFIG, StorageManager, and RatingUtils globally available for progress tracking modules
        window.CONFIG = CONFIG;
        window.StorageManager = StorageManager;
        window.RatingUtils = RatingUtils;
        
        this.state = new GameState();
        this.ui = new UI();
        this.timer = new Timer(this.ui.elements.timer);
        this.questionGen = new QuestionGenerator();
        this.confetti = new Confetti('confetti-canvas');
        this.masteryTracker = new MasteryTracker();
        this.isChecking = false;
        this.answerSubmitted = false;
        this.isWaitingForKeystroke = false;  // Flag to block normal input while waiting for keystroke after second mistake
        this.setupEventListeners();
        this.setupArrowKeyNavigation();
        this.initializeQuestionGenerators();
        this.initializeLearningPath();
		setTimeout(() => this.initializeProgressTracking(), 100);
    }

    initializeProgressTracking() {
        // Only initialize if not already initialized
        if (!window.progressTracker) {
            window.progressTracker = new ProgressTracker();
            
            // Don't create canvas here - let the UI handle it
            // Remove any canvas creation code from here
            
            window.progressChart = new ProgressChart('progress-chart', window.progressTracker);
            window.progressShare = new ProgressShare(window.progressTracker, window.progressChart);
            window.progressUI = new ProgressUI(window.progressTracker, window.progressChart, window.progressShare);
        }
    }

    initializeLearningPath() {
        // Set up success screen callbacks
        this.ui.setSuccessScreenCallbacks(
            () => this.replayCurrentLevel(),
            () => this.quitGame()
        );

        // Initialize the learning path interface
        this.updateLearningPathInterface();
    }

    initializeQuestionGenerators() {
        this.generatorMap = {
            'hcf': () => this.questionGen.generateHCF(),
            'lcm': () => this.questionGen.generateLCM(),
            'equivFractions': () => this.questionGen.generateEquivalentFractions(),
            'simplifyFractions': () => this.questionGen.generateSimplifyFractions(),
			'fractionOfQuantity': () => this.questionGen.generateFractionOfQuantity(),
            'fdpConversions': () => this.questionGen.generateFDPConversions(),
            'fdpConversionsMultiples': () => this.questionGen.generateFDPConversionsMultiples(),
			'percentageOfQuantity': () => this.questionGen.generatePercentageOfQuantity(),
            'group245': () => this.questionGen.generateGroupFacts([2, 4, 5, 10]),
            'group369': () => this.questionGen.generateGroupFacts([3, 6, 9]),
            'multall': () => this.questionGen.generateGroupFacts([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
            'mixed-negative-mult': () => this.questionGen.generateNegativeTableFacts([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12][Math.floor(Math.random()*11)]),
            'double100': () => this.questionGen.generateDoubling(100),
            'squares': () => this.questionGen.generatePerfectSquares(),
            'powersOf10': () => this.questionGen.generatePowersOf10(),
            'unitConversions': () => this.questionGen.generateUnitConversions(),
            'bonds': (level) => this.questionGen.generateBonds(level.value, level.customMixedRange)
        };
    }

    setupEventListeners() {
        this.ui.elements.quitBtn.addEventListener('click', () => this.quitGame());
        this.ui.elements.playAgainBtn.addEventListener('click', () => this.quitGame());

        // Handle Enter key on game screen - works for both text inputs and unit conversions
        this.handleEnterKey = (e) => {
            if (e.key === 'Enter' && !this.isChecking && !this.isWaitingForKeystroke) {
                // Only check if we're in the game screen
                if (!this.ui.elements.gameScreen.classList.contains('hidden')) {
                    // For unit conversions, allow Enter from dropdowns or anywhere on game screen
                    // For regular inputs, only allow from INPUT elements
                    if (this.state.currentLevel && this.state.currentLevel.key === 'unitConversions') {
                        e.preventDefault();
                        this.checkAnswer();
                    } else if (e.target.tagName === 'INPUT') {
                        this.checkAnswer();
                    }
                }
            }
        };

        this.ui.elements.questionText.addEventListener('keydown', this.handleEnterKey);
        document.addEventListener('keydown', this.handleEnterKey);

        // Add global ESC key handler (store reference to avoid context issues)
        this.handleEscKey = (e) => {
            if (e.key === 'Escape') {
                // Only quit if we're in the game screen
                if (!this.ui.elements.gameScreen.classList.contains('hidden')) {
                    this.quitGame();
                }
            }
        };
        document.addEventListener('keydown', this.handleEscKey);
    }

    setupArrowKeyNavigation() {
        this.ui.elements.questionText.addEventListener('keydown', (e) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                const inputs = Array.from(this.ui.elements.questionText.querySelectorAll('input'));
                if (inputs.length <= 1) return; // No navigation needed for single input
                
                const currentInput = document.activeElement;
                const currentIndex = inputs.indexOf(currentInput);
                
                if (currentIndex === -1) return; // Current element is not an input
                
                e.preventDefault(); // Prevent default arrow key behavior (changing numbers)
                
                let nextIndex;
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : inputs.length - 1;
                } else { // ArrowRight or ArrowDown
                    nextIndex = currentIndex < inputs.length - 1 ? currentIndex + 1 : 0;
                }
                
                inputs[nextIndex].focus();
            }
        });
    }

    startGame(level) {
        this.state.setLevel(level);
        this.ui.showScreen('game');
        this.ui.updateLevelName(level.name);
        this.ui.updateStreak(0);
        this.isWaitingForKeystroke = false;
        this.timer.start();
        this.generateQuestion();
    }

    generateQuestion() {
        this.ui.clearFeedback();
        this.ui.clearInputFeedback();
        this.ui.hideTimerPausedMessage();  // Ensure message is hidden when generating new question
        this.answerSubmitted = false;
        this.state.resetIncorrectCount();  // Reset mistake counter for new question
        const levelKey = this.state.currentLevel.key;

        let generatorFn = this.generatorMap[levelKey];
        if (!generatorFn) {
            if (levelKey.startsWith('bonds') || levelKey.startsWith('mixed')) {
                generatorFn = () => this.generatorMap.bonds(this.state.currentLevel);
            } else {
                console.error("No generator found for level key:", levelKey);
                return;
            }
        }

        const q = generatorFn();
        if (!q) {
            console.error("Failed to generate question");
            this.quitGame();
            return;
        }

        // For unit conversions, the answer properties are directly on the question object
        // For other question types, the answer is nested under q.answer
        if (this.state.currentLevel.key === 'unitConversions') {
            this.state.currentAnswer = {
                correctOperation: q.correctOperation,
                correctFactor: q.correctFactor
            };
        } else {
            this.state.currentAnswer = q.answer;
        }

        this.state.lastQuestionFormat = q.format;
        this.state.currentQuestion = q; // Store full question object for mistake recording
        this.ui.displayQuestion(q, this.state.currentLevel.key);
    }

    isInputEmpty() {
        const levelKey = this.state.currentLevel.key;

        // Check unit conversion questions (dropdown based, never empty)
        if (levelKey === 'unitConversions') {
            const operationSelect = document.getElementById('input-unit-operation');
            const factorSelect = document.getElementById('input-unit-factor');
            // Dropdowns always have values selected, so never empty
            return !operationSelect || !factorSelect;
        }

        // Check FDP conversion questions
        if (levelKey === 'fdpConversions' || levelKey === 'fdpConversionsMultiples') {
            const decInput = document.getElementById('input-decimal');
            const perInput = document.getElementById('input-percentage');
            const fracNumInput = document.getElementById('input-fraction-num');
            const fracDenInput = document.getElementById('input-fraction-den');

            // Check if any required input field is empty
            if (decInput && decInput.value.trim() === '') return true;
            if (perInput && perInput.value.trim() === '') return true;
            if (fracNumInput && fracNumInput.value.trim() === '') return true;
            if (fracDenInput && fracDenInput.value.trim() === '') return true;

            return false;
        }

        // Check fraction questions
        const numInput = document.getElementById('input-fraction-num');
        if (numInput) {
            const denInput = document.getElementById('input-fraction-den');
            return numInput.value.trim() === '' || denInput.value.trim() === '';
        }

        // Check regular input questions
        const inputs = this.ui.elements.questionText.querySelectorAll('.inline-input');
        return Array.from(inputs).every(input => input.value.trim() === '');
    }
    
    checkAnswer() {
        // Guard clauses: prevent double submission and concurrent checking
        if (this.isChecking || this.answerSubmitted) return;

        // Check if input is empty before processing
        if (this.isInputEmpty()) {
            this.ui.showFeedback(false, "Please enter an answer");
            setTimeout(() => {
                this.ui.clearFeedback();
            }, 1000);
            return;
        }

        this.answerSubmitted = true;
        this.isChecking = true;

        // Get and validate input
        const userAnswer = this.ui.getAnswerFromUI(this.state.currentLevel.key);
        const correctAnswer = this.state.currentAnswer;
        let isCorrect = false;

        // Compare answers based on question type
        if (this.state.currentLevel.key === 'unitConversions') {
            // Unit conversions: check both operation and factor
            isCorrect = userAnswer &&
                        userAnswer.operation === correctAnswer.correctOperation &&
                        Math.abs(userAnswer.factor - correctAnswer.correctFactor) < 1e-9;

            // Debug logging
            if (userAnswer) {
                console.log('Unit conversion check:');
                console.log('User operation:', JSON.stringify(userAnswer.operation), 'Type:', typeof userAnswer.operation);
                console.log('Correct operation:', JSON.stringify(correctAnswer.correctOperation), 'Type:', typeof correctAnswer.correctOperation);
                console.log('User factor:', userAnswer.factor, 'Type:', typeof userAnswer.factor);
                console.log('Correct factor:', correctAnswer.correctFactor, 'Type:', typeof correctAnswer.correctFactor);
                console.log('Operation match:', userAnswer.operation === correctAnswer.correctOperation);
                console.log('Factor match:', Math.abs(userAnswer.factor - correctAnswer.correctFactor) < 1e-9);
                console.log('Is correct:', isCorrect);
            }
        } else if (this.state.currentLevel.key === 'fdpConversions' || this.state.currentLevel.key === 'fdpConversionsMultiples') {
            isCorrect = true;
            for (const key in correctAnswer) {
                if (key === 'fraction') {
                    if (!userAnswer.fraction || userAnswer.fraction.num !== correctAnswer.fraction.num || userAnswer.fraction.den !== correctAnswer.fraction.den) {
                        isCorrect = false; break;
                    }
                } else {
                    if (userAnswer[key] === undefined || isNaN(userAnswer[key]) || Math.abs(userAnswer[key] - correctAnswer[key]) > 1e-9) {
                        isCorrect = false; break;
                    }
                }
            }
        } else if (typeof correctAnswer === 'object' && correctAnswer !== null) {
            isCorrect = userAnswer && userAnswer.num === correctAnswer.num && userAnswer.den === correctAnswer.den;
        } else {
            isCorrect = userAnswer === correctAnswer;
        }

        // BRANCH 1: CORRECT ANSWER
        if (isCorrect) {
            // Reset mistake counter for this question
            this.state.resetIncorrectCount();

            // Update streak and display
            const newStreak = this.state.incrementStreak();
            this.ui.updateStreak(newStreak);

            // Visual and auditory feedback
            this.ui.showInputFeedback(true);
            this.ui.showFeedback(true, CONFIG.POSITIVE_FEEDBACK[Math.floor(Math.random() * CONFIG.POSITIVE_FEEDBACK.length)]);
            this.confetti.trigger(CONFIG.CONFETTI.CORRECT);

            // Check if level is complete or move to next question
            if (this.state.isComplete()) {
                setTimeout(() => this.showSuccess(), 500);
            } else {
                setTimeout(() => {
                    this.answerSubmitted = false;
                    this.generateQuestion();
                    this.isChecking = false;
                }, CONFIG.FEEDBACK_DELAY_CORRECT);
            }
        }
        // BRANCH 2: INCORRECT ANSWER
        else {
            // Increment consecutive incorrect counter
            const incorrectCount = this.state.incrementIncorrectCount();

            // SUB-BRANCH: Second Incorrect Attempt (show answer and pause timer)
            if (this.state.isSecondIncorrectAttempt()) {
                // Reset streak
                this.state.resetStreak();
                this.ui.updateStreak(0);

                // Visual feedback
                this.ui.showInputFeedback(false);

                // Show correct answer with question context
                const correctAnswerText = this.ui.formatAnswerForDisplay(correctAnswer, this.state.currentLevel.key);
                this.ui.showFeedback(false, null, correctAnswerText, this.state.currentQuestion?.problem);

                // Pause timer
                this.ui.showTimerPausedMessage();
                this.timer.stop();  // Pause the timer (don't reset, just stop)

                // Record mistake
                // this.recordMistake(userAnswer, correctAnswer);  // Optional: for progress tracking

                // Clear input
                this.ui.clearAnswer();

                // Set flag to block normal input while waiting for keystroke
                this.isWaitingForKeystroke = true;
                this.isChecking = false;

                // Add a small delay before attaching the listener to prevent the current keystroke from triggering it
                setTimeout(() => {
                    // Setup keystroke listener for advancing to next question
                    const moveToNextQuestion = (e) => {
                        // Only trigger on valid keys: single printable characters, Enter, Backspace, Delete
                        // Exclude modifier keys and meta keys
                        const isValidKey = e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete' ||
                                          (e.key.length === 1 && !/^(Shift|Control|Alt|Meta|Escape|Tab|CapsLock|F\d+)/.test(e.key));

                        if (isValidKey) {
                            e.preventDefault();  // Prevent default behavior
                            e.stopPropagation();  // Stop event from propagating

                            // Remove listener immediately (one-time use)
                            document.removeEventListener('keydown', moveToNextQuestion);

                            // Reset waiting flag
                            this.isWaitingForKeystroke = false;

                            // Execute transition sequence
                            this.ui.hideTimerPausedMessage();
                            this.answerSubmitted = false;
                            this.generateQuestion();  // Resets consecutiveIncorrect
                            this.timer.start();  // Restart timer from 0:00
                            this.isChecking = false;
                        }
                    };

                    // Attach listener
                    document.addEventListener('keydown', moveToNextQuestion);
                }, 50);  // 50ms delay to prevent the same keystroke from triggering the listener
            }
            // SUB-BRANCH: First Incorrect Attempt (show encouragement and allow retry)
            else {
                // Show red input feedback
                this.ui.showInputFeedback(false);

                // Show encouraging "second chance" message
                this.ui.showFeedback(false, CONFIG.SECOND_CHANCE_FEEDBACK[
                    Math.floor(Math.random() * CONFIG.SECOND_CHANCE_FEEDBACK.length)
                ]);

                // After delay, clear feedback and re-enable input
                setTimeout(() => {
                    this.ui.clearFeedback();
                    this.ui.clearInputFeedback();
                    this.answerSubmitted = false;
                    this.isChecking = false;

                    // Refocus input for convenience
                    const inputs = this.ui.elements.questionText.querySelectorAll('input');
                    if (inputs.length > 0) {
                        inputs[0].focus();
                    }
                }, CONFIG.FEEDBACK_DELAY_INCORRECT);
            }
        }
    }


    quitGame() {
        this.timer.stop();
        this.state.reset();
        this.isChecking = false;
        this.isWaitingForKeystroke = false;
        this.updateLearningPathInterface();
        this.ui.showScreen('settings');
    }

    // --- Learning Path Methods ---

    updateLearningPathInterface() {
        // Calculate mastery progress
        const masteryProgress = this.masteryTracker.calculateMasteryProgress();
        const masteryData = this.masteryTracker.getTopicProgressData();

        // Update the UI with both skill path and mastery progress
        this.ui.updateLevelsInterface(CONFIG.LEVEL_GROUPS, (level) => this.startGame(level), masteryData);
    }

    continueToNextChallenge() {
        const nextLevel = this.masteryTracker.getNextAvailableLevel();
        if (nextLevel) {
            this.startGame(nextLevel);
        } else {
            // All levels completed, return to learning path
            this.ui.showScreen('settings');
            this.updateLearningPathInterface();
        }
    }

    replayCurrentLevel() {
        if (this.state.currentLevel) {
            this.startGame(this.state.currentLevel);
        } else {
            this.quitGame();
        }
    }

    // Update showSuccess to include mastery tracking
    showSuccess() {
        this.timer.stop();
        const time = this.timer.getSeconds();
        const previousBest = StorageManager.getBestTime(this.state.currentLevel.key);
        const isNewBest = !previousBest || time < previousBest;

        if (isNewBest) {
            StorageManager.saveBestTime(this.state.currentLevel.key, time);
            this.confetti.trigger(CONFIG.CONFETTI.SUCCESS);
        }

        // Add progress tracking with better error handling
        try {
            if (window.progressTracker) {
                // Record progress silently for better user experience
                window.progressTracker.recordProgress(
                    this.state.currentLevel.key,
                    time,
                    CONFIG.REQUIRED_STREAK
                );
            }
        } catch (error) {
            console.error('Error recording progress (non-blocking):', error);
        }

        // Update mastery tracking
        const rating = StorageManager.getRating(time, this.state.currentLevel.key);
        try {
            // Update mastery progress tracking
            this.masteryTracker.updateMasteryProgress(this.state.currentLevel.key, rating);
        } catch (error) {
            console.error('Error updating mastery progress (non-blocking):', error);
        }

        // Show success screen
        try {
            this.ui.showSuccess(
                this.state.currentLevel.name,
                time,
                rating,
                isNewBest,
                previousBest,
                this.state.currentLevel.key,
                CONFIG.REQUIRED_STREAK
            );
        } catch (error) {
            console.error('Error showing success screen:', error);
        }

        this.isChecking = false;
    }
}