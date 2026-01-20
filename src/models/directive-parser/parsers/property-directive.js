// @ts-check

import { parseDirectiveValue } from "../utils.js";

// {target}#{modifier}({...eventModifierArgs})

/**
 * Parses property directives from element attributes.
 * Property directives manage element properties using `data-p-*` prefix.
 *
 * @param {string} value 
 * @example
 * // <div data-p-inner-html="content" data-p-scroll-top="offset">
 * // Updates element properties based on property values 
 */

export function parsePropertyDirective(value) {
    // Placeholder - actual implementation depends on your pattern
    // This file handles data-p-* directives
    return parseDirectiveValue(value);
}
