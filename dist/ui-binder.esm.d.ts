/**
 * Base class for reactive bridges.
 */
export class BridgeBase {
    /** @type {Map<Element, HandlerContext>} */
    boundElements: Map<Element, HandlerContext>;
    parser: DirectiveParser;
    /**
     * Binds the element to the reactive state.
     * @param {Element} element
     * @param {Object} state
     * @param {Object} options - Optional configuration
     * @param {AbortSignal} [options.signal] - Signal for automatic cleanup
     * @param {Object} [options.config] - Additional configuration
     * @returns {{ context: HandlerContext, directives: Object, dispose: () => void }}
     */
    bindElement(element: Element, state: any, options?: {
        signal?: AbortSignal;
        config?: any;
    }): {
        context: HandlerContext;
        directives: any;
        dispose: () => void;
    };
    /**
     * Unbinds the element from the reactive state.
     * @param {Element} element
     */
    unbindElement(element: Element): void;
    /**
     * Disposes the bridge.
     */
    dispose(): void;
    /**
     * @param {unknown} state
     * @returns {boolean}
     */
    isStateCompatible(state: unknown): boolean;
    /**
     * Callback for attribute directives
     * @param {Element} element
     * @param {Map<string, DirectiveValue>} directives
     * @param {HandlerContext} handlerContext
     */
    attributeDirectivesCallback(element: Element, directives: Map<string, DirectiveValue>, handlerContext: HandlerContext): void;
    /**
     * Callback for class directive
     * @param {Element} element
     * @param {ClassDirectiveValue} directive
     * @param {HandlerContext} handlerContext
     */
    classDirectiveCallback(element: Element, directive: ClassDirectiveValue, handlerContext: HandlerContext): void;
    /**
     * Callback for property directives
     * @param {Element} element
     * @param {Map<string, DirectiveValue>} directives
     * @param {HandlerContext} handlerContext
     */
    propertyDirectivesCallback(element: Element, directives: Map<string, DirectiveValue>, handlerContext: HandlerContext): void;
    /**
     * Callback for model directive
     * @param {Element} element
     * @param {DirectiveValue} directive
     * @param {HandlerContext} handlerContext
     */
    modelDirectiveCallback(element: Element, directive: DirectiveValue, handlerContext: HandlerContext): void;
    /**
     * Callback for behavior directive
     * @param {Element} element
     * @param {Map<string, DirectiveValue>} directives
     * @param {HandlerContext} handlerContext
     */
    behaviorDirectiveCallback(element: Element, directives: Map<string, DirectiveValue>, handlerContext: HandlerContext): void;
}
/**
 * Represents class directives parsed from element attributes.
 */
