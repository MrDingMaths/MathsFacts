/**
 * Powers and squares question generators
 */

/**
 * Generate perfect square questions (n² = ? or √n = ?)
 * @returns {Object} Question object for squares or square roots
 */
export function generatePerfectSquares(inputPlaceholder) {
    const base = Math.floor(Math.random() * 20) + 1;
    const square = base * base;
    if (Math.random() < 0.5) {
        return { format: `${base}^2 = ${inputPlaceholder}`, answer: square };
    } else {
        return { format: `\\sqrt{${square}} = ${inputPlaceholder}`, answer: base };
    }
}

/**
 * Generate powers of 10 multiplication/division questions
 * @returns {Object} Question object for powers of 10 operations
 */
export function generatePowersOf10(inputPlaceholder) {
    const power = [10, 100, 1000][Math.floor(Math.random() * 3)];
    const isMultiplication = Math.random() < 0.5;
    const num = (Math.floor(Math.random() * 99) + 1) / ([1, 10, 100, 1000][Math.floor(Math.random() * 5)]);
    if (isMultiplication) {
        return { format: `${num} \\times ${power} = ${inputPlaceholder}`, answer: parseFloat((num * power).toPrecision(15)) };
    } else {
        return { format: `${num} \\div ${power} = ${inputPlaceholder}`, answer: parseFloat((num / power).toPrecision(15)) };
    }
}

/**
 * Generate multiplication/division by 100 questions only
 * Simplified version of powersOf10 focused on a single power
 * @returns {Object} Question object for multiply/divide by 100
 */
export function generateMultiplyDivideBy100(inputPlaceholder) {
    const power = 100;
    const isMultiplication = Math.random() < 0.5;
    const num = (Math.floor(Math.random() * 999) + 1) / ([1, 10, 100, 1000, 10000][Math.floor(Math.random() * 5)]);
    if (isMultiplication) {
        return { format: `${num} \\times ${power} = ${inputPlaceholder}`, answer: parseFloat((num * power).toPrecision(15)) };
    } else {
        return { format: `${num} \\div ${power} = ${inputPlaceholder}`, answer: parseFloat((num / power).toPrecision(15)) };
    }
}
