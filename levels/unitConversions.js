/**
 * Unit conversions question generator
 * Students select the operation (multiply/divide) and conversion factor
 */

/**
 * Generate unit conversion questions where students select operation and factor
 * Format: mm [× / ÷] [factor options] = m
 * @returns {Object} Question object with unit conversion structure
 */
export function generateUnitConversions(inputPlaceholder) {
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

    let unit1, unit2, categoryKey;

    do {
        const categories = Object.keys(UNITS);
        categoryKey = categories[Math.floor(Math.random() * categories.length)];
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

        // Prevent problematic time conversions
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
                unit1 = null; // Force retry
                continue;
            }
        }
    } while (!unit1);

    // Calculate conversion factor
    const conversionFactor = unit1.multiplier / unit2.multiplier;

    // Determine if we multiply or divide (always use whole number factors)
    let operation, factor;
    if (conversionFactor < 1) {
        // Need to divide (going from smaller to larger unit)
        operation = 'divide';
        factor = Math.round(1 / conversionFactor); // Use whole number for division
    } else {
        // Need to multiply (going from larger to smaller unit)
        operation = 'multiply';
        factor = Math.round(conversionFactor); // Use whole number for multiplication
    }

    // Generate factor options (include correct answer plus alternatives)
    const factorOptions = generateFactorOptions(factor, categoryKey);

    // Randomly decide which unit is source and which is target
    let sourceUnit, targetUnit, correctOperation, correctFactor;
    if (Math.random() < 0.5) {
        sourceUnit = unit1.name;
        targetUnit = unit2.name;
        correctOperation = operation;
        correctFactor = factor;
    } else {
        sourceUnit = unit2.name;
        targetUnit = unit1.name;
        // Reverse the operation and factor (both must be whole numbers)
        correctOperation = operation === 'multiply' ? 'divide' : 'multiply';
        correctFactor = factor; // factor stays the same, just operation reverses
    }

    return {
        format: '{{UNIT_CONVERSION}}',
        sourceUnit,
        targetUnit,
        correctOperation,
        correctFactor,
        factorOptions: factorOptions.sort((a, b) => {
            // Sort by numeric value, but keep exponent notation values by their actual value
            const aVal = typeof a === 'string' ? parseFloat(a) : a;
            const bVal = typeof b === 'string' ? parseFloat(b) : b;
            return aVal - bVal;
        })
    };
}

/**
 * Generate factor options for the dropdown
 * Includes the correct answer plus plausible alternatives
 * Only includes whole numbers (no decimals)
 * For area conversions, returns objects with display notation and numeric value
 */
function generateFactorOptions(correctFactor, categoryKey) {
    const options = new Map(); // Use Map to store by numeric value

    // Helper function to convert number to exponent notation for display
    // For area conversions, use powers of 2 (e.g., 100 = 10^2, 10000 = 100^2)
    function toExponentNotation(num) {
        if (num === 100) return '10^2';
        if (num === 10000) return '100^2';
        if (num === 1000000) return '1000^2';
        if (num === 100000000) return '10000^2';
        return num.toString();
    }

    // Helper function to create option objects for area conversions
    function createFactorOption(numericValue, categoryKey) {
        if (categoryKey === 'area') {
            return {
                display: toExponentNotation(numericValue),
                value: numericValue
            };
        }
        return numericValue;
    }

    // Always include the correct factor
    if (categoryKey === 'area') {
        const option = createFactorOption(correctFactor, categoryKey);
        options.set(option.value, option);
    } else {
        options.set(correctFactor, correctFactor);
    }

    // Generate alternatives based on category - only whole numbers
    if (categoryKey === 'area') {
        // For area, offer common conversion factors in exponent notation
        [100, 10000, 1000000, 100000000].forEach(f => {
            const option = createFactorOption(f, categoryKey);
            options.set(option.value, option);
        });
    } else if (categoryKey === 'time') {
        // Common time conversion factors (only whole numbers)
        [60, 3600, 1000, 24, 30].forEach(f => {
            options.set(f, f);
        });
    } else {
        // Length, mass, capacity - powers of 10 (only whole numbers)
        [10, 100, 1000, 10000, 1000000].forEach(f => {
            options.set(f, f);
        });
    }

    // Convert to array and sort numerically
    let optionsArray = Array.from(options.values()).sort((a, b) => {
        const aVal = typeof a === 'object' ? a.value : a;
        const bVal = typeof b === 'object' ? b.value : b;
        return aVal - bVal;
    });

    return optionsArray;
}
