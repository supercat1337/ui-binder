// @ts-check
import { parseModifiersString } from '../utils.js';
import { DirectiveValue } from '../../directive-value.js';
import { propertyNameToPath } from '../../../utils/properties.js';

// {target}:{domProperty}#{modifier}({...eventModifierArgs})@{event}

/**
 * Parses a directive value into a DirectiveValue object.
 * A directive value is a string that can contain the following parts:
 * - an event name (e.g. @click)
 * - a DOM property name (e.g. :style)
 * - a target (e.g. #myElement)
 * - event modifiers (e.g. #stopPropagation, #stop default)
 * The parsing is done in the following order:
 * 1. Event name
 * 2. DOM property name
 * 3. Target and event modifiers
 * The function returns a DirectiveValue object with the parsed values.
 * @param {string} value The directive value to parse.
 * @returns {DirectiveValue} The parsed directive value.
 */
export function parseModelDirective(value) {
    let directiveValue = new DirectiveValue();
    let rest = value;

    // 1. Parse event (last @)
    let atIndex = rest.lastIndexOf('@');
    if (atIndex !== -1) {
        directiveValue.event = rest.slice(atIndex + 1);
        rest = rest.slice(0, atIndex);
    }

    // 2. Find first '#' to separate modifiers
    let hashIndex = rest.indexOf('#');
    let modifiersStr = '';
    if (hashIndex !== -1) {
        modifiersStr = rest.slice(hashIndex + 1);
        rest = rest.slice(0, hashIndex);
    }

    // 3. Now rest contains either target or target:domProperty
    // Split by ':' to get target and domProperty
    let colonIndex = rest.indexOf(':');
    if (colonIndex !== -1) {
        directiveValue.target = rest.slice(0, colonIndex);
        directiveValue.domProperty = rest.slice(colonIndex + 1);
    } else {
        directiveValue.target = rest;
    }

    // 4. Parse modifiers if any
    if (modifiersStr) {
        let modifiers = parseModifiersString(modifiersStr);
        for (let [name, args] of modifiers) {
            directiveValue.eventModifiers.set(name, args);
        }
    }

    return directiveValue;
}
