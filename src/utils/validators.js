// @ts-check

const RESERVED_WORDS = new Set([
    'class',
    'function',
    'return',
    'if',
    'else',
    'for',
    'while',
    'var',
    'let',
    'const',
    'new',
    'this',
    'typeof',
    'instanceof',
    'delete',
    'void',
    'with',
    'debugger',
    'export',
    'import',
    'null',
    'undefined',
    'NaN',
    'Infinity',
    'arguments',
    'eval',
]);

/**
 * Validates if a string is a valid JavaScript property name.
 * This ensures data-c-* directives only accept property names, not expressions.
 *
 * @param {string} str - The string to validate
 * @returns {boolean} True if the string is a valid property name
 *
 * @example
 * isValidPropertyName("isActive")     // true
 * isValidPropertyName("user.isActive") // true (nested property)
 * isValidPropertyName("size === 'lg'") // false (expression not allowed)
 * isValidPropertyName("!isHidden")     // false (expression not allowed)
 */
export function isValidPropertyName(str) {
    if (/\.\./.test(str) || str.endsWith('.') || str.startsWith('.') || str.endsWith('-'))
        return false;
    return /^[a-zA-Z_$][a-zA-Z0-9_$.-]*$/.test(str);
}

/**
 * Checks if an element is valid for two-way binding.
 * This function checks if an element is a TEXTAREA, SELECT, or an INPUT with a supported type.
 * It also checks if an element has contenteditable set to true, or has a role of "textbox".
 * @param {Element} element - The element to check
 * @returns {boolean} True if the element is valid for two-way binding, false otherwise
 */
export function isValidForTwoWayBinding(element) {
    const tag = element.tagName;
    // @ts-ignore
    const type = element.type || '';

    // TEXTAREA and SELECT are always suitable
    if (tag === 'TEXTAREA' || tag === 'SELECT') return true;

    // INPUT with certain types
    if (tag === 'INPUT') {
        const supportedTypes = [
            'text',
            'password',
            'email',
            'search',
            'tel',
            'url',
            'number',
            'range',
            'date',
            'time',
            'month',
            'week',
            'datetime-local',
            'color',
            'checkbox',
            'radio',
        ];
        return supportedTypes.includes(type);
    }

    // Elements with contenteditable
    // @ts-ignore
    if (element.contentEditable === 'true') return true;

    // Custom elements with input role
    if (element.getAttribute('role') === 'textbox') return true;

    return false;
}
