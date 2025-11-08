/**
 * Helper utilities for question generators
 */

/**
 * Find the greatest common divisor of two numbers using Euclidean algorithm
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Greatest common divisor of a and b
 */
export function gcd(a, b) {
    if (b === 0) {
        return a;
    }
    return gcd(b, a % b);
}

/**
 * Generate Fraction-Decimal-Percentage conversion questions
 * @param {Array} conversionSet - Array of conversion objects with fraction, decimal, percentage values
 * @param {string} inputPlaceholder - Placeholder text for input
 * @returns {Object} Question object with format, answer, and question parts
 */
export function generateFDP(conversionSet, inputPlaceholder) {
    const chosen = conversionSet[Math.floor(Math.random() * conversionSet.length)];

    if (chosen.isRecurring) {
        const givenType = Math.random() < 0.5 ? 'decimal' : 'percentage';
        return {
            format: `{{FDP_CONVERSION_CHALLENGE}}`,
            answer: { fraction: { num: chosen.f_n, den: chosen.f_d } },
            questionParts: {
                givenType: 'recurring',
                givenValue: givenType === 'decimal' ? chosen.d_str : chosen.p_str,
                givenValueType: givenType,
                values: {
                    decimal: chosen.d_str,
                    percentage: chosen.p_str
                }
            }
        };
    } else {
        const types = ['fraction', 'decimal', 'percentage'];
        const givenType = types[Math.floor(Math.random() * types.length)];

        const questionParts = {
            givenType: givenType,
            fraction: null, decimal: null, percentage: null
        };
        const answer = {};

        if (givenType === 'fraction') {
            questionParts.fraction = { num: chosen.f_n, den: chosen.f_d };
            answer.decimal = chosen.d;
            answer.percentage = chosen.p;
        } else if (givenType === 'decimal') {
            questionParts.decimal = chosen.d;
            answer.fraction = { num: chosen.f_n, den: chosen.f_d };
            answer.percentage = chosen.p;
        } else { // percentage
            questionParts.percentage = chosen.p;
            answer.fraction = { num: chosen.f_n, den: chosen.f_d };
            answer.decimal = chosen.d;
        }

        return {
            format: `{{FDP_CONVERSION_CHALLENGE}}`,
            answer: answer,
            questionParts: questionParts
        };
    }
}
