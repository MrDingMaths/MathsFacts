// app.js (Corrected Version)

// Helper for creating DOM elements
function createEl(tag, options = {}) {
    const el = document.createElement(tag);
    if (options.className) el.className = options.className;
    if (options.id) el.id = options.id;
    if (options.textContent) el.textContent = options.textContent;
    if (options.type) el.type = options.type;
    if (options.placeholder) el.placeholder = options.placeholder;
    if (options.step) el.step = options.step;
    if (options.style) Object.assign(el.style, options.style);
    if (options.autocomplete) el.autocomplete = options.autocomplete;
    return el;
}

// --- CONFIG ---
const CONFIG = {
    LEVEL_GROUPS: {
        "Number Bonds": [
            { key: 'bonds10', name: 'Bonds to 10', value: 10 },
            { key: 'bonds20', name: 'Bonds to 20', value: 20 },
            { key: 'mixed10-20', name: 'Mixed Bonds 10-20', customMixedRange: [10, 20] },
            { key: 'bonds90', name: 'Bonds to 90', value: 90 },
            { key: 'bonds100', name: 'Bonds to 100', value: 100 },
            { key: 'bonds-10', name: 'Bonds to -10', value: -10 },
            { key: 'bonds-20', name: 'Bonds to -20', value: -20 },
            { key: 'bonds-50', name: 'Bonds to -50', value: -50 },
        ],
        "Multiplication & Division": [
            { key: 'group245', name: '2 4 5 10' },
            { key: 'group369', name: '3 6 9' },
            { key: 'multall', name: '2 to 12' },
            { key: 'mixed-negative-mult', name: 'Negatives' },
            { key: 'powersOf10', name: 'Powers of 10' },
            { key: 'double100', name: 'Doubling' },
            { key: 'squares', name: 'Perfect Squares' },
            { key: 'unitConversions', name: 'Unit Conversions' },
        ],
        "Fractions, Decimals, Percentages": [
            { key: 'hcf', name: 'HCF' },
            { key: 'lcm', name: 'LCM' },
            { key: 'equivFractions', name: 'Equivalent Fractions' },
            { key: 'simplifyFractions', name: 'Simplifying Fractions' },
            { key: 'fdpConversions', name: 'Common FDP Equivalences' },
            { key: 'fdpConversionsMultiples', name: 'FDP Conversions' },
			{ key: 'fractionOfQuantity', name: 'Fraction of a Quantity' },
			{ key: 'percentageOfQuantity', name: 'Percentage of a Quantity' },
        ]
    },
    REQUIRED_STREAK: 15,
    FEEDBACK_DELAY_CORRECT: 300,
    FEEDBACK_DELAY_INCORRECT: 1000,
    POSITIVE_FEEDBACK: ["Awesome!", "Great Job!", "You got it!", "Fantastic!", "Brilliant!", "Keep it up!"],
    RATING_THRESHOLDS: [
        { maxAvg: 1.5, name: "💖 Maths Queen 💖", key: "true-mastery" },
        { maxAvg: 2, name: "⚡️ Mastery ⚡️", key: "mastery" },
        { maxAvg: 3, name: "Expert", key: "expert" },
        { maxAvg: 4, name: "Pro", key: "pro" },
        { maxAvg: Infinity, name: "Apprentice", key: "apprentice" }
    ],
    STORAGE_PREFIX: 'mf_bestTime_v1_',
    CONFETTI: { CORRECT: 40, SUCCESS: 150 }
};

// --- QuestionGenerator Class ---
class QuestionGenerator {
    constructor() { 
        this.inputPlaceholder = '{{INPUT}}'; 
    }
    
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

    generateFDPConversionsMultiples() {
        const gcd = (a, b) => b ? gcd(b, a % b) : a;

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
        
        return this._generateFDP([conversion]);
    }

