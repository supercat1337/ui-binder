

import test from 'ava';
import { DirectiveParser } from './directive-parser.js';
import { Window } from 'happy-dom';
import { DirectiveValue } from './directive-value.js';
import { HandlerContext } from './handler-context.js';

const window = new Window({ console }).window;
// @ts-expect-error
global.window = window;

const document = window.document;
// Helper to create a DOM element with attributes
function createElement(tag, attributes = {}) {
    const element = window.document.createElement(tag);
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    return element;
}

// ============================================================================
// Return Type Tests
// ============================================================================

test('DirectiveParser: constructor creates instance', t => {
    const parser = new DirectiveParser();
    t.truthy(parser);
    t.is(typeof parser, 'object');
    t.truthy(parser.eventEmitter);
});

test('DirectiveParser: has all event registration methods', t => {
    const parser = new DirectiveParser();
    t.is(typeof parser.onAttributeDirective, 'function');
    t.is(typeof parser.onModelDirective, 'function');
    t.is(typeof parser.onPropertyDirective, 'function');
    t.is(typeof parser.onClassDirective, 'function');
    t.is(typeof parser.onBehaviorDirective, 'function');
    t.is(typeof parser.processElement, 'function');
    t.is(typeof parser.clear, 'function');
});

// ============================================================================
// processElement Return Value Tests
// ============================================================================

test('DirectiveParser.processElement: returns object with directives and context', t => {
    const parser = new DirectiveParser();
    const element = createElement('div');
    const state = {};

    const result = parser.processElement(element, state);

    t.truthy(result);
    t.truthy(result.directives);
    t.truthy(result.context);
});

test('DirectiveParser.processElement: result has ParsedDirectives object', t => {
    const parser = new DirectiveParser();
    const element = createElement('div');
    const state = {};

    const result = parser.processElement(element, state);

    t.truthy(result.directives);
    t.is(typeof result.directives, 'object');
});

test('DirectiveParser.processElement: result has HandlerContext object', t => {
    const parser = new DirectiveParser();
    const element = createElement('div');
    const state = {};

    const result = parser.processElement(element, state);

    t.truthy(result.context);
    t.is(typeof result.context, 'object');
});

// ============================================================================
// Event Callback Registration Tests
// ============================================================================

test('DirectiveParser.onAttributeDirective: registers callback and returns unsubscriber', t => {
    const parser = new DirectiveParser();
    const element = createElement('div', { 'data-a-title': 'tooltip' });
    const state = {};
    let callbackCalled = false;

    const unsubscribe = parser.onAttributeDirective(() => {
        callbackCalled = true;
    });

    t.is(typeof unsubscribe, 'function');
    parser.processElement(element, state);
    t.true(callbackCalled);
});

test('DirectiveParser.onModelDirective: registers callback for model directive', t => {
    const parser = new DirectiveParser();
    const element = createElement('input', { 'data-m': 'value@input' });
    const state = {};
    let callbackCalled = false;

    parser.onModelDirective(() => {
        callbackCalled = true;
    });

    parser.processElement(element, state);
    t.true(callbackCalled);
});

test('DirectiveParser.onPropertyDirective: registers callback for property directive', t => {
    const parser = new DirectiveParser();
    const element = createElement('div', { 'data-p-disabled': 'isDisabled' });
    const state = {};
    let callbackCalled = false;

    parser.onPropertyDirective(() => {
        callbackCalled = true;
    });

    parser.processElement(element, state);
    t.true(callbackCalled);
});

test('DirectiveParser.onClassDirective: registers callback for class directive', t => {
    const parser = new DirectiveParser();
    const element = createElement('div', { 'data-c-active': 'isActive' });
    const state = {};
    let callbackCalled = false;

    parser.onClassDirective(() => {
        callbackCalled = true;
    });

    parser.processElement(element, state);
    t.true(callbackCalled);
});

test('DirectiveParser.onBehaviorDirective: registers callback for behavior directive', t => {
    const parser = new DirectiveParser();
    const element = createElement('button', { 'data-b-click': 'handleClick' });
    const state = {};
    let callbackCalled = false;

    parser.onBehaviorDirective(() => {
        callbackCalled = true;
    });

    parser.processElement(element, state);
    t.true(callbackCalled);
});

// ============================================================================
// Event Callback Parameters Tests
// ============================================================================

test('DirectiveParser.onAttributeDirective: callback receives element, directives, and context', t => {
    const parser = new DirectiveParser();
    const element = createElement('div', { 'data-a-title': 'tooltip' });
    const state = { myState: true };
    let /** @type {Element} */
        receivedElement,
        /** @type {Map<string, DirectiveValue>} */
        receivedDirectives,
        /** @type {HandlerContext} */
        receivedContext;

    parser.onAttributeDirective((el, directives, context) => {
        receivedElement = el;
        receivedDirectives = directives;
        receivedContext = context;
    });

    parser.processElement(element, state);

    t.is(receivedElement, element);
    t.truthy(receivedDirectives);
    t.is(receivedDirectives instanceof Map, true);
    t.truthy(receivedContext);
});

