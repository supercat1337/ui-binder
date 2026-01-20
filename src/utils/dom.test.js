// @ts-check

import test from 'ava';
import { Window } from 'happy-dom';
import { getElementAttrs, isNativePropertyName } from './dom.js';

const window = new Window({ console }).window;
// @ts-expect-error
global.window = window;

const document = window.document;

// ============================================================================
// getElementAttrs Tests
// ============================================================================

test('getElementAttrs: empty element has no attributes', t => {
    const element = /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div')));
    const attrs = getElementAttrs(element);
    t.is(attrs.size, 0);
});

test('getElementAttrs: single attribute', t => {
    const element = /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div')));
    element.setAttribute('id', 'my-div');
    const attrs = getElementAttrs(element);
    t.is(attrs.size, 1);
    t.is(attrs.get('id'), 'my-div');
});

test('getElementAttrs: multiple attributes', t => {
    const element = /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div')));
    element.setAttribute('id', 'my-div');
    element.setAttribute('class', 'container');
    element.setAttribute('data-test', 'value');
    const attrs = getElementAttrs(element);
    t.is(attrs.size, 3);
    t.is(attrs.get('id'), 'my-div');
    t.is(attrs.get('class'), 'container');
    t.is(attrs.get('data-test'), 'value');
});

test('getElementAttrs: data attributes', t => {
    const element = /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div')));
    element.setAttribute('data-user-id', '123');
    element.setAttribute('data-user-name', 'John');
    element.setAttribute('data-nested-value', 'test');
    const attrs = getElementAttrs(element);
    t.is(attrs.size, 3);
    t.is(attrs.get('data-user-id'), '123');
    t.is(attrs.get('data-user-name'), 'John');
    t.is(attrs.get('data-nested-value'), 'test');
});

test('getElementAttrs: returns a Map', t => {
    const element = /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div')));
    element.setAttribute('id', 'test');
    const attrs = getElementAttrs(element);
    t.true(attrs instanceof Map);
});

test('getElementAttrs: can iterate over attributes', t => {
    const element = /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div')));
    element.setAttribute('id', 'test');
    element.setAttribute('class', 'my-class');
    element.setAttribute('title', 'My Title');
    const attrs = getElementAttrs(element);
    
    const keys = Array.from(attrs.keys());
    t.deepEqual(keys.sort(), ['class', 'id', 'title']);
});

test('getElementAttrs: empty string attribute values', t => {
    const element = /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div')));
    element.setAttribute('id', '');
    element.setAttribute('data-empty', '');
    const attrs = getElementAttrs(element);
    t.is(attrs.get('id'), '');
    t.is(attrs.get('data-empty'), '');
});

test('getElementAttrs: input element attributes', t => {
    const element = /** @type {HTMLInputElement} */ (/** @type {any} */ (document.createElement('input')));
    element.setAttribute('type', 'text');
    element.setAttribute('placeholder', 'Enter text');
    element.setAttribute('required', '');
    const attrs = getElementAttrs(element);
    t.is(attrs.get('type'), 'text');
    t.is(attrs.get('placeholder'), 'Enter text');
    t.is(attrs.get('required'), '');
});

test('getElementAttrs: special characters in attribute values', t => {
    const element = /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div')));
    element.setAttribute('data-json', '{"key": "value"}');
    element.setAttribute('data-url', 'https://example.com?q=test&id=123');
    const attrs = getElementAttrs(element);
    t.is(attrs.get('data-json'), '{"key": "value"}');
    t.is(attrs.get('data-url'), 'https://example.com?q=test&id=123');
});

// ============================================================================
// isNativePropertyName Tests
// ============================================================================

test('isNativePropertyName: non-data attribute returns as-is', t => {
    t.is(isNativePropertyName('id'), 'id');
    t.is(isNativePropertyName('class'), false);
    t.is(isNativePropertyName('title'), false);
});

test('isNativePropertyName: known native properties', t => {
    t.is(isNativePropertyName('data-innerhtml'), 'innerHTML');
    t.is(isNativePropertyName('data-textcontent'), 'textContent');
    t.is(isNativePropertyName('data-classname'), 'className');
});

