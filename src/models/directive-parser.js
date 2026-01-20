// @ts-check
import { EventEmitter } from '@supercat1337/event-emitter';
import { DirectiveValue } from './directive-value.js';
import { parseDirectives } from './directive-parser/utils.js';
import { ClassDirectiveValue } from './class-directive-value.js';
import { HandlerContext } from './handler-context.js';
import { ParsedDirectives } from './parsed-directives.js';

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
export { DirectiveParser };
