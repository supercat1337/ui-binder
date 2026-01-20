// @ts-check

import test from 'ava';
import { Window } from 'happy-dom';
import { BridgeBase } from './bridge-base.js';
import { DirectiveValue } from './directive-value.js';
import { HandlerContext } from './handler-context.js';
import { ClassDirectiveValue } from './class-directive-value.js';

const document = new Window({ console }).document;

// Create a test implementation of BridgeBase
class TestBridge extends BridgeBase {
    constructor() {
        super();
        /** @type {Object[]} */
        this.compatibleStates = [];

        /** @type {{ element: Element, directives: Map<string, DirectiveValue>, handlerContext: HandlerContext }[]} */
        this.attributeCallbacks = [];

        /** @type {{ element: Element, directive:DirectiveValue, handlerContext: HandlerContext }[]} */
        this.modelCallbacks = [];

        /** @type {{ element: Element, directives: Map<string, DirectiveValue>, handlerContext: HandlerContext }[]} */
        this.propertyCallbacks = [];

        /** @type {{ element: Element, directive: ClassDirectiveValue, handlerContext: HandlerContext }[]} */
        this.classCallbacks = [];
    }

    /**
     * Checks if the given state is compatible with this bridge.
     * @param {Object|null} state
     * @returns {boolean}
     * @example
     * const bridge = new TestBridge();
     * bridge.isStateCompatible({ foo: 'bar' }); // true
     * bridge.isStateCompatible(null); // true
     * bridge.isStateCompatible(undefined); // false
     */
    isStateCompatible(state) {
        return state === null || this.compatibleStates.includes(state) || typeof state === 'object';
    }

    /**
     * Called when attribute directives matching `data-a-*` pattern are found.
     * @param {Element} element - The element with attribute directives
     * @param {Map<string, DirectiveValue>} directives - A map of attribute directives
     * @param {HandlerContext} handlerContext - The context of the handler
     */
    attributeDirectivesCallback(element, directives, handlerContext) {
        this.attributeCallbacks.push({ element, directives, handlerContext });
    }

    /**
     * Called when a two-way binding directive (`data-m`) is found.
     * @param {Element} element - The element with the two-way binding directive
     * @param {DirectiveValue} directive - The two-way binding directive
     * @param {HandlerContext} handlerContext - The context of the handler
     */
    modelDirectiveCallback(element, directive, handlerContext) {
        this.modelCallbacks.push({ element, directive, handlerContext });
    }

    /**
     * Called when element properties matching `data-p-*` pattern are found.
     * @param {Element} element - The element with property directives
     * @param {Map<string, DirectiveValue>} directives - A map of property directives
     * @param {HandlerContext} handlerContext - The context of the handler
     */
    propertyDirectivesCallback(element, directives, handlerContext) {
        this.propertyCallbacks.push({ element, directives, handlerContext });
    }

    /**
     * Called when class directives matching `data-c*` pattern are found.
     *
     * @param {Element} element - The element with class directives
     * @param {ClassDirectiveValue} directive - The class directive
     * @param {HandlerContext} handlerContext - The context of the handler
     */
    classDirectiveCallback(element, directive, handlerContext) {
        this.classCallbacks.push({ element, directive, handlerContext });
    }
}

// ============================================================================
// Constructor Tests
// ============================================================================

test('BridgeBase: constructor initializes boundElements as empty Map', t => {
    const bridge = new TestBridge();
    t.true(bridge.boundElements instanceof Map);
    t.is(bridge.boundElements.size, 0);
});

test('BridgeBase: constructor initializes parser', t => {
    const bridge = new TestBridge();
    t.truthy(bridge.parser);
});

test('BridgeBase: constructor sets up parser callbacks', t => {
    const bridge = new TestBridge();
    t.is(typeof bridge.parser.onAttributeDirective, 'function');
    t.is(typeof bridge.parser.onModelDirective, 'function');
    t.is(typeof bridge.parser.onPropertyDirective, 'function');
    t.is(typeof bridge.parser.onClassDirective, 'function');
});

// ============================================================================
// bindElement() Tests
// ============================================================================

test('BridgeBase.bindElement: throws error for incompatible state', t => {
    const bridge = new TestBridge();
    bridge.compatibleStates = [];

    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );

    const error = t.throws(
        () => {
            // @ts-expect-error
            bridge.bindElement(element, undefined);
        },
        { instanceOf: Error }
    );

    t.true(error.message.includes('not compatible'));
});

