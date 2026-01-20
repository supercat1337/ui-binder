// @ts-check

import { DIRECTIVE_PREFIXES } from '../constants.js';
import { ClassDirectiveValue } from '../../class-directive-value.js';
import { parseDirectiveValue } from '../utils.js';

// {target}#{modifier}({...eventModifierArgs})

/**
 * Parses class-related directives from an element's attributes.
 * Supports two syntax forms (mutually exclusive):
 * 1. Reactive classes: `data-c-*="propertyName"` (expects a boolean reactive property)
 * 2. Computed class: `data-c="computedPropertyName"` (for complex class logic)
 *
 * @param {Map<string, string>} attributes - Map of the element's attributes
 * @returns {ClassDirectiveValue} Parsed class directives
 *
 */
export function parseClassDirectives(attributes) {
    const result = new ClassDirectiveValue();

    // Check for computed class
    const hasDataC = attributes.has(DIRECTIVE_PREFIXES.CLASS);
    const dataCValue = hasDataC ? (attributes.get(DIRECTIVE_PREFIXES.CLASS) || '').trim() : '';

    // Collect data-c-* attributes for conflict check
    const dataCStarAttributes = [];
    for (const [name] of attributes) {
        if (name.startsWith(DIRECTIVE_PREFIXES.CLASS + '-')) {
            dataCStarAttributes.push(name);
        }
    }

    // Check conflict
    if (hasDataC && dataCValue.length > 0) {
        // Use data-c, not data-c-*
        result.computedClass = parseDirectiveValue(dataCValue);

        // Warn about the conflict
        if (dataCStarAttributes.length > 0) {
            console.warn(
                `Element has both ${DIRECTIVE_PREFIXES.CLASS} and ${dataCStarAttributes.length} ${DIRECTIVE_PREFIXES.CLASS}-* attributes. ` +
                    `Only ${
                        DIRECTIVE_PREFIXES.CLASS
                    } will be used. Ignored attributes: ${dataCStarAttributes.join(', ')}`
            );
        }
    } else {
        // Use data-c-*
        for (const [name, value] of attributes) {
            if (name.startsWith(DIRECTIVE_PREFIXES.CLASS + '-')) {
                const className = name.substring(DIRECTIVE_PREFIXES.CLASS.length + 1);

                result.reactiveClasses.set(className, parseDirectiveValue(value));
            }
        }
    }

    return result;
}