    generateEquivalentFractions() {
        const gcd = (a, b) => { while (b) { [a, b] = [b, a % b]; } return a; };
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

    generateSimplifyFractions() {
        const gcd = (a, b) => { while (b) { [a, b] = [b, a % b]; } return a; };

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
     * Helper function to find the greatest common divisor of two numbers.
     * Used to simplify fractions.
     * @private
     */
    _gcd(a, b) {
        if (b === 0) {
            return a;
        }
        return this._gcd(b, a % b);
    }
	
    generateFractionOfQuantity() {
        // A wider set of denominators that are easy to divide by mentally
        const easyDenominators = [2, 3, 4, 5, 6, 8, 10, 12, 20, 25];
        let n, d;

        // This loop will continue until we have a fraction that does NOT simplify to a whole number.
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
            const commonDivisor = this._gcd(initialNumerator, initialDenominator);
            n = initialNumerator / commonDivisor;
            d = initialDenominator / commonDivisor;

        } while (d === 1); // If the simplified denominator is 1, try again.

        // Ensure the quantity is a clean multiple of the denominator.
        const multiplier = n > 15 ? (Math.floor(Math.random() * 5) + 2) : (Math.floor(Math.random() * 9) + 2);
        const quantity = d * multiplier;

        // The final answer is (quantity / denominator) * numerator
        const answer = multiplier * n;

        // We no longer need to check for a denominator of 1, as the loop prevents it.
        const questionFormat = `\\frac{${n}}{${d}} \\text{ of } ${quantity} = ${this.inputPlaceholder}`;

        return {
            format: questionFormat,
            answer: answer
        };
    }
	
	generatePercentageOfQuantity() {
		// Define percentages with their corresponding quantities that yield whole numbers
		const percentageData = {
			5: [20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 500, 520, 540, 560, 580, 600],
			10: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 250, 300, 350, 400, 450, 500],
			20: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 125, 150, 175, 200, 225, 250, 300, 400, 500],
			25: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 120, 140, 160, 180, 200, 240, 280, 320, 360, 400],
			30: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 250, 300, 400, 500],
			40: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 125, 150, 175, 200, 225, 250, 300, 400, 500],
			50: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 240, 280, 300, 400, 500],
			60: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 125, 150, 175, 200, 250, 300, 400, 500],
			75: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 120, 140, 160, 180, 200, 240, 280, 320, 360, 400],
			80: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 125, 150, 175, 200, 225, 250, 300, 400, 500],
			90: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 250, 300, 400, 500],
			95: [20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400],
			105: [20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400],
			110: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 250, 300],
			120: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 125, 150, 175, 200, 250],
			125: [4, 8, 16, 20, 24, 32, 40, 44, 48, 56, 60, 64, 72, 80, 84, 88, 96, 100, 120, 140, 160, 180, 200, 240],
			150: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200],
			200: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 125, 150],
			250: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100],
			300: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 30, 33, 35, 40, 45, 50, 60, 70, 80, 90, 100]
		};
		
		// Choose a percentage
		const percentages = Object.keys(percentageData).map(Number);
		const percentage = percentages[Math.floor(Math.random() * percentages.length)];
		
		// Choose a quantity that will give a whole number result
		const availableQuantities = percentageData[percentage];
		const quantity = availableQuantities[Math.floor(Math.random() * availableQuantities.length)];
		
		const answer = (percentage / 100) * quantity;
		
		// Format the question using LaTeX
		const questionFormat = `${percentage}\\% \\text{ of } ${quantity} = ${this.inputPlaceholder}`;
		
		return {
			format: questionFormat,
			answer: answer
		};
	}
	
    generateHCF() {
        const commonFactors = [1, 2, 3 ,4, 5, 6, 7, 8, 9, 10, 11, 12, 20, 25, 30];
        const hcf = commonFactors[Math.floor(Math.random() * commonFactors.length)];
        const gcd = (a, b) => { while (b) { [a, b] = [b, a % b]; } return a; };
        let m1, m2;
        do {
            m1 = Math.floor(Math.random() * 10) + 2;
            m2 = Math.floor(Math.random() * 10) + 2;
        } while (m1 === m2 || gcd(m1, m2) !== 1);
        
        let num1 = hcf * m1;
        let num2 = hcf * m2;
        if (Math.random() < 0.5) { [num1, num2] = [num2, num1]; }
        return { format: `\\text{HCF}(${num1}, ${num2}) = ${this.inputPlaceholder}`, answer: hcf };
    }

    generateLCM() {
        const denominators = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 20];
        const gcd = (a, b) => { while (b) { [a, b] = [b, a % b]; } return a; };
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
        return { format: `\\text{LCM}(${num1}, ${num2}) = ${this.inputPlaceholder}`, answer: lcm };
    }

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
		
		const formatType = Math.floor(Math.random() * 3); // 0, 1, or 2
		switch(formatType) {
			case 0: return { format: `${num1} + ${this.inputPlaceholder} = ${total}`, answer: num2 };
			case 1: return { format: `${this.inputPlaceholder} + ${num2} = ${total}`, answer: num1 };
			case 2: return { format: `${total} = ${num1} + ${this.inputPlaceholder}`, answer: num2 };
		}
	}

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

    generateGroupFacts(tables) {
        const table = tables[Math.floor(Math.random() * tables.length)];
        return this.generateSingleTableFacts(table);
    }

    generateDoubling(maxNumber) {
        const number = Math.floor(Math.random() * maxNumber) + 1;
        const double = number * 2;
        return { format: `${number} \\times 2 = ${this.inputPlaceholder}`, answer: double };
    }

    generatePerfectSquares() {
        const base = Math.floor(Math.random() * 20) + 1;
        const square = base * base;
        if (Math.random() < 0.5) {
            return { format: `${base}^2 = ${this.inputPlaceholder}`, answer: square };
        } else {
            return { format: `\\sqrt{${square}} = ${this.inputPlaceholder}`, answer: base };
        }
    }

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

            const conversionFactor = unit1.multiplier / unit2.multiplier;
            
            // Special handling for time to avoid recurring decimals
            if (categoryKey === 'time') {
                // Generate easier numbers for time conversions
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
                const decimalPlaces = Math.floor(Math.random() * 4); // 0 to 3
                const randomBase = (Math.random() * 150) + 1;
                num1 = parseFloat(randomBase.toFixed(decimalPlaces));
            }
            
            num2 = num1 * conversionFactor;

        } while (
            num1 < 0.0001 || num1 > 100000 ||
            num2 < 0.0001 || num2 > 100000
        );
        
        // Use toPrecision to avoid floating point representation errors
        const cleanNum1 = parseFloat(num1.toPrecision(15));
        const cleanNum2 = parseFloat(num2.toPrecision(15));

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