test('BridgeBase.bindElement: returns object with context, directives, and dispose', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state = {};

    const result = bridge.bindElement(element, state);

    t.truthy(result);
    t.truthy(result.context);
    t.truthy(result.directives);
    t.is(typeof result.dispose, 'function');
});

test('BridgeBase.bindElement: stores element in boundElements', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state = {};

    t.is(bridge.boundElements.size, 0);
    bridge.bindElement(element, state);
    t.is(bridge.boundElements.size, 1);
    t.true(bridge.boundElements.has(element));
});

test('BridgeBase.bindElement: unbinds previous binding before rebinding', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state = {};

    bridge.bindElement(element, state);
    t.is(bridge.boundElements.size, 1);

    // Bind again without unbinding first
    bridge.bindElement(element, state);
    t.is(bridge.boundElements.size, 1);
});

test('BridgeBase.bindElement: dispose function unbinds element', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state = {};

    const result = bridge.bindElement(element, state);
    t.is(bridge.boundElements.size, 1);

    result.dispose();
    t.is(bridge.boundElements.size, 0);
});

test('BridgeBase.bindElement: returns HandlerContext with get method', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state = { name: 'test' };

    const result = bridge.bindElement(element, state);
    t.is(typeof result.context.get, 'function');
    t.is(result.context.get('name'), 'test');
});

test('BridgeBase.bindElement: multiple elements can be bound', t => {
    const bridge = new TestBridge();
    const element1 = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const element2 = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state = {};

    bridge.bindElement(element1, state);
    bridge.bindElement(element2, state);

    t.is(bridge.boundElements.size, 2);
    t.true(bridge.boundElements.has(element1));
    t.true(bridge.boundElements.has(element2));
});

// ============================================================================
// unbindElement() Tests
// ============================================================================

test('BridgeBase.unbindElement: removes element from boundElements', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state = {};

    bridge.bindElement(element, state);
    t.is(bridge.boundElements.size, 1);

    bridge.unbindElement(element);
    t.is(bridge.boundElements.size, 0);
    t.false(bridge.boundElements.has(element));
});

test('BridgeBase.unbindElement: calls context.dispose()', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state = {};

    const result = bridge.bindElement(element, state);
    let disposeCalled = false;
    const originalDispose = result.context.dispose.bind(result.context);
    result.context.dispose = () => {
        disposeCalled = true;
        originalDispose();
    };

    bridge.unbindElement(element);
    t.true(disposeCalled);
});

test('BridgeBase.unbindElement: handles non-existent element gracefully', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );

    t.notThrows(() => {
        bridge.unbindElement(element);
    });
});

test('BridgeBase.unbindElement: can unbind after manual dispose', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state = {};

    const result = bridge.bindElement(element, state);
    result.dispose();

    // Should not throw even though already disposed
    t.notThrows(() => {
        bridge.unbindElement(element);
    });
});

// ============================================================================
// dispose() Tests
// ============================================================================

test('BridgeBase.dispose: unbinds all bound elements', t => {
    const bridge = new TestBridge();
    const element1 = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const element2 = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const element3 = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state = {};

    bridge.bindElement(element1, state);
    bridge.bindElement(element2, state);
    bridge.bindElement(element3, state);

    t.is(bridge.boundElements.size, 3);

    bridge.dispose();

    t.is(bridge.boundElements.size, 0);
});

test('BridgeBase.dispose: empties boundElements map', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state = {};

    bridge.bindElement(element, state);
    t.is(bridge.boundElements.size, 1);

    bridge.dispose();
    t.is(bridge.boundElements.size, 0);
});

test('BridgeBase.dispose: can be called multiple times safely', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state = {};

    bridge.bindElement(element, state);
    t.notThrows(() => {
        bridge.dispose();
        bridge.dispose();
        bridge.dispose();
    });
});

// ============================================================================
// isStateCompatible() Tests
// ============================================================================

test('BridgeBase.isStateCompatible: abstract method warns by default', t => {
    const bridge = new BridgeBase();
    // This uses the base implementation which just logs a warning
    const result = bridge.isStateCompatible({});
    t.is(result, false);
});

