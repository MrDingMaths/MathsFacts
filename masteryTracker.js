// masteryTracker.js - Topic Mastery Progress Tracking System
import { CONFIG } from './config.js';
import { StorageManager } from './gameState.js';

export class MasteryTracker {
    constructor() {
        this.STORAGE_KEY = 'mf_mastery_progress_v1';
        this.TOPIC_GROUPS = {
            'Number Bonds': {
                name: 'Number Bonds Mastery',
                levels: ['bonds10', 'bonds20', 'mixed10-20', 'bonds90', 'bonds100', 'bonds-10', 'bonds-20', 'bonds-50'],
                color: '#34d399'
            },
            'Multiplication & Division': {
                name: 'Multiplication Mastery', 
                levels: ['group245', 'group369', 'multall', 'mixed-negative-mult', 'powersOf10', 'double100', 'squares', 'unitConversions'],
                color: '#34d399'
            },
            'Fractions Decimals Percentages': {
                name: 'Fractions Mastery',
                levels: ['hcf', 'lcm', 'equivFractions', 'simplifyFractions', 'fdpConversions', 'fdpConversionsMultiples', 'fractionOfQuantity', 'percentageOfQuantity'],
                color: '#34d399'
            }
        };
        this.initializeStorage();
    }

    // Initialize storage with default progress data
    initializeStorage() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) {
            const defaultData = {
                version: 1,
                topicProgress: {},
                lastUpdated: Date.now()
            };
            
            // Initialize each topic with zero progress
            Object.keys(this.TOPIC_GROUPS).forEach(topicKey => {
                defaultData.topicProgress[topicKey] = {
                    masteredLevels: [],
                    totalLevels: this.TOPIC_GROUPS[topicKey].levels.length,
                    progress: 0
                };
            });
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultData));
        }
    }

    // Calculate current mastery progress for all topics
    calculateMasteryProgress() {
        const progressData = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        
        Object.keys(this.TOPIC_GROUPS).forEach(topicKey => {
            const topicInfo = this.TOPIC_GROUPS[topicKey];
            const currentProgress = progressData.topicProgress[topicKey];
            const masteredLevels = new Set();
            
            // Check each level in this topic
            topicInfo.levels.forEach(levelKey => {
                const bestTime = StorageManager.getBestTime(levelKey);
                if (bestTime) {
                    const rating = StorageManager.getRating(bestTime, levelKey);
                    // Count mastery and true-mastery levels
                    if (rating && (rating.key === 'mastery' || rating.key === 'true-mastery')) {
                        masteredLevels.add(levelKey);
                    }
                }
            });
            
            // Update progress data
            currentProgress.masteredLevels = Array.from(masteredLevels);
            currentProgress.progress = masteredLevels.size / topicInfo.levels.length;
        });
        
        // Update timestamp and save
        progressData.lastUpdated = Date.now();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progressData));
        
        return progressData.topicProgress;
    }

    // Update mastery progress when a level is completed
    updateMasteryProgress(levelKey, newRating) {
        // Only update if this is an improvement to mastery or true-mastery
        if (!newRating || (newRating.key !== 'mastery' && newRating.key !== 'true-mastery')) {
            return false;
        }

        // Find which topic this level belongs to
        let targetTopic = null;
        Object.keys(this.TOPIC_GROUPS).forEach(topicKey => {
            if (this.TOPIC_GROUPS[topicKey].levels.includes(levelKey)) {
                targetTopic = topicKey;
            }
        });

        if (!targetTopic) return false;

        // Get current rating for this level
        const bestTime = StorageManager.getBestTime(levelKey);
        const currentRating = bestTime ? StorageManager.getRating(bestTime, levelKey) : null;
        
        // Check if this is actually an improvement
        if (currentRating && (currentRating.key === 'mastery' || currentRating.key === 'true-mastery')) {
            // Already mastered, no change needed unless it's a rating improvement
            if (currentRating.key === newRating.key) {
                return false; // No improvement
            }
        }

        // Recalculate all progress (this handles the improvement logic)
        this.calculateMasteryProgress();
        return true;
    }

    // Get progress data for UI rendering
    getTopicProgressData() {
        const progressData = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        
        return Object.keys(this.TOPIC_GROUPS).map(topicKey => {
            const topicInfo = this.TOPIC_GROUPS[topicKey];
            const progress = progressData.topicProgress[topicKey];
            
            return {
                key: topicKey,
                name: topicInfo.name,
                color: topicInfo.color,
                progress: progress.progress,
                masteredCount: progress.masteredLevels.length,
                totalCount: progress.totalLevels,
                percentage: Math.round(progress.progress * 100)
            };
        });
    }

    // Get next available level for "Continue to Next Challenge" functionality
    getNextAvailableLevel() {
        const allLevels = [];
        
        // Flatten all levels in order
        Object.keys(CONFIG.LEVEL_GROUPS).forEach(groupName => {
            CONFIG.LEVEL_GROUPS[groupName].forEach(level => {
                allLevels.push(level);
            });
        });

        // Find the first level that's not at mastery or true mastery
        for (const level of allLevels) {
            const bestTime = StorageManager.getBestTime(level.key);
            if (!bestTime) {
                // Never attempted - this is the next level
                return level;
            }
            
            const rating = StorageManager.getRating(bestTime, level.key);
            if (!rating || (rating.key !== 'mastery' && rating.key !== 'true-mastery')) {
                // Not at mastery level - this is the next level to work on
                return level;
            }
        }
        
        // All levels are at mastery or true mastery, return the first level for practice
        return allLevels[0];
    }

    // Reset mastery progress (for testing/admin purposes)
    resetProgress() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.initializeStorage();
    }
}