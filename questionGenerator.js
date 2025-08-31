/**
 * QuestionGenerator class for Maths Facts Challenge
 * Generates mathematical questions for various skill levels and topics
 */
export class QuestionGenerator {
    constructor() { 
        // Placeholder for input fields in question templates
        this.inputPlaceholder = '{{INPUT}}'; 
    }
    
    /**
     * Generate Fraction-Decimal-Percentage conversion questions
     * @param {Array} conversionSet - Array of conversion objects with fraction, decimal, percentage values
     * @returns {Object} Question object with format, answer, and question parts
     */
    _generateFDP(conversionSet) {
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

    /**
     * Generate common FDP conversion questions using predefined equivalences
     * @returns {Object} Question object for common fraction/decimal/percentage conversions
     */
    generateFDPConversions() {
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
        return this._generateFDP(conversions);
    }

    /**
     * Generate more complex FDP conversion questions with multiple denominators
     * @returns {Object} Question object for complex fraction/decimal/percentage conversions
     */
    generateFDPConversionsMultiples() {

        const denominators = [3, 4, 5, 8, 10, 20];
        let n, d;

        do {
            d = denominators[Math.floor(Math.random() * denominators.length)];
            n = Math.floor(Math.random() * (d - 1)) + 1;
        } while (this._gcd(n, d) !== 1);

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
        
        return this._generateFDP([conversion]);
    }

    /**
     * Generate equivalent fraction questions (e.g., 1/2 = ?/4)
     * @returns {Object} Question object with one missing numerator or denominator
     */
    generateEquivalentFractions() {
        let baseNum, baseDen;
        do {
            baseNum = Math.floor(Math.random() * 11) + 1;
            baseDen = Math.floor(Math.random() * 11) + 2;
        } while (baseNum >= baseDen || this._gcd(baseNum, baseDen) !== 1);
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
    generateSimplifyFractions() {

        if (Math.random() < 0.25) {
            const angleNumerators = new Set();
            for (let i = 30; i <= 360; i += 30) { angleNumerators.add(i); }
            for (let i = 45; i <= 360; i += 45) { angleNumerators.add(i); }
            
            const numeratorsArray = Array.from(angleNumerators);
            const complexNum = numeratorsArray[Math.floor(Math.random() * numeratorsArray.length)];
            const complexDen = 360;
            
            const commonDivisor = this._gcd(complexNum, complexDen);
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
        } while (simpleNum === simpleDen || this._gcd(simpleNum, simpleDen) !== 1);

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
     * Helper function to find the greatest common divisor of two numbers
     * Uses Euclidean algorithm for efficiency
     * @param {number} a - First number
     * @param {number} b - Second number
     * @returns {number} Greatest common divisor of a and b
     * @private
     */
    _gcd(a, b) {
        // Base case: if b is 0, GCD is a
        if (b === 0) {
            return a;
        }
        // Recursive case: GCD(a, b) = GCD(b, a mod b)
        return this._gcd(b, a % b);
    }
	
    /**
     * Generate "fraction of quantity" questions (e.g., 3/4 of 12 = ?)
     * @returns {Object} Question object for fraction multiplication with whole numbers
     */
    generateFractionOfQuantity() {
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
            const commonDivisor = this._gcd(initialNumerator, initialDenominator);
            n = initialNumerator / commonDivisor;
            d = initialDenominator / commonDivisor;
    
        } while (d === 1 || n > 11); // KEY CHANGE: If denominator is 1 OR numerator is too large, try again.
    
        // Ensure the quantity is a clean multiple of the denominator.
        // Simplified this line as 'n' will never be > 15 with the new rule above.
        const multiplier = Math.floor(Math.random() * 9) + 2; // Generates a number from 2 to 10
        const quantity = d * multiplier;
    
        // The final answer is (quantity / denominator) * numerator
        const answer = multiplier * n;
    
        const questionFormat = `\\frac{${n}}{${d}} \\text{ of } ${quantity} = ${this.inputPlaceholder}`;
    
        return {
            format: questionFormat,
            answer: answer
        };
    }
	
    /**
     * Generate "percentage of quantity" questions (e.g., 25% of 80 = ?)
     * @returns {Object} Question object for percentage calculations
     */
    generatePercentageOfQuantity() {
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
		const questionFormat = `${percentage}\\% \\text{ of } ${quantity} = ${this.inputPlaceholder}`;
		
		return {
			format: questionFormat,
			answer: answer
		};
	}
	
    /**
     * Generate Highest Common Factor (HCF) questions
     * @returns {Object} Question object asking for HCF of two numbers
     */
    generateHCF() {
        // Predefined common factors to ensure reasonable difficulty
        const commonFactors = [1, 2, 3 ,4, 5, 6, 7, 8, 9, 10, 11, 12, 20, 25, 30];
        const hcf = commonFactors[Math.floor(Math.random() * commonFactors.length)];
        let m1, m2;
        do {
            m1 = Math.floor(Math.random() * 10) + 2;
            m2 = Math.floor(Math.random() * 10) + 2;
        } while (m1 === m2 || this._gcd(m1, m2) !== 1);
        
        let num1 = hcf * m1;
        let num2 = hcf * m2;
        if (Math.random() < 0.5) { [num1, num2] = [num2, num1]; }
        return { format: `\\text{HCF}(${num1}, ${num2}) = ${this.inputPlaceholder}`, answer: hcf };
    }

    /**
     * Generate Lowest Common Multiple (LCM) questions
     * @returns {Object} Question object asking for LCM of two numbers
     */
    generateLCM() {
        // Predefined denominators to ensure reasonable LCM values
        const denominators = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 20];
        // Calculate LCM using the formula: LCM(a,b) = (a*b) / GCD(a,b)
        const calculateLcm = (a, b) => (a * b) / this._gcd(a, b);
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
        return { format: `\\text{LCM}(${num1}, ${num2}) = ${this.inputPlaceholder}`, answer: lcm };
    }

    /**
     * Generate number bond questions (e.g., 5 + ? = 10, 10 - ? = 4)
     * @param {number} value - Target sum for bonds
     * @param {Array} customMixedRange - Optional [min, max] range for mixed bonds
     * @returns {Object} Question object for number bonds
     */
    generateBonds(value, customMixedRange) {
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
			case 0: return { format: `${num1} + ${this.inputPlaceholder} = ${total}`, answer: num2 };
			case 1: return { format: `${this.inputPlaceholder} + ${num2} = ${total}`, answer: num1 };
			case 2: return { format: `${total} = ${num1} + ${this.inputPlaceholder}`, answer: num2 };
			case 3: return { format: `${total} - ${this.inputPlaceholder} = ${num2}`, answer: num1 };
			case 4: return { format: `${total} - ${num1} = ${this.inputPlaceholder}`, answer: num2 };
			case 5: return { format: `${this.inputPlaceholder} = ${total} - ${num1}`, answer: num2 };
		}
	}