test('DirectiveParser.onModelDirective: callback receives element, directive, and context', t => {
    const parser = new DirectiveParser();
    const element = createElement('input', { 'data-m': 'value@input' });
    const state = {};
    let receivedElement, receivedDirective, receivedContext;

    parser.onModelDirective((el, directive, context) => {
        receivedElement = el;
        receivedDirective = directive;
        receivedContext = context;
    });

    parser.processElement(element, state);

    t.is(receivedElement, element);
    t.truthy(receivedDirective);
    t.truthy(receivedContext);
});

test('DirectiveParser.onClassDirective: callback receives element, directive, and context', t => {
    const parser = new DirectiveParser();
    const element = createElement('div', { 'data-c-active': 'isActive' });
    const state = {};
    let receivedElement, receivedDirective, receivedContext;

    parser.onClassDirective((el, directive, context) => {
        receivedElement = el;
        receivedDirective = directive;
        receivedContext = context;
    });

    parser.processElement(element, state);

    t.is(receivedElement, element);
    t.truthy(receivedDirective);
    t.truthy(receivedContext);
});

// ============================================================================
// Unsubscriber Functionality Tests
// ============================================================================

test('DirectiveParser: unsubscriber removes callback', t => {
    const parser = new DirectiveParser();
    const element = createElement('div', { 'data-a-title': 'tooltip' });
    const state = {};
    let callCount = 0;

    const unsubscribe = parser.onAttributeDirective(() => {
        callCount++;
    });

    parser.processElement(element, state);
    t.is(callCount, 1);

    unsubscribe();

    parser.processElement(element, state);
    t.is(callCount, 1);
});

test('DirectiveParser: multiple unsubscribers work independently', t => {
    const parser = new DirectiveParser();
    const element = createElement('div', { 'data-a-title': 'tooltip' });
    const state = {};
    let call1 = 0,
        call2 = 0;

    const unsub1 = parser.onAttributeDirective(() => {
        call1++;
    });
    const unsub2 = parser.onAttributeDirective(() => {
        call2++;
    });

    parser.processElement(element, state);
    t.is(call1, 1);
    t.is(call2, 1);

    unsub1();

    parser.processElement(element, state);
    t.is(call1, 1);
    t.is(call2, 2);
});

// ============================================================================
// Multiple Callbacks Tests
// ============================================================================

test('DirectiveParser: multiple callbacks for same event type all fire', t => {
    const parser = new DirectiveParser();
    const element = createElement('div', { 'data-a-title': 'tooltip' });
    const state = {};
    let call1 = false,
        call2 = false,
        call3 = false;

    parser.onAttributeDirective(() => {
        call1 = true;
    });
    parser.onAttributeDirective(() => {
        call2 = true;
    });
    parser.onAttributeDirective(() => {
        call3 = true;
    });

    parser.processElement(element, state);

    t.true(call1);
    t.true(call2);
    t.true(call3);
});

// ============================================================================
// Clear Functionality Tests
// ============================================================================

test('DirectiveParser.clear: removes all event listeners', t => {
    const parser = new DirectiveParser();
    const element = createElement('div', { 'data-a-title': 'tooltip' });
    const state = {};
    let callCount = 0;

    parser.onAttributeDirective(() => {
        callCount++;
    });

    parser.processElement(element, state);
    t.is(callCount, 1);

    parser.clear();

    parser.processElement(element, state);
    t.is(callCount, 1);
});

test('DirectiveParser.clear: clears listeners for all event types', t => {
    const parser = new DirectiveParser();
    const element = createElement('div', {
        'data-a-title': 'tooltip',
        'data-p-disabled': 'isDisabled',
        'data-b-click': 'handleClick',
    });
    const state = {};
    let attrCount = 0,
        propCount = 0,
        behaviorCount = 0;

    parser.onAttributeDirective(() => {
        attrCount++;
    });
    parser.onPropertyDirective(() => {
        propCount++;
    });
    parser.onBehaviorDirective(() => {
        behaviorCount++;
    });

    parser.processElement(element, state);
    t.is(attrCount, 1);
    t.is(propCount, 1);
    t.is(behaviorCount, 1);

    parser.clear();

    parser.processElement(element, state);
    t.is(attrCount, 1);
    t.is(propCount, 1);
    t.is(behaviorCount, 1);
});

// ============================================================================
// Options Passing Tests
// ============================================================================

test('DirectiveParser.processElement: passes signal in context', t => {
    const parser = new DirectiveParser();
    const element = createElement('button', { 'data-b-click': 'handleClick' });
    const state = {};
    const controller = new AbortController();

    /** @type {AbortSignal|null} */
    let receivedSignal;

    parser.onBehaviorDirective((el, directives, context) => {
        receivedSignal = context.signal;
    });

    parser.processElement(element, state, { signal: controller.signal });

    if (receivedSignal != null) t.is(receivedSignal, controller.signal);
});