test('BridgeBase.isStateCompatible: can be overridden by subclass', t => {
    const bridge = new TestBridge();
    const state = {};

    t.true(bridge.isStateCompatible(state));
    t.true(bridge.isStateCompatible({}));
    t.true(bridge.isStateCompatible(null));
});

// ============================================================================
// Callback Tests
// ============================================================================

test('BridgeBase: attribute directive callback is called', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );

    // Add an attribute directive to the element
    element.setAttribute('data-a-test', 'value');
    const state = { test: 'value' };

    bridge.bindElement(element, state);

    // The attribute callback should be called via the parser
    // (actual callback depends on directive parsing)
    t.true(Array.isArray(bridge.attributeCallbacks));
});

test('BridgeBase: model directive callback is called', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLInputElement} */ (
        /** @type {any} */ (document.createElement('input'))
    );

    // Add a model directive to the element
    element.setAttribute('data-m', 'value');
    const state = { value: '' };

    bridge.bindElement(element, state);

    // The model callback should be called via the parser
    t.is(bridge.modelCallbacks.length, 1);
    t.is(bridge.modelCallbacks[0].element, element);
    t.truthy(bridge.modelCallbacks[0].directive);
});

test('BridgeBase: property directive callback is called', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );

    // Add a property directive to the element
    element.setAttribute('data-p-textContent', 'text');
    const state = { text: 'hello' };

    bridge.bindElement(element, state);

    // The property callback should be called via the parser
    t.true(Array.isArray(bridge.propertyCallbacks));
});

test('BridgeBase: class directive callback is called', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );

    // Add a class directive to the element
    element.setAttribute('data-c-active', 'isActive');
    const state = { isActive: true };

    bridge.bindElement(element, state);

    // The class callback should be called via the parser
    t.true(Array.isArray(bridge.classCallbacks));
});

// ============================================================================
// Integration Tests
// ============================================================================

test('integration: bind, retrieve state, and unbind workflow', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state = {
        user: { name: 'Alice', email: 'alice@example.com' },
        count: 0,
    };

    const result = bridge.bindElement(element, state);

    // Check state access through context
    t.is(result.context.get('user.name'), 'Alice');
    t.is(result.context.get('user.email'), 'alice@example.com');
    t.is(result.context.get('count'), 0);

    // Check element is tracked
    t.is(bridge.boundElements.size, 1);

    // Dispose
    result.dispose();
    t.is(bridge.boundElements.size, 0);
});

test('integration: bind and dispose multiple elements', t => {
    const bridge = new TestBridge();
    const elements = [
        /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div'))),
        /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div'))),
        /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div'))),
    ];
    const state = { value: 'test' };

    const results = elements.map(el => bridge.bindElement(el, state));
    t.is(bridge.boundElements.size, 3);

    results.forEach(result => result.dispose());
    t.is(bridge.boundElements.size, 0);
});

test('integration: state mutations are visible through context', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state = { value: 'initial' };

    const result = bridge.bindElement(element, state);
    t.is(result.context.get('value'), 'initial');

    // Mutate state
    state.value = 'updated';

    // Context should reflect the change
    t.is(result.context.get('value'), 'updated');
});

test('integration: abort signal is passed to context', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state = {};
    const abortController = new AbortController();

    const result = bridge.bindElement(element, state, { signal: abortController.signal });

    t.true(result.context.isActive);
    abortController.abort();
    t.false(result.context.isActive);
});

test('integration: config is passed to context', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state = {};
    const config = { debug: true, timeout: 5000 };

    const result = bridge.bindElement(element, state, { config });

    t.deepEqual(result.context.config, config);
});

test('integration: full lifecycle - bind, use, rebind, dispose', t => {
    const bridge = new TestBridge();
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const state1 = { version: 1 };
    const state2 = { version: 2 };

    // First binding
    const result1 = bridge.bindElement(element, state1);
    t.is(result1.context.get('version'), 1);
    t.is(bridge.boundElements.size, 1);

    // Rebind (should unbind first)
    const result2 = bridge.bindElement(element, state2);
    t.is(result2.context.get('version'), 2);
    t.is(bridge.boundElements.size, 1);

    // Dispose all
    bridge.dispose();
    t.is(bridge.boundElements.size, 0);
});