    /**
     * Generate multiplication/division questions for a single times table
     * @param {number} table - The times table to use (e.g., 3 for 3x table)
     * @returns {Object} Question object for times table facts
     */
    generateSingleTableFacts(table) {
        const factor = Math.floor(Math.random() * 12) + 1;
        const product = table * factor;
        const type = Math.floor(Math.random() * 4);
        switch(type) {
            case 0: return { format: `${table} \\times ${this.inputPlaceholder} = ${product}`, answer: factor };
            case 1: return { format: `${this.inputPlaceholder} \\times ${factor} = ${product}`, answer: table };
            case 2: return { format: `${product} \\div ${table} = ${this.inputPlaceholder}`, answer: factor };
            default: return { format: `${product} \\div ${this.inputPlaceholder} = ${factor}`, answer: table };
        }
    }

    /**
     * Generate multiplication/division questions with negative numbers
     * @param {number} table - The times table to use with negatives
     * @returns {Object} Question object for negative multiplication/division
     */
    generateNegativeTableFacts(table) {
        let factor = Math.floor(Math.random() * 12) + 1;
        if (Math.random() < 0.5) { table = -table; } else { factor = -factor; }
        const product = table * factor;
        const type = Math.floor(Math.random() * 4);
        switch(type) {
            case 0: return { format: `${table} \\times ${this.inputPlaceholder} = ${product}`, answer: factor };
            case 1: return { format: `${this.inputPlaceholder} \\times ${factor} = ${product}`, answer: table };
            case 2: return { format: `${product} \\div ${table} = ${this.inputPlaceholder}`, answer: factor };
            default: return { format: `${product} \\div ${this.inputPlaceholder} = ${factor}`, answer: table };
        }
    }

