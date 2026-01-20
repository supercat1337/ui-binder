// @ts-check

import { DirectiveParser } from './directive-parser.js';
import { HandlerContext } from './handler-context.js';
import { DirectiveValue } from './directive-value.js';
import { ClassDirectiveValue } from './class-directive-value.js';

/**
 * Base class for reactive bridges.
 */
export class BridgeBase {

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
