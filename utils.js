/**
 * Utility functions for Maths Facts Challenge
 * Provides common helper functions used throughout the application
 */

/**
 * Helper function for creating DOM elements with specified properties
 * Simplifies element creation by accepting an options object with common properties
 * @param {string} tag - HTML tag name for the element
 * @param {Object} options - Object containing element properties to set
 * @param {string} options.className - CSS class names to apply
 * @param {string} options.id - Element ID
 * @param {string} options.textContent - Text content for the element
 * @param {string} options.value - Element value (for option, input, select elements)
 * @param {string} options.type - Input type (for input elements)
 * @param {string} options.placeholder - Placeholder text (for input elements)
 * @param {string} options.step - Step value (for number inputs)
 * @param {Object} options.style - Style properties to apply
 * @param {string} options.autocomplete - Autocomplete behavior
 * @param {boolean} options.disabled - Whether the element is disabled
 * @param {boolean} options.selected - Whether the option is selected
 * @returns {HTMLElement} The created DOM element with applied properties
 */
export function createEl(tag, options = {}) {
    const el = document.createElement(tag);

    // Apply all specified properties to the element
    if (options.className) el.className = options.className;
    if (options.id) el.id = options.id;
    if (options.textContent) el.textContent = options.textContent;
    if (options.value !== undefined) el.value = options.value;
    if (options.type) el.type = options.type;
    if (options.placeholder) el.placeholder = options.placeholder;
    if (options.step) el.step = options.step;
    if (options.style) Object.assign(el.style, options.style);
    if (options.autocomplete) el.autocomplete = options.autocomplete;
    if (options.disabled) el.disabled = options.disabled;
    if (options.selected) el.selected = options.selected;

    return el;
}