    /**
     * Generate questions from a group of times tables
     * @param {Array} tables - Array of table numbers to choose from
     * @returns {Object} Question object from randomly selected table
     */
    generateGroupFacts(tables) {
        const table = tables[Math.floor(Math.random() * tables.length)];
        return this.generateSingleTableFacts(table);
    }

    /**
     * Generate doubling questions (n × 2 = ?)
     * @param {number} maxNumber - Maximum number to double
     * @returns {Object} Question object for doubling
     */
    generateDoubling(maxNumber) {
        const number = Math.floor(Math.random() * maxNumber) + 1;
        const double = number * 2;
        return { format: `${number} \\times 2 = ${this.inputPlaceholder}`, answer: double };
    }

    /**
     * Generate perfect square questions (n² = ? or √n = ?)
     * @returns {Object} Question object for squares or square roots
     */
    generatePerfectSquares() {
        const base = Math.floor(Math.random() * 20) + 1;
        const square = base * base;
        if (Math.random() < 0.5) {
            return { format: `${base}^2 = ${this.inputPlaceholder}`, answer: square };
        } else {
            return { format: `\\sqrt{${square}} = ${this.inputPlaceholder}`, answer: base };
        }
    }

    /**
     * Generate powers of 10 multiplication/division questions
     * @returns {Object} Question object for powers of 10 operations
     */
    generatePowersOf10() {
        const power = [10, 100, 1000][Math.floor(Math.random() * 3)];
        const isMultiplication = Math.random() < 0.5;
        const num = (Math.floor(Math.random() * 999) + 1) / ([1, 10, 100, 1000, 10000][Math.floor(Math.random() * 5)]);
        if (isMultiplication) {
            return { format: `${num} \\times ${power} = ${this.inputPlaceholder}`, answer: parseFloat((num * power).toPrecision(15)) };
        } else {
            return { format: `${num} \\div ${power} = ${this.inputPlaceholder}`, answer: parseFloat((num / power).toPrecision(15)) };
        }
    }
    