// --- UI Class ---
class UI {
    constructor() {
        this.elements = {
            settingsScreen: document.getElementById('settings-screen'),
            gameScreen: document.getElementById('game-screen'),
            successScreen: document.getElementById('success-screen'),
            levelSelection: document.getElementById('level-selection-container'),
            streakCounter: document.getElementById('streak-counter'),
            timer: document.getElementById('timer'),
            questionText: document.getElementById('question-text'),
            feedbackMessage: document.getElementById('feedback-message'),
            quitBtn: document.getElementById('quit-btn'),
            playAgainBtn: document.getElementById('play-again-btn'),
            completedLevel: document.getElementById('completed-level'),
            finalTime: document.getElementById('final-time'),
            finalRating: document.getElementById('final-rating'),
            bestTimeMessage: document.getElementById('best-time-message'),
            ratingExplanation: document.getElementById('rating-explanation'),
        };
        this.questionRenderers = {
            '{{EQUIV_FRACTION_CHALLENGE}}': this._renderEquivFraction,
            '{{SIMPLIFY_FRACTION_CHALLENGE}}': this._renderSimplifyFraction,
            '{{FDP_CONVERSION_CHALLENGE}}': this._renderFDPConversion,
            'default': this._renderDefaultQuestion
        };
    }

    showScreen(screenName) {
        ['settings', 'game', 'success'].forEach(s => {
            this.elements[`${s}Screen`].classList.toggle('hidden', s !== screenName);
        });
    }

    renderLevelGrid(levelGroups, onSelect) {
        this.elements.levelSelection.innerHTML = '';
        for (const groupName in levelGroups) {
            const title = createEl('h2', { className: 'level-section-title', textContent: groupName });
            const grid = createEl('div', { className: 'level-grid' });
            
            levelGroups[groupName].forEach(level => {
                const bestTime = StorageManager.getBestTime(level.key);
                const rating = bestTime ? StorageManager.getRating(bestTime) : null;
                const ratingClass = rating ? `rating-${rating.key}` : 'rating-none';
                
                const btn = createEl('div', { className: `level-btn ${ratingClass}` });
                btn.dataset.levelKey = level.key;
                
                const levelTitle = createEl('div', { className: 'level-title', textContent: level.name });
                const bestTimeText = createEl('div', { 
                    className: 'best-time', 
                    textContent: bestTime ? `Best: ${new Timer().formatTime(bestTime)}` : 'No time set'
                });

                btn.append(levelTitle, bestTimeText);
                btn.addEventListener('click', () => {
                    const level = Object.values(levelGroups).flat().find(l => l.key === btn.dataset.levelKey);
                    onSelect(level);
                });
                grid.append(btn);
            });
            this.elements.levelSelection.append(title, grid);
        }
    }

