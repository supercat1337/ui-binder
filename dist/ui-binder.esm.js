import { EventEmitter } from '@supercat1337/event-emitter';

// @ts-check


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
function attributeNameToPropertyName(attrName, prefix = 'data-') {
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
function propertyNameToAttributeName(input, prefix = 'data-') {
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
function propertyNameToPath(propertyName) {
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
function pathToPropertyName(path) {
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
function getPropertyValue(obj, path) {
    return path.reduce((current, part) => {
        return isSet(current) ? current[part] : current;
    }, obj);
}

/**
 * Sets a nested property value from an object using an array path.
 * @param {Object} obj - The object to set the property value on
 * @param {string[]} path - Array of property names representing the path
 * @param {*} value - The value to set on the nested property
 * @returns {*} The modified object
 */
function setPropertyValue(obj, path, value) {
    return path.reduce((current, part, index) => {
        if (index === path.length - 1) {
            current[part] = value;
        }
        return current[part];
    }, obj);
}

// @ts-check

/**
 * Returns a Map of the attributes of the given element.
 * The keys are the attribute names, and the values are the attribute values.
 * @param {Element} element The element to get the attributes from.
 * @returns {Map<string, string>} A Map of the element's attributes.
 */
function getElementAttrs(element) {
    // Safer method that works with both SVG and HTML
    const attrs = new Map();
    for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attrs.set(attr.name, attr.value);
    }
    return attrs;
}

const nativeProps = {
    contenteditable: 'contentEditable',
    innerhtml: 'innerHTML',
    innertext: 'innerText',
    outerhtml: 'outerHTML',
    outertext: 'outerText',
    classname: 'className',
    textcontent: 'textContent',
};

/**
 *
 * @param {string} name
 * @param {string} [prefix="data-"]
 * @returns {string|false}
 */
function isNativePropertyName(name, prefix = 'data-') {
    let result = name.startsWith(prefix) ? name.substring(prefix.length) : name;

    result = result.toLowerCase();

    //console.log(`${result} in window.Element.prototype: `, result in window.Element.prototype);

    return nativeProps[result] || (result in window.Element.prototype ? result : false);
}

// @ts-check


/**
 * Checks if an element is valid for two-way binding.
 * This function checks if an element is a TEXTAREA, SELECT, or an INPUT with a supported type.
 * It also checks if an element has contenteditable set to true, or has a role of "textbox".
 * @param {Element} element - The element to check
 * @returns {boolean} True if the element is valid for two-way binding, false otherwise
 */
function isValidForTwoWayBinding(element) {
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

// @ts-check

const DIRECTIVE_PREFIXES = {
    ATTRIBUTE: 'data-a-',
    PROPERTY: 'data-p-',
    BEHAVIOR: 'data-b-',
    MODEL: 'data-m',
    CLASS: 'data-c',
};

// @ts-check


/**
 * Represents a parsed directive value.
 * Used for data-a-, data-p-, data-b- directives.
 */
class DirectiveValue {
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

// @ts-check


/**
 * Represents class directives parsed from element attributes.
 */
class ClassDirectiveValue {
    /** @type {Map<string, DirectiveValue>} */
    reactiveClasses = new Map(); // data-c-*="propertyName" (boolean reactive property)
    /** @type {DirectiveValue|null} */
    computedClass = null; // data-c="computedPropertyName" (string reactive property)
}

// @ts-check


/**
 * Container for all parsed directives from an element.
 */
class ParsedDirectives {
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

// @ts-check


// {target}#{modifier}({...eventModifierArgs})

/**
 * Parses attribute directives from element attributes.
 * Attribute directives manage element attributes using `data-a-*` prefix.
 *
 * @param {string} value
 * @example
 * // <div data-a-aria-label="ariaLabel" data-a-title="pageTitle">
 * // Updates element.setAttribute() based on property values
 */

function parseAttributeDirective(value) {
    // Placeholder - actual implementation depends on your pattern
    // This file handles data-a-* directives
    return parseDirectiveValue(value);
}

// @ts-check


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
function parseClassDirectives(attributes) {
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

// @ts-check

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
function parseModelDirective(value) {
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

// @ts-check


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

function parsePropertyDirective(value) {
    // Placeholder - actual implementation depends on your pattern
    // This file handles data-p-* directives
    return parseDirectiveValue(value);
}

// @ts-check


// {target}#{modifier}({...eventModifierArgs})

/**
 * Parses behavior directives from element attributes.
 * Behavior directives manage element behaviors using `data-b-*` prefix.
 * Supports: data-b-text, data-b-html, data-b-show, etc.
 * 
 * @param {string} value
 * @example
 * // <div data-b-text="textContent" data-b-show="isVisible">
 * // Manages element visibility and content rendering
 */

function parseBehaviorDirective(value) {
    // Placeholder - actual implementation depends on your pattern
    // This file handles data-b-* directives
    return parseDirectiveValue(value);
}

// @ts-check


// {target}:{domProperty}#{modifier}({...eventModifierArgs})@{event}

/**
 * Parses a modifier string (e.g., "debounce(300,100)") into name and arguments.
 * @param {string} str - The modifier string without leading '#'.
 * @returns {Array<[string, Array<string|number|boolean>]>} Array of [modifierName, args[]] pairs.
 */
function parseModifiersString(str) {
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
function parseDirectiveValue(value) {
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
function parseDirectives(element, attributes = null) {
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

// @ts-check


class HandlerContext {
    /**
     * Constructor for HandlerContext.
     * @param {Object} state
     * @param {{ config ?: Object, signal?: AbortSignal|null }} options
     */
    constructor(state, { config  = {}, signal = null }) {
        this.state = state;
        this.signal = signal;
        this.config  = config ;
        /** @type {Function[]} */
        this.unsubscribers = [];
    }

    /**
     * Get a value from the state object by path.
     * If the value is not found, return the default value.
     * @param {string|string[]} path - Path to the value in the state object.
     * @param {*} defaultValue - Optional default value to return if the value is not found.
     * @returns {*} Value from the state object or the default value.
     */
    get(path, defaultValue = null) {
        let p = Array.isArray(path) ? path : propertyNameToPath(path);
        return getPropertyValue(this.state, p) ?? defaultValue;
    }

    /**
     * Checks if the handler is active.
     * @returns {boolean} True if the handler is active, false otherwise.
     */
    get isActive() {
        return !this.signal || !this.signal.aborted;
    }

    /**
     * Adds a cleanup function to the handler context.
     * @param {()=>void} cleanupFn - The cleanup function to add.
     * @returns {Function} The cleanup function that was added.
     */
    addCleanup(cleanupFn) {
        this.unsubscribers.push(cleanupFn);

        if (this.signal && !this.signal.aborted) {
            this.signal.addEventListener('abort', () => this.dispose(), { once: true });
        }
        return cleanupFn;
    }

    dispose() {
        this.unsubscribers.forEach(fn => {
            try {
                fn();
            } catch (error) {
                console.warn('Error during cleanup:', error);
            }
        });
        this.unsubscribers = [];
    }
}

// @ts-check

/** @type {{
    modelDirective: "modelDirective",
    attributeDirective: "attributeDirective",
    propertyDirective: "propertyDirective",
    classDirective: "classDirective",
    behaviorDirective: "behaviorDirective"
}} */
const EVENTS = {
    modelDirective: 'modelDirective',
    attributeDirective: 'attributeDirective',
    propertyDirective: 'propertyDirective',
    classDirective: 'classDirective',
    behaviorDirective: 'behaviorDirective',
};

/**
 * Parser for processing directives from DOM elements.
 * Emits events for each directive type.
 *
 * @example
 * const parser = new DirectiveParser();
 * parser.onAttributeDirective((element, directives) => {
 *   console.log('Attribute directives found:', directives);
 * });
 * parser.processElement(element);
 */
class DirectiveParser {
    /** @type {EventEmitter<keyof EVENTS>} */
    eventEmitter = new EventEmitter();

    /**
     * Parses all directives from an element and emits appropriate events.
     *
     * @param {Element} element - The DOM element to parse directives from
     * @param {Object} state - The state object to bind to
     * @param {{ signal?: AbortSignal, config?: Object}} [userOptions = {}] - Additional options
     * @returns {{ directives: ParsedDirectives, context: HandlerContext }}
     */
    processElement(element, state, userOptions = {}) {
        let parsedDirectives = parseDirectives(element);
        const { signal, config } = userOptions;

        const context = new HandlerContext(state, {
            config,
            signal,
        });

        if (parsedDirectives.modelDirective) {
            this.eventEmitter.emit(
                EVENTS.modelDirective,
                element,
                parsedDirectives.modelDirective,
                context
            );
        }

        if (parsedDirectives.attributeDirectives.size > 0) {
            this.eventEmitter.emit(
                EVENTS.attributeDirective,
                element,
                parsedDirectives.attributeDirectives,
                context
            );
        }

        if (parsedDirectives.propertyDirectives.size > 0) {
            this.eventEmitter.emit(
                EVENTS.propertyDirective,
                element,
                parsedDirectives.propertyDirectives,
                context
            );
        }

        if (parsedDirectives.classDirective) {
            this.eventEmitter.emit(
                EVENTS.classDirective,
                element,
                parsedDirectives.classDirective,
                context
            );
        }

        if (parsedDirectives.behaviorDirectives.size > 0) {
            this.eventEmitter.emit(
                EVENTS.behaviorDirective,
                element,
                parsedDirectives.behaviorDirectives,
                context
            );
        }

        return {
            directives: parsedDirectives,
            context,
        };
    }

    /**
     * Registers a callback for attribute directive events.
     * Called when element attributes matching `data-a-*` pattern are found.
     *
     * @param {(element:Element, attributeDirectives:Map<string, DirectiveValue>, handlerContext:HandlerContext)=>void} callback - Handler function receiving element and directives map
     * @returns {()=>void} Unsubscribe function to remove the listener
     */
    onAttributeDirective(callback) {
        return this.eventEmitter.on(EVENTS.attributeDirective, callback);
    }

    /**
     * Registers a callback for model directive events.
     * Called when a two-way binding directive (`data-m`) is found.
     *
     * @param {(element:Element, modelDirective:DirectiveValue, handlerContext:HandlerContext)=>void} callback - Handler function receiving element and model directive
     * @returns {()=>void} Unsubscribe function to remove the listener
     */
    onModelDirective(callback) {
        return this.eventEmitter.on(EVENTS.modelDirective, callback);
    }

    /**
     * Registers a callback for property directive events.
     * Called when element properties matching `data-p-*` pattern are found.
     *
     * @param {(element:Element, propertyDirectives:Map<string, DirectiveValue>, handlerContext:HandlerContext)=>void} callback - Handler function receiving element and directives map
     * @returns {()=>void} Unsubscribe function to remove the listener
     */
    onPropertyDirective(callback) {
        return this.eventEmitter.on(EVENTS.propertyDirective, callback);
    }

    /**
     * Registers a callback for class directive events.
     * Called when class directives matching `data-c*` pattern are found.
     *
     * @param {(element:Element, classDirective:ClassDirectiveValue, handlerContext:HandlerContext)=>void} callback - Handler function receiving element and class directive
     * @returns {()=>void} Unsubscribe function to remove the listener
     */
    onClassDirective(callback) {
        return this.eventEmitter.on(EVENTS.classDirective, callback);
    }

    /**
     * Registers a callback for behavior directive events.
     * Called when behavior directives matching `data-b-*` pattern are found.
     *
     * @param {(element:Element, behaviorDirectives:Map<string, DirectiveValue>, handlerContext:HandlerContext)=>void} callback - Handler function receiving element and directives map
     * @returns {()=>void} Unsubscribe function to remove the listener
     */
    onBehaviorDirective(callback) {
        return this.eventEmitter.on(EVENTS.behaviorDirective, callback);
    }

    /**
     * Clears all event listeners.
     */
    clear() {
        this.eventEmitter.clear();
    }
}

// @ts-check


/**
 * Base class for reactive bridges.
 */
class BridgeBase {

    constructor() {

        /** @type {Map<Element, HandlerContext>} */
        this.boundElements = new Map(); // element -> HandlerContext

        this.parser = new DirectiveParser();
        let that = this;

        this.parser.onAttributeDirective((element, attributeDirectives, handlerContext) => {
            that.attributeDirectivesCallback(element, attributeDirectives, handlerContext);
        });

        this.parser.onModelDirective((element, modelDirective, handlerContext) => {
            that.modelDirectiveCallback(element, modelDirective, handlerContext);
        });

        this.parser.onPropertyDirective((element, propertyDirectives, handlerContext) => {
            that.propertyDirectivesCallback(element, propertyDirectives, handlerContext);
        });

        this.parser.onClassDirective((element, classDirective, handlerContext) => {
            that.classDirectiveCallback(element, classDirective, handlerContext);
        });
    }

    /**
     * Binds the element to the reactive state.
     * @param {Element} element
     * @param {Object} state
     * @param {Object} options - Optional configuration
     * @param {AbortSignal} [options.signal] - Signal for automatic cleanup
     * @param {Object} [options.config] - Additional configuration
     * @returns {{ context: HandlerContext, directives: Object, dispose: () => void }}
     */
    bindElement(element, state,  options = {}) {
        if (!this.isStateCompatible(state)) {
            throw new Error(`State is not compatible with bridge ${this.constructor.name}`);
        }

        if (this.boundElements.has(element)) {
            this.unbindElement(element);
        }

        const result = this.parser.processElement(element, state, options);

        this.boundElements.set(element, result.context);

        return {
            context: result.context,
            directives: result.directives,
            dispose: () => this.unbindElement(element),
        };
    }

    /**
     * Unbinds the element from the reactive state.
     * @param {Element} element
     */
    unbindElement(element) {
        const context = this.boundElements.get(element);
        if (context) {
            context.dispose();
            this.boundElements.delete(element);
        }
    }

    /**
     * Disposes the bridge.
     */
    dispose() {
        for (const [element] of this.boundElements) {
            this.unbindElement(element);
        }
    }

    // ============ Abstract ============

    /**
     * @param {unknown} state
     * @returns {boolean}
     */
    isStateCompatible(state) {
        console.warn('Method must be implemented by subclass');
        return false;
    }

    /**
     * Callback for attribute directives
     * @param {Element} element
     * @param {Map<string, DirectiveValue>} directives
     * @param {HandlerContext} handlerContext
     */
    attributeDirectivesCallback(element, directives, handlerContext) {
        console.log('Attribute directives found:', directives);
        console.warn('Method must be implemented by subclass');
    }

    /**
     * Callback for class directive
     * @param {Element} element
     * @param {ClassDirectiveValue} directive
     * @param {HandlerContext} handlerContext
     */
    classDirectiveCallback(element, directive, handlerContext) {
        console.log('Class directive found:', directive);
        console.warn('Method must be implemented by subclass');
    }

    /**
     * Callback for property directives
     * @param {Element} element
     * @param {Map<string, DirectiveValue>} directives
     * @param {HandlerContext} handlerContext
     */
    propertyDirectivesCallback(element, directives, handlerContext) {
        console.log('Property directives found:', directives);
        console.warn('Method must be implemented by subclass');
    }

    /**
     * Callback for model directive
     * @param {Element} element
     * @param {DirectiveValue} directive
     * @param {HandlerContext} handlerContext
     */
    modelDirectiveCallback(element, directive, handlerContext) {
        console.log('Model directive found:', directive);
        console.warn('Method must be implemented by subclass');
    }

    /**
     * Callback for behavior directive
     * @param {Element} element
     * @param {Map<string, DirectiveValue>} directives
     * @param {HandlerContext} handlerContext
     */
    behaviorDirectiveCallback(element, directives, handlerContext) {
        console.log('Behavior directives found:', directives);
        console.warn('Method must be implemented by subclass');
    }
}

export { BridgeBase, ClassDirectiveValue, DIRECTIVE_PREFIXES, DirectiveParser, DirectiveValue, ParsedDirectives, attributeNameToPropertyName, getElementAttrs, getPropertyValue, isValidForTwoWayBinding, parseDirectives, pathToPropertyName, propertyNameToAttributeName, propertyNameToPath, setPropertyValue };
