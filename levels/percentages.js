/**
 * Percentage question generators
 */

/**
 * Generate "percentage of quantity" questions (e.g., 25% of 80 = ?)
 * @returns {Object} Question object for percentage calculations
 */
export function generatePercentageOfQuantity(inputPlaceholder) {
    // Define percentages with their corresponding quantities that yield whole numbers
    const percentageData = {
        // Basic Percentages (Building blocks)
        1: [100, 200, 300, 400, 500, 1000, 2500],
        5: [20, 40, 60, 80, 100, 200, 400, 600, 1000],
        10: [10, 20, 30, 50, 80, 100, 150, 200, 500, 1000],
        20: [5, 10, 15, 20, 25, 50, 100, 150, 200, 300],
        25: [4, 8, 12, 16, 20, 40, 60, 80, 100, 200, 400],
        50: [2, 4, 10, 12, 20, 30, 50, 80, 100, 150, 200],

        // Multi-step Percentages
        15: [20, 40, 60, 80, 100, 120, 200, 400], // (10% + 5%)
        30: [10, 20, 30, 40, 50, 100, 120, 200, 300, 500],
        40: [5, 10, 15, 20, 25, 50, 100, 150, 200, 500],
        60: [5, 10, 15, 20, 25, 50, 100, 150, 200, 300],
        75: [4, 8, 12, 16, 20, 40, 60, 80, 100, 200, 400],
        90: [10, 20, 30, 50, 90, 100, 110, 200, 500, 1000],

        // Percentages Over 100%
        110: [10, 20, 50, 80, 100, 120, 200, 300, 500],
        125: [4, 8, 16, 20, 40, 80, 100, 200, 400],
        150: [2, 4, 6, 8, 10, 20, 50, 100, 120, 200],
        200: [1, 2, 5, 10, 15, 25, 50, 100, 120, 200],
        250: [2, 4, 10, 20, 40, 50, 100, 200, 400],
        300: [1, 2, 3, 5, 10, 25, 50, 100, 150, 200]
    };

    // Choose a percentage
    const percentages = Object.keys(percentageData).map(Number);
    const percentage = percentages[Math.floor(Math.random() * percentages.length)];

    // Choose a quantity that will give a whole number result
    const availableQuantities = percentageData[percentage];
    const quantity = availableQuantities[Math.floor(Math.random() * availableQuantities.length)];

    const answer = Math.round(percentage * quantity / 100);

    // Format the question using LaTeX
    const questionFormat = `${percentage}\\% \\text{ of } ${quantity} = ${inputPlaceholder}`;

    return {
        format: questionFormat,
        answer: answer
    };
}

/**
 * Generate "increase/decrease by percentage" questions with mixed percentage-of questions
 * Includes: "increase X by Y%", "decrease X by Y%", and "Y% of X" questions
 * @returns {Object} Question object for percentage increase/decrease operations
 */
export function generateIncreaseDecreasePercentage(inputPlaceholder) {
    // Define percentages suitable for increase/decrease operations
    const percentageData = {
        5: [20, 40, 60, 80, 100, 200, 400, 600, 1000],
        10: [10, 20, 30, 50, 80, 100, 150, 200, 500, 1000],
        15: [20, 40, 60, 80, 100, 120, 200, 400],
        20: [5, 10, 15, 20, 25, 50, 100, 150, 200, 300],
        25: [4, 8, 12, 16, 20, 40, 60, 80, 100, 200, 400],
        30: [10, 20, 30, 40, 50, 100, 120, 200, 300, 500],
        40: [5, 10, 15, 20, 25, 50, 100, 150, 200, 500],
        50: [2, 4, 10, 12, 20, 30, 50, 80, 100, 150, 200]
    };

    // Determine question type: 40% increase, 40% decrease, 20% standard percentage
    const rand = Math.random();

    // Choose a percentage
    const percentages = Object.keys(percentageData).map(Number);
    const percentage = percentages[Math.floor(Math.random() * percentages.length)];

    // Choose a quantity that will give a whole number result
    const availableQuantities = percentageData[percentage];
    const originalQuantity = availableQuantities[Math.floor(Math.random() * availableQuantities.length)];

    if (rand < 0.4) {
        // INCREASE by percentage
        const change = Math.round(percentage * originalQuantity / 100);
        const finalAmount = originalQuantity + change;
        const questionFormat = `\\text{increase } ${originalQuantity} \\text{ by } ${percentage}\\% = ${inputPlaceholder}`;
        return {
            format: questionFormat,
            answer: finalAmount
        };
    } else if (rand < 0.8) {
        // DECREASE by percentage
        const change = Math.round(percentage * originalQuantity / 100);
        const finalAmount = originalQuantity - change;
        const questionFormat = `\\text{decrease } ${originalQuantity} \\text{ by } ${percentage}\\% = ${inputPlaceholder}`;
        return {
            format: questionFormat,
            answer: finalAmount
        };
    } else {
        // STANDARD percentage of quantity (like percentageOfQuantity)
        const answer = Math.round(percentage * originalQuantity / 100);
        const questionFormat = `${percentage}\\% \\text{ of } ${originalQuantity} = ${inputPlaceholder}`;
        return {
            format: questionFormat,
            answer: answer
        };
    }
}