    displayQuestion(question, levelKey) {
        this.elements.questionText.innerHTML = '';
        const renderer = this.questionRenderers[question.format] || this.questionRenderers.default;
        renderer.call(this, question, levelKey);
        const input = this.elements.questionText.querySelector('input');
        if (input) input.focus();
    }
    
    // --- Question Renderers ---

    _renderDefaultQuestion(question, levelKey) {
        const parts = question.format.split('{{INPUT}}');
        const frag = document.createDocumentFragment();

        if (parts[0]) {
            const part1El = createEl('span');
            katex.render(parts[0], part1El, { throwOnError: false });
            frag.append(part1El);
        }

        const inputOptions = { type: 'number', className: 'inline-input', step: 'any', autocomplete: 'off' };
        if (levelKey === 'powersOf10' || levelKey === 'unitConversions') {
            inputOptions.style = { width: '12rem' }; // Increased width for this level
        }
        const inputEl = createEl('input', inputOptions);
        frag.append(inputEl);
        
        if (parts[1]) {
            const part2El = createEl('span');
            katex.render(parts[1], part2El, { throwOnError: false });
            frag.append(part2El);
        }
        this.elements.questionText.append(frag);
    }

    _createFraction(num, den, isInput = false) {
        const container = createEl('div', { className: 'fraction-container' });
        let numEl, denEl;
        if (isInput) {
             numEl = createEl('input', { type: 'number', id: 'input-fraction-num', className: 'inline-input', width: '5rem', autocomplete: 'off' });
             denEl = createEl('input', { type: 'number', id: 'input-fraction-den', className: 'inline-input', width: '5rem', autocomplete: 'off' });
        } else {
             numEl = createEl('span', { className: 'fraction-numerator'});
             katex.render(String(num), numEl, { throwOnError: false });
             denEl = createEl('span', { className: 'fraction-denominator'});
             katex.render(String(den), denEl, { throwOnError: false });
        }
        container.append(numEl, denEl);
        return container;
    }

    _renderEquivFraction(question) {
        const qp = question.questionParts;
        const leftFraction = this._createFraction(qp.baseNum, qp.baseDen);
        leftFraction.style.fontSize = '2.5rem';

        const equals = createEl('span', { className: 'mx-4' });
        katex.render('=', equals, { throwOnError: false, displayMode: true });

        const rightFraction = createEl('div', { className: 'fraction-container', style: { fontSize: '2.5rem' } });
        
        let numContent, denContent;
        const inputOptions = {type: 'number', className: 'inline-input', style: {width: '5rem'}, autocomplete: 'off'};

        if (qp.equivNum === null) {
            numContent = createEl('input', inputOptions);
        } else {
            numContent = createEl('span');
            katex.render(String(qp.equivNum), numContent, { throwOnError: false });
        }
        
        if (qp.equivDen === null) {
            denContent = createEl('input', inputOptions);
        } else {
            denContent = createEl('span');
            katex.render(String(qp.equivDen), denContent, { throwOnError: false });
        }

        const numContainer = createEl('span', { className: 'fraction-numerator' });
        numContainer.append(numContent);
        const denContainer = createEl('span', { className: 'fraction-denominator' });
        denContainer.append(denContent);
        rightFraction.append(numContainer, denContainer);
        
        this.elements.questionText.append(leftFraction, equals, rightFraction);
    }
    
    _renderSimplifyFraction(question) {
        const qp = question.questionParts;
        const leftFraction = this._createFraction(qp.complexNum, qp.complexDen);
        leftFraction.style.fontSize = '2.5rem';
        const equals = createEl('span', { className: 'mx-4' });
        katex.render('=', equals, { throwOnError: false, displayMode: true });
        const rightFraction = this._createFraction(null, null, true);
        this.elements.questionText.append(leftFraction, equals, rightFraction);
    }

