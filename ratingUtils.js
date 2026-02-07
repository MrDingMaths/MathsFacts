// Rating Utilities - Shared rating calculation logic
// Used by both main game system and progress tracking system for consistency

export class RatingUtils {
    /**
     * Calculate performance rating based on time and level difficulty
     * @param {number} totalTime - Total time taken in seconds  
     * @param {string} levelKey - Level identifier for difficulty adjustment
     * @param {number} questionCount - Number of questions (default: CONFIG.REQUIRED_STREAK)
     * @param {Object} config - Configuration object with thresholds and multipliers
     * @returns {Object} Rating object with name, key, maxAvg properties
     */
    static getRating(totalTime, levelKey = null, questionCount = null, config = null) {
        // Use global CONFIG if not provided
        if (!config && typeof window !== 'undefined' && window.CONFIG) {
            config = window.CONFIG;
        }
        
        if (!config) {
            throw new Error('Configuration object is required for rating calculation');
        }

        // Use default question count if not provided
        if (!questionCount) {
            questionCount = config.REQUIRED_STREAK || 15;
        }

        // Calculate average time per question
        let avgTime = totalTime / questionCount;
        
        // Apply difficulty multiplier if level key is provided
        if (levelKey && config.LEVEL_DIFFICULTY_MULTIPLIERS && config.LEVEL_DIFFICULTY_MULTIPLIERS[levelKey]) {
            avgTime /= config.LEVEL_DIFFICULTY_MULTIPLIERS[levelKey];
        } else if (levelKey && config.LEVEL_DIFFICULTY_MULTIPLIERS) {
            // Use default multiplier for levels not specifically configured
            avgTime /= (config.LEVEL_DIFFICULTY_MULTIPLIERS.default || 1.0);
        }
        
        // Find the appropriate rating threshold
        if (config.RATING_THRESHOLDS) {
            return config.RATING_THRESHOLDS.find(r => avgTime <= r.maxAvg) || config.RATING_THRESHOLDS[config.RATING_THRESHOLDS.length - 1];
        }
        
        // Fallback to default thresholds if config is missing RATING_THRESHOLDS
        const defaultThresholds = [
            { maxAvg: 1.5, name: "💖 Maths Queen 💖", key: "true-mastery" },
            { maxAvg: 2, name: "⚡️ Mastery ⚡️", key: "mastery" },
            { maxAvg: 3, name: "Expert", key: "expert" },
            { maxAvg: 4, name: "Developing", key: "developing" },
            { maxAvg: Infinity, name: "Beginner", key: "beginner" }
        ];
        
        return defaultThresholds.find(r => avgTime <= r.maxAvg);
    }

    /**
     * Convert rating key to progress UI format
     * @param {Object} rating - Rating object from getRating()
     * @returns {Object} Progress UI format with emoji and class
     */
    static toProgressUIFormat(rating) {
        if (!rating) return { emoji: '⚪', class: 'rating-none' };

        const emojiMap = {
            'true-mastery': '💖',
            'mastery': '⚡', 
            'expert': '🎯',
            'developing': '👍',
            'beginner': '📚'
        };

        return {
            emoji: emojiMap[rating.key] || '📚',
            class: `rating-${rating.key === 'true-mastery' ? 'queen' : rating.key}`
        };
    }

    /**
     * Calculate average time per question from total time
     * @param {number} totalTime - Total time in seconds
     * @param {number} questionCount - Number of questions
     * @returns {number} Average time per question
     */
    static calculateAverageTime(totalTime, questionCount = 15) {
        return totalTime / questionCount;
    }

    /**
     * Apply difficulty multiplier to time
     * @param {number} avgTime - Average time per question
     * @param {string} levelKey - Level identifier
     * @param {Object} config - Configuration object
     * @returns {number} Adjusted average time
     */
    static applyDifficultyMultiplier(avgTime, levelKey, config = null) {
        if (!config && typeof window !== 'undefined' && window.CONFIG) {
            config = window.CONFIG;
        }

        if (!config || !levelKey || !config.LEVEL_DIFFICULTY_MULTIPLIERS) {
            return avgTime;
        }

        const multiplier = config.LEVEL_DIFFICULTY_MULTIPLIERS[levelKey] || config.LEVEL_DIFFICULTY_MULTIPLIERS.default || 1.0;
        return avgTime / multiplier;
    }

    /**
     * Calculate the target time needed to achieve the next better rating
     * @param {Object} currentRating - Rating object from getRating() with key property
     * @param {string} levelKey - Level identifier for difficulty adjustment
     * @param {number} questionCount - Number of questions in the challenge
     * @param {Object} config - Configuration object with thresholds and multipliers
     * @returns {Object|null} { nextRating, targetTime } or null if already at best rating
     */
    static getNextRatingTarget(currentRating, levelKey, questionCount, config = null) {
        if (!config && typeof window !== 'undefined' && window.CONFIG) {
            config = window.CONFIG;
        }
        if (!config || !config.RATING_THRESHOLDS || !currentRating) return null;

        const thresholds = config.RATING_THRESHOLDS;
        const currentIndex = thresholds.findIndex(r => r.key === currentRating.key);

        // Already at best rating (true-mastery at index 0)
        if (currentIndex <= 0) return null;

        const nextRating = thresholds[currentIndex - 1];
        const difficultyMultiplier = (levelKey && config.LEVEL_DIFFICULTY_MULTIPLIERS)
            ? (config.LEVEL_DIFFICULTY_MULTIPLIERS[levelKey] || config.LEVEL_DIFFICULTY_MULTIPLIERS.default || 1.0)
            : 1.0;

        // Reverse the rating formula: targetTime = maxAvg * multiplier * questionCount
        const targetTime = nextRating.maxAvg * difficultyMultiplier * questionCount;
        return { nextRating, targetTime };
    }
}