/**
 * Fraction and Decimal question generators
 */

import { gcd, generateFDP } from './helpers.js';

/**
 * Generate common FDP conversion questions using predefined equivalences
 * @returns {Object} Question object for common fraction/decimal/percentage conversions
 */
export function generateFDPConversions(inputPlaceholder) {
    const conversions = [
        { f_n: 1, f_d: 100, d: 0.01, p: 1 },
        { f_n: 1, f_d: 50,  d: 0.02, p: 2 },
        { f_n: 1, f_d: 20,  d: 0.05, p: 5 },
        { f_n: 1, f_d: 10,  d: 0.1,  p: 10 },
        { f_n: 1, f_d: 5,   d: 0.2,  p: 20 },
        { f_n: 1, f_d: 4,   d: 0.25, p: 25 },
        { f_n: 1, f_d: 2,   d: 0.5,  p: 50 },
        { f_n: 1, f_d: 3, isRecurring: true, d_str: "0.\\overline{3}", p_str: "33 \\frac{1}{3}\\%" }
    ];
    return generateFDP(conversions, inputPlaceholder);
}

/**
 * Generate more complex FDP conversion questions with multiple denominators
 * @returns {Object} Question object for complex fraction/decimal/percentage conversions
 */
export function generateFDPConversionsMultiples(inputPlaceholder) {
    const denominators = [3, 4, 5, 8, 10, 20];
    let n, d;

    do {
        d = denominators[Math.floor(Math.random() * denominators.length)];
        n = Math.floor(Math.random() * (d - 1)) + 1;
    } while (gcd(n, d) !== 1);

    if (Math.random() < 0.25) {
        n += d;
    }

    const f_n = n;
    const f_d = d;
    let conversion;

    if (f_d === 3) {
        const wholePart = Math.floor(f_n / f_d);
        const remainderN = f_n % f_d;
        const percentageWhole = wholePart * 100 + (remainderN === 1 ? 33 : 66);

        conversion = {
            f_n: f_n, f_d: f_d, isRecurring: true,
            d_str: `${wholePart > 0 ? wholePart : ''}.\\overline{${remainderN === 1 ? '3' : '6'}}`,
            p_str: `${percentageWhole} \\frac{${remainderN}}{3}\\%`
        };
    } else {
        conversion = {
            f_n: f_n, f_d: f_d,
            d: f_n / f_d,
            p: (f_n / f_d) * 100
        };
    }

    return generateFDP([conversion], inputPlaceholder);
}

/**
 * Generate equivalent fraction questions (e.g., 1/2 = ?/4)
 * @returns {Object} Question object with one missing numerator or denominator
 */
export function generateEquivalentFractions(inputPlaceholder) {
    let baseNum, baseDen;
    do {
        baseNum = Math.floor(Math.random() * 11) + 1;
        baseDen = Math.floor(Math.random() * 11) + 2;
    } while (baseNum >= baseDen || gcd(baseNum, baseDen) !== 1);
    const multiplier = Math.floor(Math.random() * 8) + 2;
    const equivNum = baseNum * multiplier;
    const equivDen = baseDen * multiplier;
    const missing = Math.random() < 0.5 ? 'num' : 'den';
    const answer = missing === 'num' ? equivNum : equivDen;
    return {
        format: `{{EQUIV_FRACTION_CHALLENGE}}`,
        answer: answer,
        questionParts: {
            baseNum: baseNum, baseDen: baseDen,
            equivNum: missing === 'num' ? null : equivNum,
            equivDen: missing === 'den' ? null : equivDen,
        }
    };
}

/**
 * Generate fraction simplification questions (e.g., 6/8 = ?/?)
 * @returns {Object} Question object requiring fraction simplification
 */
export function generateSimplifyFractions(inputPlaceholder) {
    if (Math.random() < 0.25) {
        const angleNumerators = new Set();
        for (let i = 30; i <= 360; i += 30) { angleNumerators.add(i); }
        for (let i = 45; i <= 360; i += 45) { angleNumerators.add(i); }

        const numeratorsArray = Array.from(angleNumerators);
        const complexNum = numeratorsArray[Math.floor(Math.random() * numeratorsArray.length)];
        const complexDen = 360;

        const commonDivisor = gcd(complexNum, complexDen);
        const simpleNum = complexNum / commonDivisor;
        const simpleDen = complexDen / commonDivisor;

        return {
            format: `{{SIMPLIFY_FRACTION_CHALLENGE}}`,
            answer: { num: simpleNum, den: simpleDen },
            questionParts: { complexNum: complexNum, complexDen: complexDen }
        };
    }

    let simpleNum, simpleDen;
    do {
        simpleNum = Math.floor(Math.random() * 10) + 2;
        simpleDen = Math.floor(Math.random() * 10) + 2;
    } while (simpleNum === simpleDen || gcd(simpleNum, simpleDen) !== 1);

    const multiplier = Math.floor(Math.random() * 5) + 2;
    const complexNum = simpleNum * multiplier;
    const complexDen = simpleDen * multiplier;

    return {
        format: `{{SIMPLIFY_FRACTION_CHALLENGE}}`,
        answer: { num: simpleNum, den: simpleDen },
        questionParts: { complexNum: complexNum, complexDen: complexDen }
    };
}

/**
 * Generate "fraction of quantity" questions (e.g., 3/4 of 12 = ?)
 * @returns {Object} Question object for fraction multiplication with whole numbers
 */
export function generateFractionOfQuantity(inputPlaceholder) {
    // A wider set of denominators that are easy to divide by mentally
    const easyDenominators = [2, 3, 4, 5, 6, 8, 10, 12, 20, 25];
    let n, d;

    // This loop will continue until we have a suitable, easy-to-calculate fraction.
    do {
        // Pick a random denominator from our list
        const initialDenominator = easyDenominators[Math.floor(Math.random() * easyDenominators.length)];

        // Generate a numerator that can be larger than the denominator
        const maxNumerator = initialDenominator + Math.floor(initialDenominator / 2) + 3;
        let initialNumerator = Math.floor(Math.random() * maxNumerator) + 1;

        // This avoids trivial fractions like 5/5 or 10/10 before simplification
        if (initialNumerator === initialDenominator) {
            initialNumerator++;
        }

        // Simplify the fraction to its lowest terms (e.g., 6/8 becomes 3/4)
        // Simplify the fraction to its lowest terms using GCD
        const commonDivisor = gcd(initialNumerator, initialDenominator);
        n = initialNumerator / commonDivisor;
        d = initialDenominator / commonDivisor;

    } while (d === 1 || n > 11); // KEY CHANGE: If denominator is 1 OR numerator is too large, try again.

    // Ensure the quantity is a clean multiple of the denominator.
    // Simplified this line as 'n' will never be > 15 with the new rule above.
    const multiplier = Math.floor(Math.random() * 9) + 2; // Generates a number from 2 to 10
    const quantity = d * multiplier;

    // The final answer is (quantity / denominator) * numerator
    const answer = multiplier * n;

    const questionFormat = `\\frac{${n}}{${d}} \\text{ of } ${quantity} = ${inputPlaceholder}`;

    return {
        format: questionFormat,
        answer: answer
    };
}
