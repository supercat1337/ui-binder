// @ts-check

/**
 * Gets a nested property value from an object using a path array.
 *
 * @param {Object} obj - The object to get the property from
 * @param {string[]} pathParts - Array of property names representing the path
 * @returns {*} The value of the nested property, or undefined if not found
 */
export function getNestedProperty(obj, pathParts) {
    return pathParts.reduce((current, part) => {
        return current ? current[part] : undefined;
    }, obj);
}

/**
 * Converts an attribute name to a property name.
 * For example, "data-test" would be converted to "test",
 * "data-test-attr-nested" would be converted to "testAttrNested",
 * "data-test-attr--nested" would be converted to "testAttr-nested".
 * "data-test-attr---nested" would be converted to "testAttr--Nested".
 * "data-test-attr----nested" would be converted to "testAttr--nested".
 * "data-test--attr----nested" would be converted to "test-attr--nested".
 * This is useful for converting HTML attribute names to JavaScript property names.
 * @param {string} attrName - The attribute name to convert
 * @param {string} prefix - The prefix to remove from the attribute name
 * @returns {string} The converted property name
 */
export function attributeNameToPropertyName(attrName, prefix = 'data-') {
    if (!attrName.startsWith(prefix)) return attrName;

    let result = attrName.substring(prefix.length);

    result = result.replace(/\.\./g, "__DOT_MARKER__");
    let parts = result.split('.');

    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        if (part.includes('--')) {
            let propParts = [];
            let subparts = part.split('--');
            for (let j = 0; j < subparts.length; j++) {
                let subpart = subparts[j];
                if (subpart.length == 1) {
                    propParts.push(subpart);
                    continue;
                } else {
                    propParts.push(
                        subpart.replace(/-([a-z])/gi, (g) => g[1].toUpperCase())
                    );
                }
            }
            parts[i] = propParts.join('-');
        } else {
            if (part.length == 1) {
                parts[i] = part;
                continue;
            } else {
                parts[i] = part.replace(/-([a-z])/gi, (g) => g[1].toUpperCase());
            }
        }
    }

    result = parts.join('.');
    result = result.replace(/__DOT_MARKER__/g, "..");

    return result;
}

/**
 * Converts a property name path to an attribute name.
 * For example, "user.isActive" would be converted to "data-user-is-active".
 * This is useful for converting property names to attribute names for use in HTML attributes.
 * @param {string[]|string} input - A property name or array of property names to convert
 * @param {string} [prefix="data-"] - The prefix to add to the attribute name
 * @returns {string} The converted attribute name
 */
export function propertyNameToAttributeName(input, prefix = 'data-') {
    let result = [];

    let propPath = Array.isArray(input) ? input : input.split('.');

    for (let i = 0; i < propPath.length; i++) {
        let prop = propPath[i];

        prop = prop.replace(/-/g, '--').replace(/\./g, '..');
        prop = prop.replace(/([A-Z])/g, '-$1').toLowerCase();

        result.push(prop);
    }

    return prefix + result.join(".");
}

/**
 * Converts a property name to an array path.
 * For example, "user.isActive" would be converted to ["user", "isActive"].
 * This is useful for converting property names to an array path to access a nested property.
 * @param {string} propertyName - The property name to convert
 * @returns {string[]} The converted array path
 */
export function propertyNameToPath(propertyName) {
    let p = propertyName.replace(/\.\./g, '__DOT_MARKER__');
    let path = p.split('.');
    path = path.map(part => part.replace(/__DOT_MARKER__/g, '.'));
    return path;
}

/**
 * Converts an array path to a property name.
 * For example, ["user", "isActive"] would be converted to "user.isActive".
 * ["user", "status.active"] would be converted to "user.status..active".
 * This is useful for converting an array path to a property name to access a nested property.
 * @param {string[]} path - Array of property names representing the path
 * @returns {string} The converted property name
 * @throws {Error} If the path is not an array of property names
 */
export function pathToPropertyName(path) {
    if (!Array.isArray(path)) {
        throw new Error('path must be an array of property names');
    }

    /** @type {string[]} */
    let result = [];

    for (let i=0; i<path.length; i++) {
        let part = path[i];
        part = part.replace(/\./g, "__DOT_MARKER__");
        result.push(part);
    }

    return result.join('.').replace(/__DOT_MARKER__/g, '..');
}

/**
 * Checks if a value is not undefined or null.
 *
 * @param {*} value - The value to check
 * @returns {boolean} True if the value is undefined or null
 */
function isSet(value) {
    return !(value === undefined || value === null);
}

/**
 * Gets a nested property value from an object using an array path.
 *
 * @param {Object} obj - The object to get the property value from
 * @param {string[]} path - Array of property names representing the path
 * @returns {*} The value of the nested property, or undefined if not found
 */
export function getPropertyValue(obj, path) {
    return path.reduce((current, part) => {
        return isSet(current) ? current[part] : current;
    }, obj);
}
