/**
 * Configuration constants for Maths Facts Challenge
 * Central configuration file containing all game settings, level definitions,
 * difficulty adjustments, rating thresholds, and UI parameters
 */
export const CONFIG = {
    /**
     * Hierarchical organization of all skill levels grouped by mathematical domain
     * Each group contains an array of level objects with keys, names, and parameters
     */
    LEVEL_GROUPS: {
        // Foundation arithmetic skills - addition and subtraction to target numbers
        "Number Bonds": [
            { key: 'bonds10', name: 'Bonds to 10', value: 10 },
            { key: 'bonds20', name: 'Bonds to 20', value: 20 },
            { key: 'mixed10-20', name: 'Mixed Bonds 10-20', customMixedRange: [10, 20] },
            { key: 'bonds100', name: 'Bonds to 100', value: 100 },
            { key: 'bonds-10', name: 'Bonds to -10', value: -10 },
            { key: 'bonds-20', name: 'Bonds to -20', value: -20 },
        ],
        // Times tables, division facts, and related multiplicative concepts
        "Multiplication & Division": [
            { key: 'group245', name: '× 2 4 5 10' },
            { key: 'group369', name: '× 3 6 9' },
            { key: 'multall', name: '× 2 to 12' },
            { key: 'mixed-negative-mult', name: '× Negatives' },
            { key: 'multiplyDivideBy100', name: '×÷ 100' },
            { key: 'powersOf10', name: '×÷ Powers of 10' },
            { key: 'double100', name: 'Doubling' },
            { key: 'squares', name: 'Perfect Squares' },
            { key: 'unitConversions', name: 'Unit Conversions' },
        ],
        // Advanced topics involving rational numbers and their representations
        "Fractions Decimals Percentages": [
            { key: 'hcf', name: 'HCF' },
            { key: 'lcm', name: 'LCM' },
            { key: 'equivFractions', name: 'Equivalent Fractions' },
            { key: 'simplifyFractions', name: 'Simplifying Fractions' },
            { key: 'fdpConversions', name: 'Common FDP Equivalences' },
            { key: 'fdpConversionsMultiples', name: 'FDP Conversions' },
            { key: 'fractionOfQuantity', name: 'Fraction of a Quantity' },
            { key: 'percentageOfQuantity', name: 'Percentage of a Quantity' },
            { key: 'increaseDecreasePercentage', name: 'Increase and Decrease by Percentage' },
        ]
    },
    // Number of consecutive correct answers required to complete a level
    REQUIRED_STREAK: 15,
    // UI timing delays in milliseconds
    FEEDBACK_DELAY_CORRECT: 300,    // Brief pause after correct answers
    FEEDBACK_DELAY_INCORRECT: 1000,  // Longer pause to show correct answer after mistakes
    // Random positive reinforcement messages for correct answers
    POSITIVE_FEEDBACK: ["Awesome!", "Great Job!", "You got it!", "Fantastic!", "Brilliant!", "Keep it up!"],
    // Encouraging messages for first incorrect attempt to support learning
    SECOND_CHANCE_FEEDBACK: ["Try again", "Not quite right", "Have another go!", "Take another shot at it!"],
    /**
     * Performance rating system based on average time per question
     * Ratings progress from beginner to true mastery based on speed and accuracy
     */
    RATING_THRESHOLDS: [
        { maxAvg: 1.5, name: "💖 Maths Queen 💖", key: "true-mastery" },
        { maxAvg: 2, name: "⚡️ Mastery ⚡️", key: "mastery" },
        { maxAvg: 3, name: "Expert", key: "expert" },
        { maxAvg: 4, name: "Developing", key: "developing" },
        { maxAvg: Infinity, name: "Beginner", key: "beginner" }
    ],
    /**
     * Difficulty adjustment multipliers for performance rating calculations
     * Higher multipliers make it easier to achieve good ratings on harder topics
     * Ensures fair assessment across different mathematical domains
     */
    LEVEL_DIFFICULTY_MULTIPLIERS: {
        // Number Bonds - foundational skills, students should achieve fluency
        'bonds10': 1,           // Very basic, Year 8s should be fast
        'bonds20': 1,           // Still basic
        'mixed10-20': 1.0,        // Mixed requires more thinking
        'bonds100': 1.2,          // Common benchmark, standard speed
        'bonds-10': 1.5,          // Negative numbers add complexity
        'bonds-20': 1.5,          // More negative complexity

        // Multiplication & Division - essential facts requiring memorization
        'group245': 1,          // Easy tables (2,4,5,10)
        'group369': 1,          // Medium tables (3,6,9)
        'multall': 1,           // Full tables (2-12), more variety
        'mixed-negative-mult': 1.5, // Negatives add significant complexity
        'multiplyDivideBy100': 1.5, // Focused on single power, pattern-based
        'powersOf10': 2,        // Pattern-based, should be quick
        'double100': 1.5,         // Doubling is systematic
        'squares': 1,           // Need memorization but predictable
        'unitConversions': 5,   // Requires knowledge + calculation

        // Fractions Decimals Percentages - complex multi-step calculations
        'hcf': 1.5,               // Requires factorization
        'lcm': 2,               // Requires multiples
        'equivFractions': 1.8,    // Two inputs but straightforward concept
        'simplifyFractions': 2.8, // Two inputs, division/factoring
        'fdpConversions': 2,    // Multiple inputs (3-4 fields), complex
        'fdpConversionsMultiples': 2.5, // Even more complex calculations
        'fractionOfQuantity': 2, // Multiplication + fractions
        'percentageOfQuantity': 2, // Percentage calculations
        'increaseDecreasePercentage': 2.0, // Increase/decrease operations with percentage of questions

        // Fallback multiplier for any levels not explicitly configured
        'default': 1.0
    },
    // localStorage key prefix for best time records (includes version for data migration)
    STORAGE_PREFIX: 'mf_bestTime_v1_',
    // Confetti animation particle counts for different celebration levels
    CONFETTI: { 
        CORRECT: 40,     // Moderate celebration for individual correct answers
        SUCCESS: 150     // Major celebration for level completion
    }
};