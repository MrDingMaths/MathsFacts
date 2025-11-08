/**
 * Multiplication and division question generators
 */

/**
 * Generate multiplication/division questions for a single times table
 * @param {number} table - The times table to use (e.g., 3 for 3x table)
 * @returns {Object} Question object for times table facts
 */
export function generateSingleTableFacts(table, inputPlaceholder) {
    const factor = Math.floor(Math.random() * 12) + 1;
    const product = table * factor;
    const type = Math.floor(Math.random() * 4);
    switch(type) {
        case 0: return { format: `${table} \\times ${inputPlaceholder} = ${product}`, answer: factor };
        case 1: return { format: `${inputPlaceholder} \\times ${factor} = ${product}`, answer: table };
        case 2: return { format: `${product} \\div ${table} = ${inputPlaceholder}`, answer: factor };
        default: return { format: `${product} \\div ${inputPlaceholder} = ${factor}`, answer: table };
    }
}

/**
 * Generate multiplication/division questions with negative numbers
 * @param {number} table - The times table to use with negatives
 * @returns {Object} Question object for negative multiplication/division
 */
export function generateNegativeTableFacts(table, inputPlaceholder) {
    let factor = Math.floor(Math.random() * 12) + 1;
    if (Math.random() < 0.5) { table = -table; } else { factor = -factor; }
    const product = table * factor;
    const type = Math.floor(Math.random() * 4);
    switch(type) {
        case 0: return { format: `${table} \\times ${inputPlaceholder} = ${product}`, answer: factor };
        case 1: return { format: `${inputPlaceholder} \\times ${factor} = ${product}`, answer: table };
        case 2: return { format: `${product} \\div ${table} = ${inputPlaceholder}`, answer: factor };
        default: return { format: `${product} \\div ${inputPlaceholder} = ${factor}`, answer: table };
    }
}

/**
 * Generate questions from a group of times tables
 * @param {Array} tables - Array of table numbers to choose from
 * @returns {Object} Question object from randomly selected table
 */
export function generateGroupFacts(tables, inputPlaceholder) {
    const table = tables[Math.floor(Math.random() * tables.length)];
    return generateSingleTableFacts(table, inputPlaceholder);
}

/**
 * Generate doubling questions (n × 2 = ?)
 * @param {number} maxNumber - Maximum number to double
 * @returns {Object} Question object for doubling
 */
export function generateDoubling(maxNumber, inputPlaceholder) {
    const number = Math.floor(Math.random() * maxNumber) + 1;
    const double = number * 2;
    return { format: `${number} \\times 2 = ${inputPlaceholder}`, answer: double };
}
