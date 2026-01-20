// @ts-check

import { ClassDirectiveValue } from './class-directive-value.js';
import { DirectiveValue } from './directive-value.js';

/**
 * Container for all parsed directives from an element.
 */
export class ParsedDirectives {
    // a-directive manages element attributes
    /** @type {Map<string, DirectiveValue>} */
    attributeDirectives = new Map();

    // p-directive manages element properties
    /** @type {Map<string, DirectiveValue>} */
    propertyDirectives = new Map();
    
    // b-directive manages element behaviors (data-b-text, data-b-html, data-b-show, etc.)
    /** @type {Map<string, DirectiveValue>} */
    behaviorDirectives = new Map();

    // m-directive manages two-way data binding
    /** @type {DirectiveValue|null} */
    modelDirective = null;

    // c-directive manages element className property
    /** @type {ClassDirectiveValue|null} */
    classDirective = null;
}