test('DirectiveParser.processElement: passes config in context', t => {
    const parser = new DirectiveParser();
    const element = createElement('div', { 'data-a-title': 'tooltip' });
    const state = {};
    const config = { customOption: true };
    let receivedConfig;

    parser.onAttributeDirective((el, directives, context) => {
        receivedConfig = context.config;
    });

    parser.processElement(element, state, { config });

    t.deepEqual(receivedConfig, config);
});

test('DirectiveParser.processElement: works without options', t => {
    const parser = new DirectiveParser();
    const element = createElement('div', { 'data-a-title': 'tooltip' });
    const state = {};
    let contextReceived = false;

    parser.onAttributeDirective((el, directives, context) => {
        contextReceived = context !== null;
    });

    parser.processElement(element, state);

    t.true(contextReceived);
});

// ============================================================================
// No Directive Tests
// ============================================================================

test('DirectiveParser: no callbacks fire for element without directives', t => {
    const parser = new DirectiveParser();
    const element = createElement('div');
    const state = {};
    let attrCalled = false,
        modelCalled = false,
        propCalled = false;

    parser.onAttributeDirective(() => {
        attrCalled = true;
    });
    parser.onModelDirective(() => {
        modelCalled = true;
    });
    parser.onPropertyDirective(() => {
        propCalled = true;
    });

    parser.processElement(element, state);

    t.false(attrCalled);
    t.false(modelCalled);
    t.false(propCalled);
});

test('DirectiveParser: only matching callbacks fire', t => {
    const parser = new DirectiveParser();
    const element = createElement('div', { 'data-a-title': 'tooltip' });
    const state = {};
    let attrCalled = false,
        modelCalled = false,
        propCalled = false;

    parser.onAttributeDirective(() => {
        attrCalled = true;
    });
    parser.onModelDirective(() => {
        modelCalled = true;
    });
    parser.onPropertyDirective(() => {
        propCalled = true;
    });

    parser.processElement(element, state);

    t.true(attrCalled);
    t.false(modelCalled);
    t.false(propCalled);
});

// ============================================================================
// Integration Tests
// ============================================================================

test('integration: element with all directive types', t => {
    const parser = new DirectiveParser();
    const element = createElement('input', {
        'data-a-title': 'tooltip',
        'data-m': 'value@input',
        'data-p-placeholder': 'placeholder',
        'data-b-focus': 'onFocus',
        'data-c-active': 'isActive',
    });
    const state = { value: '', placeholder: 'Enter text', isActive: false };

    let attrFired = false,
        modelFired = false,
        propFired = false,
        behaviorFired = false,
        classFired = false;

    parser.onAttributeDirective(() => {
        attrFired = true;
    });
    parser.onModelDirective(() => {
        modelFired = true;
    });
    parser.onPropertyDirective(() => {
        propFired = true;
    });
    parser.onBehaviorDirective(() => {
        behaviorFired = true;
    });
    parser.onClassDirective(() => {
        classFired = true;
    });

    const result = parser.processElement(element, state);

    t.true(attrFired);
    t.true(modelFired);
    t.true(propFired);
    t.true(behaviorFired);
    t.true(classFired);
    t.truthy(result.directives);
    t.truthy(result.context);
});

test('integration: processing multiple elements', t => {
    const parser = new DirectiveParser();
    const element1 = createElement('input', { 'data-m': 'name@input' });
    const element2 = createElement('button', { 'data-b-click': 'handleClick' });
    const state = { name: '', clicked: false };

    let modelCount = 0,
        behaviorCount = 0;

    parser.onModelDirective(() => {
        modelCount++;
    });
    parser.onBehaviorDirective(() => {
        behaviorCount++;
    });

    parser.processElement(element1, state);
    parser.processElement(element2, state);

    t.is(modelCount, 1);
    t.is(behaviorCount, 1);
});

test('integration: state context binding', t => {
    const parser = new DirectiveParser();
    const element = createElement('div', { 'data-a-title': 'myTitle' });
    const state = { title: 'Hello World', nested: { value: 42 } };

    let receivedContext;
    parser.onAttributeDirective((el, directives, context) => {
        receivedContext = context;
    });

    parser.processElement(element, state);

    t.truthy(receivedContext);
    t.is(typeof receivedContext.get, 'function');
});

test('integration: callback receives correct directive details', t => {
    const parser = new DirectiveParser();
    const element = createElement('div', {
        'data-a-title': 'myTitle',
        'data-a-href': 'myUrl',
    });
    const state = {};

    /** @type {Map<string, DirectiveValue>} */
    let receivedDirectives;
    parser.onAttributeDirective((el, directives) => {
        receivedDirectives = directives;
    });

    parser.processElement(element, state);

    t.truthy(receivedDirectives);
    t.is(receivedDirectives.size, 2);
    t.true(receivedDirectives.has('title'));
    t.true(receivedDirectives.has('href'));
});
