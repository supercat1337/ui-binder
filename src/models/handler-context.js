// @ts-check

import { getPropertyValue, propertyNameToPath } from '../utils/properties.js';

export class HandlerContext {
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