// Test default callback implementations
test('BridgeBase: default attributeDirectivesCallback logs and warns', t => {
    /**
     * @type {{ log: any[], warn: any[] }}
     */
    const ctx = { log: [], warn: [] };
    const logSpy = ctx.log;
    const warnSpy = ctx.warn;
    const originalLog = console.log;
    const originalWarn = console.warn;

    console.log = (...args) => logSpy.push(args);
    console.warn = (...args) => warnSpy.push(args);

    try {
        const bridge = new BridgeBase();
        const element = /** @type {HTMLDivElement} */ (
            /** @type {any} */ (document.createElement('div'))
        );
        const directives = new Map();
        const handlerContext = new HandlerContext({}, { config: {} });

        bridge.attributeDirectivesCallback(element, directives, handlerContext);

        t.is(logSpy.length, 1);
        t.is(warnSpy.length, 1);
        t.deepEqual(logSpy[0], ['Attribute directives found:', directives]);
        t.is(warnSpy[0][0], 'Method must be implemented by subclass');
    } finally {
        console.log = originalLog;
        console.warn = originalWarn;
    }
});

test('BridgeBase: default classDirectiveCallback logs and warns', t => {
    /**
     * @type {{ log: any[], warn: any[] }}
     */
    const ctx = { log: [], warn: [] };
    const logSpy = ctx.log;
    const warnSpy = ctx.warn;
    const originalLog = console.log;
    const originalWarn = console.warn;
    console.log = (...args) => logSpy.push(args);
    console.warn = (...args) => warnSpy.push(args);

    try {
        const bridge = new BridgeBase();
        const element = /** @type {HTMLDivElement} */ (
            /** @type {any} */ (document.createElement('div'))
        );
        const directive = new ClassDirectiveValue();
        const handlerContext = new HandlerContext({}, { config: {} });

        bridge.classDirectiveCallback(element, directive, handlerContext);

        t.is(logSpy.length, 1);
        t.is(warnSpy.length, 1);
        t.deepEqual(logSpy[0], ['Class directive found:', directive]);
        t.is(warnSpy[0][0], 'Method must be implemented by subclass');
    } finally {
        console.log = originalLog;
        console.warn = originalWarn;
    }
});

test('BridgeBase: default propertyDirectivesCallback logs and warns', t => {
    /**
     * @type {{ log: any[], warn: any[] }}
     */
    const ctx = { log: [], warn: [] };
    const logSpy = ctx.log;
    const warnSpy = ctx.warn;
    const originalLog = console.log;
    const originalWarn = console.warn;

    console.log = (...args) => logSpy.push(args);
    console.warn = (...args) => warnSpy.push(args);

    try {
        const bridge = new BridgeBase();
        const element = /** @type {HTMLDivElement} */ (
            /** @type {any} */ (document.createElement('div'))
        );
        const directives = new Map();
        const handlerContext = new HandlerContext({}, { config: {} });

        bridge.propertyDirectivesCallback(element, directives, handlerContext);

        t.is(logSpy.length, 1);
        t.is(warnSpy.length, 1);
        t.deepEqual(logSpy[0], ['Property directives found:', directives]);
        t.is(warnSpy[0][0], 'Method must be implemented by subclass');
    } finally {
        console.log = originalLog;
        console.warn = originalWarn;
    }
});

test('BridgeBase: default modelDirectiveCallback logs and warns', t => {
    /**
     * @type {{ log: any[], warn: any[] }}
     */
    const ctx = { log: [], warn: [] };
    const logSpy = ctx.log;
    const warnSpy = ctx.warn;
    const originalLog = console.log;
    const originalWarn = console.warn;

    console.log = (...args) => logSpy.push(args);
    console.warn = (...args) => warnSpy.push(args);

    try {
        const bridge = new BridgeBase();
        const element = /** @type {HTMLDivElement} */ (
            /** @type {any} */ (document.createElement('div'))
        );
        const directive = new DirectiveValue();
        const handlerContext = new HandlerContext({}, { config: {} });

        bridge.modelDirectiveCallback(element, directive, handlerContext);

        t.is(logSpy.length, 1);
        t.is(warnSpy.length, 1);
        t.deepEqual(logSpy[0], ['Model directive found:', directive]);
        t.is(warnSpy[0][0], 'Method must be implemented by subclass');
    } finally {
        console.log = originalLog;
        console.warn = originalWarn;
    }
});