    /**
     * Generate unit conversion questions (e.g., 1000m = ?km)
     * @returns {Object} Question object for metric unit conversions
     */
    generateUnitConversions() {
        const UNITS = {
            length: [
                { name: 'mm', multiplier: 0.001 }, { name: 'cm', multiplier: 0.01 },
                { name: 'm', multiplier: 1 }, { name: 'km', multiplier: 1000 }
            ],
            mass: [
                { name: 'mg', multiplier: 0.001 }, { name: 'g', multiplier: 1 },
                { name: 'kg', multiplier: 1000 }, { name: 't', multiplier: 1000000 }
            ],
            capacity: [
                { name: 'mL', multiplier: 0.001 }, { name: 'L', multiplier: 1 },
                { name: 'kL', multiplier: 1000 }, { name: 'ML', multiplier: 1000000 }
            ],
            area: [
                { name: 'mm²', multiplier: 0.000001 }, { name: 'cm²', multiplier: 0.0001 },
                { name: 'm²', multiplier: 1 }, { name: 'ha', multiplier: 10000 },
                { name: 'km²', multiplier: 1000000 }
            ],
            time: [
                { name: 'ms', multiplier: 0.001 }, { name: 's', multiplier: 1 },
                { name: 'min', multiplier: 60 }, { name: 'hr', multiplier: 3600 }
            ]
        };

        let num1, num2, unit1, unit2;

        do {
            const categories = Object.keys(UNITS);
            const categoryKey = categories[Math.floor(Math.random() * categories.length)];
            const unitList = UNITS[categoryKey];

            // Pick two different units, not too far apart
            const index1 = Math.floor(Math.random() * unitList.length);
            let index2;
            do {
                const offset = (Math.floor(Math.random() * 2) + 1) * (Math.random() < 0.5 ? -1 : 1);
                index2 = index1 + offset;
            } while (index2 < 0 || index2 >= unitList.length);

            unit1 = unitList[index1];
            unit2 = unitList[index2];

            // Prevent problematic time conversions (s to hr, ms to hr, ms to min)
            if (categoryKey === 'time') {
                const problematicPairs = [
                    ['s', 'hr'],   // seconds to hours
                    ['hr', 's'],   // hours to seconds  
                    ['ms', 'hr'],  // milliseconds to hours
                    ['hr', 'ms'],  // hours to milliseconds
                    ['ms', 'min'], // milliseconds to minutes
                    ['min', 'ms']  // minutes to milliseconds
                ];
                
                const currentPair = [unit1.name, unit2.name];
                const isProblematic = problematicPairs.some(pair => 
                    (pair[0] === currentPair[0] && pair[1] === currentPair[1]) ||
                    (pair[0] === currentPair[1] && pair[1] === currentPair[0])
                );
                
                if (isProblematic) {
                    // Set dummy values to continue the loop
                    num1 = -1;
                    num2 = -1;
                    continue; // Skip this iteration and try again
                }
            }
    
            const conversionFactor = unit1.multiplier / unit2.multiplier;
            
            // Generate numbers with maximum 4 significant figures
            if (categoryKey === 'time') {
                // Keep existing time logic for clean conversions
                if (conversionFactor < 1) { // e.g., converting seconds to minutes
                    const base = 1 / conversionFactor; // This would be 60
                    const easyMultiples = [1, 2, 3, 4, 5, 10, 12, 15, 30, 45];
                    const randomMultiple = easyMultiples[Math.floor(Math.random() * easyMultiples.length)];
                    num1 = base * randomMultiple;
                } else { // e.g., converting hours to minutes
                    const easyInputs = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 10];
                    num1 = easyInputs[Math.floor(Math.random() * easyInputs.length)];
                }
            } else {
                // Generate a random number with exactly 1-4 significant figures
                const sigFigs = Math.floor(Math.random() * 4) + 1; // 1, 2, 3, or 4 sig figs
                
                // Generate base number between 1-9.999...
                const baseNum = 1 + Math.random() * 9;
                
                // Choose a power of 10 (can be negative for small numbers)
                const power = Math.floor(Math.random() * 7) - 3; // Range: -3 to +3
                
                // Create the number and round to desired sig figs
                const rawNum = baseNum * Math.pow(10, power);
                num1 = parseFloat(rawNum.toPrecision(sigFigs));
            }
            
            num2 = num1 * conversionFactor;

        } while (
            num1 < 0.0001 || num1 > 100000 ||
            num2 < 0.0001 || num2 > 100000
        );
        
        // Use toPrecision to avoid floating point representation errors
        const cleanNum1 = parseFloat(num1.toPrecision(10));
        const cleanNum2 = parseFloat(num2.toPrecision(10));

        // Randomly decide which number is the question and which is the answer
        if (Math.random() < 0.5) {
            return {
                format: `${cleanNum1} \\text{ ${unit1.name}} = ${this.inputPlaceholder} \\text{ ${unit2.name}}`,
                answer: cleanNum2
            };
        } else {
            return {
                format: `${cleanNum2} \\text{ ${unit2.name}} = ${this.inputPlaceholder} \\text{ ${unit1.name}}`,
                answer: cleanNum1
            };
        }
    }
}