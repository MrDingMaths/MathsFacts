/**
 * QuestionGenerator class for Maths Facts Challenge
 * Generates mathematical questions for various skill levels and topics
 *
 * This class serves as a wrapper around modularized level generators
 * organized in the levels/ folder for better maintainability and organization.
 */

import * as levels from './levels/index.js';

export class QuestionGenerator {
    constructor() {
        // Placeholder for input fields in question templates
        this.inputPlaceholder = '{{INPUT}}';
    }

    // ========== FRACTION & DECIMAL METHODS ==========

    /**
     * Generate common FDP conversion questions using predefined equivalences
     * @returns {Object} Question object for common fraction/decimal/percentage conversions
     */
    generateFDPConversions() {
        return levels.generateFDPConversions(this.inputPlaceholder);
    }

    /**
     * Generate more complex FDP conversion questions with multiple denominators
     * @returns {Object} Question object for complex fraction/decimal/percentage conversions
     */
    generateFDPConversionsMultiples() {
        return levels.generateFDPConversionsMultiples(this.inputPlaceholder);
    }

    /**
     * Generate equivalent fraction questions (e.g., 1/2 = ?/4)
     * @returns {Object} Question object with one missing numerator or denominator
     */
    generateEquivalentFractions() {
        return levels.generateEquivalentFractions(this.inputPlaceholder);
    }

    /**
     * Generate fraction simplification questions (e.g., 6/8 = ?/?)
     * @returns {Object} Question object requiring fraction simplification
     */
    generateSimplifyFractions() {
        return levels.generateSimplifyFractions(this.inputPlaceholder);
    }

    /**
     * Generate "fraction of quantity" questions (e.g., 3/4 of 12 = ?)
     * @returns {Object} Question object for fraction multiplication with whole numbers
     */
    generateFractionOfQuantity() {
        return levels.generateFractionOfQuantity(this.inputPlaceholder);
    }

    // ========== PERCENTAGE METHODS ==========

    /**
     * Generate "percentage of quantity" questions (e.g., 25% of 80 = ?)
     * @returns {Object} Question object for percentage calculations
     */
    generatePercentageOfQuantity() {
        return levels.generatePercentageOfQuantity(this.inputPlaceholder);
    }

    // ========== FACTOR METHODS ==========

    /**
     * Generate Highest Common Factor (HCF) questions
     * @returns {Object} Question object asking for HCF of two numbers
     */
    generateHCF() {
        return levels.generateHCF(this.inputPlaceholder);
    }

    /**
     * Generate Lowest Common Multiple (LCM) questions
     * @returns {Object} Question object asking for LCM of two numbers
     */
    generateLCM() {
        return levels.generateLCM(this.inputPlaceholder);
    }

    // ========== MULTIPLICATION & DIVISION METHODS ==========

    /**
     * Generate multiplication/division questions for a single times table
     * @param {number} table - The times table to use (e.g., 3 for 3x table)
     * @returns {Object} Question object for times table facts
     */
    generateSingleTableFacts(table) {
        return levels.generateSingleTableFacts(table, this.inputPlaceholder);
    }

    /**
     * Generate multiplication/division questions with negative numbers
     * @param {number} table - The times table to use with negatives
     * @returns {Object} Question object for negative multiplication/division
     */
    generateNegativeTableFacts(table) {
        return levels.generateNegativeTableFacts(table, this.inputPlaceholder);
    }

    /**
     * Generate questions from a group of times tables
     * @param {Array} tables - Array of table numbers to choose from
     * @returns {Object} Question object from randomly selected table
     */
    generateGroupFacts(tables) {
        return levels.generateGroupFacts(tables, this.inputPlaceholder);
    }

    /**
     * Generate doubling questions (n × 2 = ?)
     * @param {number} maxNumber - Maximum number to double
     * @returns {Object} Question object for doubling
     */
    generateDoubling(maxNumber) {
        return levels.generateDoubling(maxNumber, this.inputPlaceholder);
    }

    // ========== NUMBER BONDS METHODS ==========

    /**
     * Generate number bond questions (e.g., 5 + ? = 10, 10 - ? = 4)
     * @param {number} value - Target sum for bonds
     * @param {Array} customMixedRange - Optional [min, max] range for mixed bonds
     * @returns {Object} Question object for number bonds
     */
    generateBonds(value, customMixedRange) {
        return levels.generateBonds(value, customMixedRange, this.inputPlaceholder);
    }

    // ========== POWER & SQUARE METHODS ==========

    /**
     * Generate perfect square questions (n² = ? or √n = ?)
     * @returns {Object} Question object for squares or square roots
     */
    generatePerfectSquares() {
        return levels.generatePerfectSquares(this.inputPlaceholder);
    }

    /**
     * Generate powers of 10 multiplication/division questions
     * @returns {Object} Question object for powers of 10 operations
     */
    generatePowersOf10() {
        return levels.generatePowersOf10(this.inputPlaceholder);
    }

    // ========== UNIT CONVERSION METHODS ==========

    /**
     * Generate unit conversion questions (e.g., 1000m = ?km)
     * @returns {Object} Question object for metric unit conversions
     */
    generateUnitConversions() {
        return levels.generateUnitConversions(this.inputPlaceholder);
    }
}