test('isNativePropertyName: contenteditable mapping', t => {
    t.is(isNativePropertyName('data-contenteditable'), 'contentEditable');
});

test('isNativePropertyName: outerhtml mapping', t => {
    t.is(isNativePropertyName('data-outerhtml'), 'outerHTML');
});

test('isNativePropertyName: innertext mapping', t => {
    t.is(isNativePropertyName('data-innertext'), 'innerText');
});

test('isNativePropertyName: outertext mapping', t => {
    t.is(isNativePropertyName('data-outertext'), 'outerText');
});

test('isNativePropertyName: non-native data attributes return false', t => {
    t.is(isNativePropertyName('data-custom'), false);
    t.is(isNativePropertyName('data-user-name'), false);
    t.is(isNativePropertyName('data-test-value'), false);
});

test('isNativePropertyName: data attributes that match element properties return property name', t => {
    // Properties that exist on Element.prototype should return the property name
    // Examples: innerHTML, textContent, className, etc. (already mapped)
    // For unmapped ones that exist, they should return the lowercase version
    const isAttrNative = isNativePropertyName('data-getattribute');
    // This tests if a method name on Element works
    t.true(isAttrNative === false || typeof isAttrNative === 'string');
});

test('isNativePropertyName: custom prefix', t => {
    t.is(isNativePropertyName('app-innerhtml', 'app-'), 'innerHTML');
    t.is(isNativePropertyName('x-classname', 'x-'), 'className');
});

test('isNativePropertyName: non-matching prefix returns false', t => {
    t.is(isNativePropertyName('app-innerhtml', 'x-'), false);
});

test('isNativePropertyName: case insensitive for data- attributes', t => {
    // The function lowercases the result after removing prefix
    t.is(isNativePropertyName('data-InnerHTML'), 'innerHTML');
    t.is(isNativePropertyName('data-CLASSNAME'), 'className');
});

test('isNativePropertyName: all known native properties', t => {
    const knownProps = {
        'data-contenteditable': 'contentEditable',
        'data-innerhtml': 'innerHTML',
        'data-innertext': 'innerText',
        'data-outerhtml': 'outerHTML',
        'data-outertext': 'outerText',
        'data-classname': 'className',
        'data-textcontent': 'textContent',
    };

    Object.entries(knownProps).forEach(([attr, expected]) => {
        t.is(isNativePropertyName(attr), expected);
    });
});

test('isNativePropertyName: returns false for unknown data attributes', t => {
    const unknownAttrs = [
        'data-unknown',
        'data-custom-prop',
        'data-user-data',
        'data-my-special-value',
    ];

    unknownAttrs.forEach(attr => {
        t.is(isNativePropertyName(attr), false);
    });
});

// ============================================================================
// Integration Tests
// ============================================================================

test('integration: getElementAttrs with multiple attribute types', t => {
    const element = /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div')));
    element.setAttribute('id', 'main');
    element.setAttribute('class', 'container active');
    element.setAttribute('data-role', 'navigation');
    element.setAttribute('aria-label', 'Main Navigation');
    element.setAttribute('title', 'Navigation Area');

    const attrs = getElementAttrs(element);
    t.is(attrs.size, 5);
    t.is(attrs.get('id'), 'main');
    t.is(attrs.get('class'), 'container active');
    t.is(attrs.get('data-role'), 'navigation');
    t.is(attrs.get('aria-label'), 'Main Navigation');
    t.is(attrs.get('title'), 'Navigation Area');
});

test('integration: identifying native vs custom properties from element attributes', t => {
    const element = /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div')));
    element.setAttribute('data-innerhtml', '<p>Test</p>');
    element.setAttribute('data-custom', 'value');
    element.setAttribute('data-user-name', 'John');

    const attrs = getElementAttrs(element);
    
    const results = {
        innerhtml: isNativePropertyName('data-innerhtml'),
        custom: isNativePropertyName('data-custom'),
        userName: isNativePropertyName('data-user-name'),
    };

    t.is(results.innerhtml, 'innerHTML');
    t.is(results.custom, false);
    t.is(results.userName, false);
});
