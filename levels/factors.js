/**
 * HCF and LCM question generators
 */

import { gcd } from './helpers.js';

/**
 * Generate Highest Common Factor (HCF) questions
 * @returns {Object} Question object asking for HCF of two numbers
 */
export function generateHCF(inputPlaceholder) {
    // Predefined common factors to ensure reasonable difficulty
    const commonFactors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 20, 25, 30];
    const hcf = commonFactors[Math.floor(Math.random() * commonFactors.length)];
    let m1, m2;
    do {
        m1 = Math.floor(Math.random() * 10) + 2;
        m2 = Math.floor(Math.random() * 10) + 2;
    } while (m1 === m2 || gcd(m1, m2) !== 1);

    let num1 = hcf * m1;
    let num2 = hcf * m2;
    if (Math.random() < 0.5) { [num1, num2] = [num2, num1]; }
    return { format: `\\text{HCF}(${num1}, ${num2}) = ${inputPlaceholder}`, answer: hcf };
}

/**
 * Generate Lowest Common Multiple (LCM) questions
 * @returns {Object} Question object asking for LCM of two numbers
 */
export function generateLCM(inputPlaceholder) {
    // Predefined denominators to ensure reasonable LCM values
    const denominators = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 20];
    // Calculate LCM using the formula: LCM(a,b) = (a*b) / GCD(a,b)
    const calculateLcm = (a, b) => (a * b) / gcd(a, b);
    let num1, num2, lcm;
    do {
        const index1 = Math.floor(Math.random() * denominators.length);
        let index2;
        do {
            index2 = Math.floor(Math.random() * denominators.length);
        } while (index1 === index2);
        num1 = denominators[index1];
        num2 = denominators[index2];
        lcm = calculateLcm(num1, num2);
    } while (lcm > 120);
    if (Math.random() < 0.5) { [num1, num2] = [num2, num1]; }
    return { format: `\\text{LCM}(${num1}, ${num2}) = ${inputPlaceholder}`, answer: lcm };
}