    _renderFDPConversion(question) {
        const parts = question.questionParts;
        const table = createEl('table', { className: 'fdp-table' });
        table.innerHTML = `<thead><tr><th>Fraction</th><th>Decimal</th><th>Percentage</th></tr></thead>`;
        const tbody = createEl('tbody');
        const tr = createEl('tr');

        const tdFraction = createEl('td');
        const tdDecimal = createEl('td');
        const tdPercentage = createEl('td');
        const inputOptions = { type: 'number', className: 'inline-input', step: 'any', autocomplete: 'off' };
        
        if (parts.givenType === 'recurring') {
            tdFraction.append(this._createFraction(null, null, true));

            const decimalSpan = createEl('span');
            katex.render(parts.values.decimal, decimalSpan, { throwOnError: false });
            tdDecimal.append(decimalSpan);
            
            const percentageSpan = createEl('span');
            katex.render(parts.values.percentage, percentageSpan, { throwOnError: false });
            tdPercentage.append(percentageSpan);

        } else {
            // Fraction Cell
            if (parts.givenType === 'fraction') {
                const fractionEl = this._createFraction(parts.fraction.num, parts.fraction.den);
                fractionEl.style.fontSize = '1.5rem';
                tdFraction.append(fractionEl);
            } else {
                tdFraction.append(this._createFraction(null, null, true));
            }

            // Decimal Cell
            if (parts.givenType === 'decimal') {
                const decimalSpan = createEl('span', { style: { fontSize: '1.5rem' } });
                katex.render(String(parts.decimal), decimalSpan, { throwOnError: false });
                tdDecimal.append(decimalSpan);
            } else {
                tdDecimal.append(createEl('input', { ...inputOptions, id: 'input-decimal' }));
            }

            // Percentage Cell
            if (parts.givenType === 'percentage') {
                const percentageSpan = createEl('span', { style: { fontSize: '1.5rem' } });
                katex.render(String(parts.percentage) + '\\%', percentageSpan, { throwOnError: false });
                tdPercentage.append(percentageSpan);
            } else {
                const container = createEl('div', { className: 'percentage-cell' });
                const input = createEl('input', { ...inputOptions, id: 'input-percentage' });
                const symbol = createEl('span', { style: { fontSize: '1.5rem' } });
                katex.render('\\%', symbol, { throwOnError: false });
                container.append(input, symbol);
                tdPercentage.append(container);
            }
        }
        
        tr.append(tdFraction, tdDecimal, tdPercentage);
        tbody.append(tr);
        table.append(tbody);
        this.elements.questionText.append(table);
    }
    
    updateStreak(streak) { this.elements.streakCounter.textContent = streak; }

    showFeedback(isCorrect, message, useKatex = false) {
    this.elements.feedbackMessage.innerHTML = ''; // Use innerHTML instead of textContent
    this.elements.feedbackMessage.className = `feedback text-lg ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
    
    if (useKatex) {
        try {
            katex.render(message, this.elements.feedbackMessage, { throwOnError: false });
        } catch (e) {
            this.elements.feedbackMessage.textContent = message; // Fallback to plain text
        }
    } else {
        this.elements.feedbackMessage.textContent = message;
    }
	}

    clearFeedback() { this.elements.feedbackMessage.textContent = ''; }

    getAnswerFromUI(levelKey) {
        if (levelKey === 'fdpConversions' || levelKey === 'fdpConversionsMultiples') {
            const answer = {};
            const decInput = document.getElementById('input-decimal');
            const perInput = document.getElementById('input-percentage');
            const fracNumInput = document.getElementById('input-fraction-num');
            const fracDenInput = document.getElementById('input-fraction-den');

            if (decInput) answer.decimal = parseFloat(decInput.value);
            if (perInput) answer.percentage = parseFloat(perInput.value);
            if (fracNumInput && fracDenInput) {
                answer.fraction = {
                    num: parseInt(fracNumInput.value, 10),
                    den: parseInt(fracDenInput.value, 10)
                };
            }
            return answer;
        }
        
        const numInput = document.getElementById('input-fraction-num');
        if (numInput) {
            return {
                num: parseInt(numInput.value, 10),
                den: parseInt(document.getElementById('input-fraction-den').value, 10)
            };
        }

        if (this.elements.questionText.querySelectorAll('.inline-input').length > 1) {
            const inputs = this.elements.questionText.querySelectorAll('.inline-input');
            const filledInput = Array.from(inputs).find(i => i.value !== '');
            return filledInput ? parseFloat(filledInput.value) : null;
        }

        const input = this.elements.questionText.querySelector('.inline-input');
        return input ? parseFloat(input.value) : null;
    }

    showSuccess(levelName, time, rating, isNewBest, previousBest) {
        // Add debug log
        console.log('Showing success screen for:', levelName);
        
        this.elements.completedLevel.textContent = levelName;
        this.elements.finalTime.textContent = new Timer().formatTime(time);
        this.elements.finalRating.textContent = rating.name;
        this.elements.ratingExplanation.textContent = `(Avg time per question: < ${rating.maxAvg}s)`;
        
        if (isNewBest) {
            this.elements.bestTimeMessage.textContent = previousBest 
                ? `New personal best! Beat your old time of ${new Timer().formatTime(previousBest)}.`
                : `You've set your first record!`;
        } else {
            this.elements.bestTimeMessage.textContent = `Your best time is still ${new Timer().formatTime(previousBest)}.`;
        }
        
