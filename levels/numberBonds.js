/**
 * Number bonds question generator
 */

/**
 * Generate number bond questions (e.g., 5 + ? = 10, 10 - ? = 4)
 * @param {number} value - Target sum for bonds
 * @param {Array} customMixedRange - Optional [min, max] range for mixed bonds
 * @returns {Object} Question object for number bonds
 */
export function generateBonds(value, customMixedRange, inputPlaceholder) {
    let total;
    if (customMixedRange) {
        const [min, max] = customMixedRange;
        total = Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        total = value;
    }
    const num1 = Math.floor(Math.random() * (Math.abs(total) + 1));
    const num2 = total - num1;

    const formatType = Math.floor(Math.random() * 6); // 0, 1, 2, 3, 4, or 5
    switch(formatType) {
        case 0: return { format: `${num1} + ${inputPlaceholder} = ${total}`, answer: num2 };
        case 1: return { format: `${inputPlaceholder} + ${num2} = ${total}`, answer: num1 };
        case 2: return { format: `${total} = ${num1} + ${inputPlaceholder}`, answer: num2 };
        case 3: return { format: `${total} - ${inputPlaceholder} = ${num2}`, answer: num1 };
        case 4: return { format: `${total} - ${num1} = ${inputPlaceholder}`, answer: num2 };
        case 5: return { format: `${inputPlaceholder} = ${total} - ${num1}`, answer: num2 };
    }
}