export class ClassDirectiveValue {
    /** @type {Map<string, DirectiveValue>} */
    reactiveClasses: Map<string, DirectiveValue>;
    /** @type {DirectiveValue|null} */
    computedClass: DirectiveValue | null;
}
export namespace DIRECTIVE_PREFIXES {
    let ATTRIBUTE: string;
    let PROPERTY: string;
    let BEHAVIOR: string;
    let MODEL: string;
    let CLASS: string;
}
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
export class DirectiveParser {
    /** @type {EventEmitter<keyof EVENTS>} */
    eventEmitter: EventEmitter<"modelDirective" | "attributeDirective" | "propertyDirective" | "classDirective" | "behaviorDirective">;
    /**
     * Parses all directives from an element and emits appropriate events.
     *
     * @param {Element} element - The DOM element to parse directives from
     * @param {Object} state - The state object to bind to
     * @param {{ signal?: AbortSignal, config?: Object}} [userOptions = {}] - Additional options
     * @returns {{ directives: ParsedDirectives, context: HandlerContext }}
     */
    processElement(element: Element, state: any, userOptions?: {
        signal?: AbortSignal;
        config?: any;
    }): {
        directives: ParsedDirectives;
        context: HandlerContext;
    };
    /**
     * Registers a callback for attribute directive events.
     * Called when element attributes matching `data-a-*` pattern are found.
     *
     * @param {(element:Element, attributeDirectives:Map<string, DirectiveValue>, handlerContext:HandlerContext)=>void} callback - Handler function receiving element and directives map
     * @returns {()=>void} Unsubscribe function to remove the listener
     */
    onAttributeDirective(callback: (element: Element, attributeDirectives: Map<string, DirectiveValue>, handlerContext: HandlerContext) => void): () => void;
    /**
     * Registers a callback for model directive events.
     * Called when a two-way binding directive (`data-m`) is found.
     *
     * @param {(element:Element, modelDirective:DirectiveValue, handlerContext:HandlerContext)=>void} callback - Handler function receiving element and model directive
     * @returns {()=>void} Unsubscribe function to remove the listener
     */
    onModelDirective(callback: (element: Element, modelDirective: DirectiveValue, handlerContext: HandlerContext) => void): () => void;
    /**
     * Registers a callback for property directive events.
     * Called when element properties matching `data-p-*` pattern are found.
     *
     * @param {(element:Element, propertyDirectives:Map<string, DirectiveValue>, handlerContext:HandlerContext)=>void} callback - Handler function receiving element and directives map
     * @returns {()=>void} Unsubscribe function to remove the listener
     */
    onPropertyDirective(callback: (element: Element, propertyDirectives: Map<string, DirectiveValue>, handlerContext: HandlerContext) => void): () => void;
    /**
     * Registers a callback for class directive events.
     * Called when class directives matching `data-c*` pattern are found.
     *
     * @param {(element:Element, classDirective:ClassDirectiveValue, handlerContext:HandlerContext)=>void} callback - Handler function receiving element and class directive
     * @returns {()=>void} Unsubscribe function to remove the listener
     */
    onClassDirective(callback: (element: Element, classDirective: ClassDirectiveValue, handlerContext: HandlerContext) => void): () => void;
    /**
     * Registers a callback for behavior directive events.
     * Called when behavior directives matching `data-b-*` pattern are found.
     *
     * @param {(element:Element, behaviorDirectives:Map<string, DirectiveValue>, handlerContext:HandlerContext)=>void} callback - Handler function receiving element and directives map
     * @returns {()=>void} Unsubscribe function to remove the listener
     */
    onBehaviorDirective(callback: (element: Element, behaviorDirectives: Map<string, DirectiveValue>, handlerContext: HandlerContext) => void): () => void;
    /**
     * Clears all event listeners.
     */
    clear(): void;
}
/**
 * Represents a parsed directive value.
 * Used for data-a-, data-p-, data-b- directives.
 */
export class DirectiveValue {
    target: string;
    domProperty: string;
    event: string;
    /** @type {Map<string, Array<string|number|boolean>>} */
    eventModifiers: Map<string, Array<string | number | boolean>>;
    /** @type {string[]} */
    get targetParts(): string[];
    /** @type {string[]} */
    get domPropertyParts(): string[];
}
/**
 * Container for all parsed directives from an element.
 */
