// @ts-check

import { DirectiveValue } from '../directive-value.js';
import { propertyNameToPath } from '../../utils/properties.js';
import { DIRECTIVE_PREFIXES } from './constants.js';
import { getElementAttrs, isNativePropertyName } from '../../utils/dom.js';
import { isValidForTwoWayBinding } from '../../utils/validators.js';
import { ParsedDirectives } from '../parsed-directives.js';
import {
    parseClassDirectives,
    parseModelDirective,
    parsePropertyDirective,
    parseBehaviorDirective,
    parseAttributeDirective,
} from './parsers/index.js';
import { attributeNameToPropertyName } from '../../utils/properties.js';

// {target}:{domProperty}#{modifier}({...eventModifierArgs})@{event}

/**
 * Parses a modifier string (e.g., "debounce(300,100)") into name and arguments.
 * @param {string} str - The modifier string without leading '#'.
 * @returns {Array<[string, Array<string|number|boolean>]>} Array of [modifierName, args[]] pairs.
 */
export function parseModifiersString(str) {
    /** @type {[string, Array<string|number|boolean>][]} */
    const modifiers = [];
    const tokens = str.split('#').filter(token => token.length > 0);

    for (let token of tokens) {
        let match = token.match(/^([A-Za-z0-9_-]+)(?:\(([^)]*)\))?/);
        if (match) {
            let args = match[2]
                ? match[2].split(',').map(arg => {
                      arg = arg.trim();
                      // Convert numbers automatically
                      if (!isNaN(Number(arg)) && arg !== '') {
                          return Number(arg);
                      }
                      // Boolean value handling
                      if (arg.toLowerCase() === 'true') return true;
                      if (arg.toLowerCase() === 'false') return false;
                      // Remove quotes from strings
                      if (
                          (arg.startsWith("'") && arg.endsWith("'")) ||
                          (arg.startsWith('"') && arg.endsWith('"'))
                      ) {
                          return arg.slice(1, -1);
                      }
                      return arg;
                  })
                : [];
            modifiers.push([match[1], args]);
        }
    }
    return modifiers;
}

/**
 * Parses a directive value for data-a-, data-p-, data-b- directives.
 * Supports: target[#modifier...]
 * @param {string} value
 * @returns {DirectiveValue}
 */
export function parseDirectiveValue(value) {
    let directiveValue = new DirectiveValue();
    let rest = value.trim();

    // Parse target using regex
    let m = rest.match(/^([A-Za-z0-9_.$\-]+[A-Za-z0-9_$\-]*)/);
    if (m) {
        directiveValue.target = m[1];
        rest = rest.slice(m[1].length);
    } else {
        // If target not found, set to empty string
        directiveValue.target = '';
    }

    // Parse modifiers using shared function
    if (rest.startsWith('#')) {
        let modifiers = parseModifiersString(rest.slice(1));
        for (let [name, args] of modifiers) {
            directiveValue.eventModifiers.set(name, args);
        }
    } else if (rest.length > 0 && directiveValue.target) {
        console.warn(`Unexpected characters in directive value after target: "${rest}"`);
    }

    if (!directiveValue.target) {
        console.warn(`Could not parse target from directive value: "${value}"`);
    }

    return directiveValue;
}

/**
 * Parses directives from an element's attributes.
 * @param {Element} element
 * @param {Map<string, string>|null} attributes
 * @returns {ParsedDirectives}
 */
export function parseDirectives(element, attributes = null) {
    let directives = new ParsedDirectives();
    if (!attributes) attributes = getElementAttrs(element);
    let hasClassDirective = false;

    for (let [name, value] of attributes) {
        if (name.startsWith(DIRECTIVE_PREFIXES.ATTRIBUTE)) {
            let attrName = name.substring(DIRECTIVE_PREFIXES.ATTRIBUTE.length); // 'data-a-'.length = 7
            directives.attributeDirectives.set(attrName, parseAttributeDirective(value));
        } else if (name.startsWith(DIRECTIVE_PREFIXES.PROPERTY)) {
            let nativeProp = isNativePropertyName(name, DIRECTIVE_PREFIXES.PROPERTY);

            if (nativeProp) {
                directives.propertyDirectives.set(nativeProp, parseDirectiveValue(value));
                continue;
            }

            let propName = attributeNameToPropertyName(
                name,
                DIRECTIVE_PREFIXES.PROPERTY
            );

            directives.propertyDirectives.set(propName, parsePropertyDirective(value));
        } else if (name.startsWith(DIRECTIVE_PREFIXES.BEHAVIOR)) {
            let directiveName = name.substring(DIRECTIVE_PREFIXES.BEHAVIOR.length); // 'data-b-'.length = 7
            directives.behaviorDirectives.set(directiveName, parseBehaviorDirective(value));
        } else if (name === DIRECTIVE_PREFIXES.MODEL) {
            if (!isValidForTwoWayBinding(element)) {
                console.warn(
                    `${DIRECTIVE_PREFIXES.MODEL} is not valid on ${element.tagName}${
                        // @ts-ignore
                        element.type ? `[type="${element.type}"]` : ''
                    }`
                );
            } else {
                directives.modelDirective = parseModelDirective(value);
            }
        } else if (
            name.startsWith(DIRECTIVE_PREFIXES.CLASS + '-') ||
            name === DIRECTIVE_PREFIXES.CLASS
        ) {
            hasClassDirective = true;
        }
    }

    if (hasClassDirective) {
        directives.classDirective = parseClassDirectives(attributes);
    }

    return directives;
}