        // Make sure we're showing the right screen
        this.showScreen('success');
    }

	formatAnswerForDisplay(answer, levelKey) {
    if (levelKey === 'fdpConversions' || levelKey === 'fdpConversionsMultiples') {
        let parts = [];
        if (answer.fraction) {
            parts.push(`\\frac{${answer.fraction.num}}{${answer.fraction.den}}`);
        }
        if (answer.decimal !== undefined) {
            parts.push(answer.decimal.toString());
        }
        if (answer.percentage !== undefined) {
            parts.push(`${answer.percentage}\\%`);
        }
        return parts.join(', ');
    } else if (typeof answer === 'object' && answer !== null && answer.num !== undefined) {
        return `\\frac{${answer.num}}{${answer.den}}`;
    } else {
        return answer.toString();
    }
	}
}

// --- Other Classes (GameState, Timer, StorageManager, Confetti) ---
class GameState {
    constructor() { this.reset(); }
    reset() {
        this.currentLevel = null; this.currentAnswer = 0; this.correctStreak = 0;
        this.lastQuestionFormat = null;
    }
    setLevel(level) { this.reset(); this.currentLevel = level; }
    incrementStreak() { this.correctStreak++; return this.correctStreak; }
    resetStreak() { this.correctStreak = 0; }
    isComplete() { return this.correctStreak >= CONFIG.REQUIRED_STREAK; }
}
class Timer {
    constructor(displayElement) { this.display = displayElement; this.reset(); }
    reset() { this.startTime = 0; this.interval = null; this.seconds = 0; }
    start() {
        this.reset();
        this.startTime = Date.now();
        if(this.display) this.display.textContent = this.formatTime(0);
        this.interval = setInterval(() => {
            this.seconds = Math.floor((Date.now() - this.startTime) / 1000);
            if(this.display) this.display.textContent = this.formatTime(this.seconds);
        }, 1000);
    }
    stop() { clearInterval(this.interval); }
    getSeconds() { return this.seconds; }
    formatTime(sec) {
        const minutes = Math.floor(sec / 60).toString().padStart(2, '0');
        const seconds = (sec % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
}
class StorageManager {
    static saveBestTime(levelKey, time) {
        localStorage.setItem(`${CONFIG.STORAGE_PREFIX}${levelKey}`, time);
    }
    static getBestTime(levelKey) {
        const time = localStorage.getItem(`${CONFIG.STORAGE_PREFIX}${levelKey}`);
        return time ? parseInt(time, 10) : null;
    }
    static getRating(time) {
        const avgTime = time / CONFIG.REQUIRED_STREAK;
        return CONFIG.RATING_THRESHOLDS.find(r => avgTime <= r.maxAvg);
    }
}
class Confetti {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.pieces = [];
        this.animationFrame = null;
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    trigger(count) {
        for (let i = 0; i < count; i++) {
            this.pieces.push(this.createPiece());
        }
        if (!this.animationFrame) {
            this.animate();
        }
    }
    createPiece() {
        const x = this.canvas.width * Math.random();
        const y = -20;
        const size = Math.random() * 10 + 5;
        const colors = ['#fde047', '#facc15', '#a3e635', '#4ade80', '#34d399', '#2dd4bf', '#67e8f9', '#7dd3fc', '#93c5fd', '#a5b4fc', '#c4b5fd', '#d8b4fe', '#f0abfc', '#f9a8d4'];
        return {
            x, y, size,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: Math.random() * 10 - 5,
            vy: Math.random() * 5 + 2,
            angle: Math.random() * Math.PI * 2,
            spin: Math.random() * 0.2 - 0.1
        };
    }
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.pieces.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;
            p.angle += p.spin;
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.angle);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            this.ctx.restore();
            if (p.y > this.canvas.height) {
                this.pieces.splice(index, 1);
            }
        });
        if (this.pieces.length > 0) {
            this.animationFrame = requestAnimationFrame(() => this.animate());
        } else {
            this.animationFrame = null;
        }
    }
}