export class ParsedDirectives {
    /** @type {Map<string, DirectiveValue>} */
    attributeDirectives: Map<string, DirectiveValue>;
    /** @type {Map<string, DirectiveValue>} */
    propertyDirectives: Map<string, DirectiveValue>;
    /** @type {Map<string, DirectiveValue>} */
    behaviorDirectives: Map<string, DirectiveValue>;
    /** @type {DirectiveValue|null} */
    modelDirective: DirectiveValue | null;
    /** @type {ClassDirectiveValue|null} */
    classDirective: ClassDirectiveValue | null;
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
export function attributeNameToPropertyName(attrName: string, prefix?: string): string;
/**
 * Returns a Map of the attributes of the given element.
 * The keys are the attribute names, and the values are the attribute values.
 * @param {Element} element The element to get the attributes from.
 * @returns {Map<string, string>} A Map of the element's attributes.
 */
export function getElementAttrs(element: Element): Map<string, string>;
/**
 * Gets a nested property value from an object using an array path.
 *
 * @param {Object} obj - The object to get the property value from
 * @param {string[]} path - Array of property names representing the path
 * @returns {*} The value of the nested property, or undefined if not found
 */
export function getPropertyValue(obj: any, path: string[]): any;
/**
 * Checks if an element is valid for two-way binding.
 * This function checks if an element is a TEXTAREA, SELECT, or an INPUT with a supported type.
 * It also checks if an element has contenteditable set to true, or has a role of "textbox".
 * @param {Element} element - The element to check
 * @returns {boolean} True if the element is valid for two-way binding, false otherwise
 */
export function isValidForTwoWayBinding(element: Element): boolean;
/**
 * Parses directives from an element's attributes.
 * @param {Element} element
 * @param {Map<string, string>|null} attributes
 * @returns {ParsedDirectives}
 */
export function parseDirectives(element: Element, attributes?: Map<string, string> | null): ParsedDirectives;
/**
 * Converts an array path to a property name.
 * For example, ["user", "isActive"] would be converted to "user.isActive".
 * ["user", "status.active"] would be converted to "user.status..active".
 * This is useful for converting an array path to a property name to access a nested property.
 * @param {string[]} path - Array of property names representing the path
 * @returns {string} The converted property name
 * @throws {Error} If the path is not an array of property names
 */
export function pathToPropertyName(path: string[]): string;
/**
 * Converts a property name path to an attribute name.
 * For example, "user.isActive" would be converted to "data-user-is-active".
 * This is useful for converting property names to attribute names for use in HTML attributes.
 * @param {string[]|string} input - A property name or array of property names to convert
 * @param {string} [prefix="data-"] - The prefix to add to the attribute name
 * @returns {string} The converted attribute name
 */
export function propertyNameToAttributeName(input: string[] | string, prefix?: string): string;
/**
 * Converts a property name to an array path.
 * For example, "user.isActive" would be converted to ["user", "isActive"].
 * This is useful for converting property names to an array path to access a nested property.
 * @param {string} propertyName - The property name to convert
 * @returns {string[]} The converted array path
 */
export function propertyNameToPath(propertyName: string): string[];
/**
 * Sets a nested property value from an object using an array path.
 * @param {Object} obj - The object to set the property value on
 * @param {string[]} path - Array of property names representing the path
 * @param {*} value - The value to set on the nested property
 * @returns {*} The modified object
 */
export function setPropertyValue(obj: any, path: string[], value: any): any;
declare class HandlerContext {
    /**
     * Constructor for HandlerContext.
     * @param {Object} state
     * @param {{ config ?: Object, signal?: AbortSignal|null }} options
     */
    constructor(state: any, { config, signal }: {
        config?: any;
        signal?: AbortSignal | null;
    });
    state: any;
    signal: AbortSignal;
    config: any;
    /** @type {Function[]} */
    unsubscribers: Function[];
    /**
     * Get a value from the state object by path.
     * If the value is not found, return the default value.
     * @param {string|string[]} path - Path to the value in the state object.
     * @param {*} defaultValue - Optional default value to return if the value is not found.
     * @returns {*} Value from the state object or the default value.
     */
    get(path: string | string[], defaultValue?: any): any;
    /**
     * Checks if the handler is active.
     * @returns {boolean} True if the handler is active, false otherwise.
     */
    get isActive(): boolean;
    /**
     * Adds a cleanup function to the handler context.
     * @param {()=>void} cleanupFn - The cleanup function to add.
     * @returns {Function} The cleanup function that was added.
     */
    addCleanup(cleanupFn: () => void): Function;
    dispose(): void;
}
import { EventEmitter } from '@supercat1337/event-emitter';
export {};
