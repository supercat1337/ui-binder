// @ts-check

import { propertyNameToPath } from '../utils/properties.js';

/**
 * Represents a parsed directive value.
 * Used for data-a-, data-p-, data-b- directives.
 */
export class DirectiveValue {
    target = '';
    domProperty = '';
    event = '';
    /** @type {Map<string, Array<string|number|boolean>>} */
    eventModifiers = new Map();

    /** @type {string[]} */
    get targetParts() {
        return propertyNameToPath(this.target);
    }

    /** @type {string[]} */
    get domPropertyParts() {
        return propertyNameToPath(this.domProperty);
    }
}
