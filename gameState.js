/**
 * Game State Management classes for Maths Facts Challenge
 * Provides core state tracking, timing, and local storage functionality
 */
import { CONFIG } from './config.js';
import { RatingUtils } from './ratingUtils.js';

/**
 * GameState class manages the current game session state
 * Tracks level progress, answer streaks, and completion status
 */
export class GameState {
    constructor() { 
        this.reset(); 
    }
    
    /**
     * Reset all game state to initial values
     */
    reset() {
        this.currentLevel = null;           // Currently selected level
        this.currentAnswer = 0;             // Expected answer for current question
        this.correctStreak = 0;             // Current streak of correct answers
        this.lastQuestionFormat = null;     // Format of the last generated question
    }
    
    /**
     * Set the current level and reset game state
     * @param {Object} level - Level configuration object
     */
    setLevel(level) { 
        this.reset(); 
        this.currentLevel = level; 
    }
    
    /**
     * Increment correct answer streak
     * @returns {number} New streak count
     */
    incrementStreak() { 
        this.correctStreak++; 
        return this.correctStreak; 
    }
    
    /**
     * Reset the correct answer streak to zero
     */
    resetStreak() { 
        this.correctStreak = 0; 
    }
    
    /**
     * Check if the current level is complete (required streak reached)
     * @returns {boolean} True if level is complete
     */
    isComplete() { 
        return this.correctStreak >= CONFIG.REQUIRED_STREAK; 
    }
}

/**
 * Timer class provides stopwatch functionality with display updates
 * Manages timing for game sessions and formats time for display
 */
export class Timer {
    /**
     * Create a new timer instance
     * @param {HTMLElement} displayElement - DOM element to update with time display
     */
    constructor(displayElement) { 
        this.display = displayElement; 
        this.reset(); 
    }
    
    /**
     * Reset timer to initial state
     */
    reset() { 
        this.startTime = 0;     // Timestamp when timer started
        this.interval = null;   // Reference to setInterval for cleanup
        this.seconds = 0;       // Current elapsed seconds
    }
    
    /**
     * Start the timer and begin display updates
     */
    start() {
        this.reset();
        this.startTime = Date.now();
        
        // Update display immediately
        if(this.display) this.display.textContent = this.formatTime(0);
        
        // Update display every second
        this.interval = setInterval(() => {
            this.seconds = Math.floor((Date.now() - this.startTime) / 1000);
            if(this.display) this.display.textContent = this.formatTime(this.seconds);
        }, 1000);
    }
    
    /**
     * Stop the timer and clear the update interval
     */
    stop() { 
        clearInterval(this.interval); 
    }
    
    /**
     * Get the current elapsed time in seconds
     * @returns {number} Elapsed seconds
     */
    getSeconds() { 
        return this.seconds; 
    }
    
    /**
     * Format seconds into MM:SS display format
     * @param {number} sec - Seconds to format
     * @returns {string} Formatted time string (MM:SS)
     */
    formatTime(sec) {
        const minutes = Math.floor(sec / 60).toString().padStart(2, '0');
        const seconds = (sec % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
}

/**
 * StorageManager provides localStorage interface for game data persistence
 * Handles best time storage and performance rating calculations
 */
export class StorageManager {
    /**
     * Save a best time record for a specific level
     * @param {string} levelKey - Unique identifier for the level
     * @param {number} time - Time in seconds to save
     */
    static saveBestTime(levelKey, time) {
        localStorage.setItem(`${CONFIG.STORAGE_PREFIX}${levelKey}`, time);
    }
    
    /**
     * Retrieve the best time for a specific level
     * @param {string} levelKey - Unique identifier for the level
     * @returns {number|null} Best time in seconds, or null if no record exists
     */
    static getBestTime(levelKey) {
        const time = localStorage.getItem(`${CONFIG.STORAGE_PREFIX}${levelKey}`);
        return time ? parseInt(time, 10) : null;
    }
    
    /**
     * Calculate performance rating based on completion time
     * @param {number} time - Total completion time in seconds
     * @param {string} levelKey - Level identifier for difficulty adjustment
     * @returns {Object} Rating object with name, key, and performance thresholds
     */
    static getRating(time, levelKey = null) {
        return RatingUtils.getRating(time, levelKey, CONFIG.REQUIRED_STREAK, CONFIG);
    }
}