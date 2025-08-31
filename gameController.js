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
            () => this.continueToNextChallenge(),
            () => this.replayCurrentLevel()
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
        this.ui.elements.questionText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.isChecking && e.target.tagName === 'INPUT') {
                this.checkAnswer();
            }
        });
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
        this.ui.updateStreak(0);
        this.timer.start();
        this.generateQuestion();
    }

    generateQuestion() {
        this.ui.clearFeedback();
        this.ui.clearInputFeedback(); // Add this line
        this.answerSubmitted = false;
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
        this.state.currentAnswer = q.answer;
        this.state.lastQuestionFormat = q.format;
        this.ui.displayQuestion(q, this.state.currentLevel.key);
    }

    isInputEmpty() {
        const levelKey = this.state.currentLevel.key;
        
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

        const userAnswer = this.ui.getAnswerFromUI(this.state.currentLevel.key);
        const correctAnswer = this.state.currentAnswer;
        let isCorrect = false;

        if (this.state.currentLevel.key === 'fdpConversions' || this.state.currentLevel.key === 'fdpConversionsMultiples') {
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

        if (isCorrect) {
            const newStreak = this.state.incrementStreak();
            this.ui.updateStreak(newStreak);
            this.ui.showInputFeedback(isCorrect);
            this.ui.showFeedback(true, CONFIG.POSITIVE_FEEDBACK[Math.floor(Math.random() * CONFIG.POSITIVE_FEEDBACK.length)]);
            this.confetti.trigger(CONFIG.CONFETTI.CORRECT);
            
            if (this.state.isComplete()) {
                setTimeout(() => this.showSuccess(), 500);
            } else {
            setTimeout(() => { 
                    this.answerSubmitted = false; // Reset flag
                    this.generateQuestion(); 
                    this.isChecking = false; 
                }, CONFIG.FEEDBACK_DELAY_CORRECT);
            }
        } else {
            this.state.resetStreak();
            this.ui.updateStreak(0);
            this.timer.reset()
            this.timer.start()
            this.ui.showInputFeedback(isCorrect);
            const correctAnswerText = this.ui.formatAnswerForDisplay(correctAnswer, this.state.currentLevel.key);
			const needsKatex = typeof correctAnswer === 'object' || this.state.currentLevel.key.includes('fdp');
			this.ui.showFeedback(false, `${correctAnswerText}`, needsKatex);
            setTimeout(() => { 
                this.answerSubmitted = false; // Reset flag
                this.generateQuestion(); 
                this.isChecking = false; 
            }, CONFIG.FEEDBACK_DELAY_INCORRECT);
        }
    }


    quitGame() {
        this.timer.stop(); 
        this.state.reset();
        this.isChecking = false;
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
            this.ui.showSuccess(this.state.currentLevel.name, time, rating, isNewBest, previousBest);
        } catch (error) {
            console.error('Error showing success screen:', error);
        }
        
        this.isChecking = false;
    }
}