// --- GameController Class ---
class GameController {
    constructor() {
        this.state = new GameState();
        this.ui = new UI();
        this.timer = new Timer(this.ui.elements.timer);
        this.questionGen = new QuestionGenerator();
        this.confetti = new Confetti('confetti-canvas');
        this.isChecking = false;
        this.answerSubmitted = false; // Add this line
        this.setupEventListeners();
        this.initializeQuestionGenerators();
        this.ui.renderLevelGrid(CONFIG.LEVEL_GROUPS, (level) => this.startGame(level));
		setTimeout(() => this.initializeProgressTracking(), 100);
    }

    initializeProgressTracking() {
        // Only initialize if not already initialized
        if (!window.progressTracker) {
            window.progressTracker = new ProgressTracker();
            
            // Don't create canvas here - let the UI handle it
            // Remove any canvas creation code from here
            
            window.progressChart = new ProgressChart('progress-chart', window.progressTracker);
            window.progressShare = new ProgressShare(window.progressTracker, window.progressChart);
            window.progressUI = new ProgressUI(window.progressTracker, window.progressChart, window.progressShare);
        }
    }

    initializeQuestionGenerators() {
        this.generatorMap = {
            'hcf': () => this.questionGen.generateHCF(),
            'lcm': () => this.questionGen.generateLCM(),
            'equivFractions': () => this.questionGen.generateEquivalentFractions(),
            'simplifyFractions': () => this.questionGen.generateSimplifyFractions(),
			'fractionOfQuantity': () => this.questionGen.generateFractionOfQuantity(),
            'fdpConversions': () => this.questionGen.generateFDPConversions(),
            'fdpConversionsMultiples': () => this.questionGen.generateFDPConversionsMultiples(),
			'percentageOfQuantity': () => this.questionGen.generatePercentageOfQuantity(),
            'group245': () => this.questionGen.generateGroupFacts([2, 4, 5, 10]),
            'group369': () => this.questionGen.generateGroupFacts([3, 6, 9]),
            'multall': () => this.questionGen.generateGroupFacts([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
            'mixed-negative-mult': () => this.questionGen.generateNegativeTableFacts([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12][Math.floor(Math.random()*11)]),
            'double100': () => this.questionGen.generateDoubling(100),
            'squares': () => this.questionGen.generatePerfectSquares(),
            'powersOf10': () => this.questionGen.generatePowersOf10(),
            'unitConversions': () => this.questionGen.generateUnitConversions(),
            'bonds': (level) => this.questionGen.generateBonds(level.value, level.customMixedRange)
        };
    }

    setupEventListeners() {
        this.ui.elements.quitBtn.addEventListener('click', () => this.quitGame());
        this.ui.elements.playAgainBtn.addEventListener('click', () => this.quitGame());
        this.ui.elements.questionText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.isChecking && e.target.tagName === 'INPUT') {
                this.checkAnswer();
            }
        });
    }

    startGame(level) {
        this.state.setLevel(level);
        this.ui.showScreen('game');
        this.ui.updateStreak(0);
        this.timer.start();
        this.generateQuestion();
    }

    generateQuestion() {
        this.ui.clearFeedback();
        this.answerSubmitted = false;
        const levelKey = this.state.currentLevel.key;
        
        let generatorFn = this.generatorMap[levelKey];
        if (!generatorFn) {
            if (levelKey.startsWith('bonds') || levelKey.startsWith('mixed')) {
                generatorFn = () => this.generatorMap.bonds(this.state.currentLevel);
            } else {
                console.error("No generator found for level key:", levelKey);
                return;
            }
        }
        
        const q = generatorFn();
        this.state.currentAnswer = q.answer;
        this.state.lastQuestionFormat = q.format;
        this.ui.displayQuestion(q, this.state.currentLevel.key);
    }
    
    checkAnswer() {
        if (this.isChecking || this.answerSubmitted) return;
        this.answerSubmitted = true;
        this.isChecking = true;

        const userAnswer = this.ui.getAnswerFromUI(this.state.currentLevel.key);
        const correctAnswer = this.state.currentAnswer;
        let isCorrect = false;

        if (this.state.currentLevel.key === 'fdpConversions' || this.state.currentLevel.key === 'fdpConversionsMultiples') {
            isCorrect = true;
            for (const key in correctAnswer) {
                if (key === 'fraction') {
                    if (!userAnswer.fraction || userAnswer.fraction.num !== correctAnswer.fraction.num || userAnswer.fraction.den !== correctAnswer.fraction.den) {
                        isCorrect = false; break;
                    }
                } else {
                    if (userAnswer[key] === undefined || isNaN(userAnswer[key]) || Math.abs(userAnswer[key] - correctAnswer[key]) > 1e-9) {
                        isCorrect = false; break;
                    }
                }
            }
        } else if (typeof correctAnswer === 'object' && correctAnswer !== null) {
            isCorrect = userAnswer && userAnswer.num === correctAnswer.num && userAnswer.den === correctAnswer.den;
        } else {
            isCorrect = userAnswer === correctAnswer;
        }

        if (isCorrect) {
            const newStreak = this.state.incrementStreak();
            this.ui.updateStreak(newStreak);
            this.ui.showFeedback(true, CONFIG.POSITIVE_FEEDBACK[Math.floor(Math.random() * CONFIG.POSITIVE_FEEDBACK.length)]);
            this.confetti.trigger(CONFIG.CONFETTI.CORRECT);
            
            if (this.state.isComplete()) {
                setTimeout(() => this.showSuccess(), 500);
            } else {
            setTimeout(() => { 
                    this.answerSubmitted = false; // Reset flag
                    this.generateQuestion(); 
                    this.isChecking = false; 
                }, CONFIG.FEEDBACK_DELAY_CORRECT);
            }
        } else {
            this.state.resetStreak();
            this.ui.updateStreak(0);
            const correctAnswerText = this.ui.formatAnswerForDisplay(correctAnswer, this.state.currentLevel.key);
			const needsKatex = typeof correctAnswer === 'object' || this.state.currentLevel.key.includes('fdp');
			this.ui.showFeedback(false, `${correctAnswerText}`, needsKatex);
            setTimeout(() => { 
                this.answerSubmitted = false; // Reset flag
                this.generateQuestion(); 
                this.isChecking = false; 
            }, CONFIG.FEEDBACK_DELAY_INCORRECT);
        }
    }

    showSuccess() {
        this.timer.stop();
        const time = this.timer.getSeconds();
        const previousBest = StorageManager.getBestTime(this.state.currentLevel.key);
        const isNewBest = !previousBest || time < previousBest;
        
        if (isNewBest) {
            StorageManager.saveBestTime(this.state.currentLevel.key, time);
            this.confetti.trigger(CONFIG.CONFETTI.SUCCESS);
        }
        
        // Add progress tracking with better error handling
        try {
            if (window.progressTracker) {
                console.log('Recording progress for:', this.state.currentLevel.key, 'Time:', time);
                window.progressTracker.recordProgress(
                    this.state.currentLevel.key,
                    time,
                    CONFIG.REQUIRED_STREAK
                );
            }
        } catch (error) {
            console.error('Error recording progress (non-blocking):', error);
            // Continue anyway - don't let this break the success screen
        }
        
        const rating = StorageManager.getRating(time);
        
        // Make sure we're calling the UI method correctly
        try {
            this.ui.showSuccess(this.state.currentLevel.name, time, rating, isNewBest, previousBest);
        } catch (error) {
            console.error('Error showing success screen:', error);
        }
        
        this.isChecking = false;
    }

    quitGame() {
        this.timer.stop(); 
        this.state.reset();
        this.isChecking = false;
        this.ui.renderLevelGrid(CONFIG.LEVEL_GROUPS, (level) => this.startGame(level));
        this.ui.showScreen('settings');
    }
}

// --- Initialize the Game ---
new GameController();