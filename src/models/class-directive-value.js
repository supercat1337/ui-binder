// @ts-check

import { DirectiveValue } from "./directive-value.js";

/**
 * Represents class directives parsed from element attributes.
 */
export class ClassDirectiveValue {
    /** @type {Map<string, DirectiveValue>} */
    reactiveClasses = new Map(); // data-c-*="propertyName" (boolean reactive property)
    /** @type {DirectiveValue|null} */
    computedClass = null; // data-c="computedPropertyName" (string reactive property)
}