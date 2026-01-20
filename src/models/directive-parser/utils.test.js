// @ts-check

import test from 'ava';
import { parseModifiersString, parseDirectiveValue, parseDirectives } from './utils.js';
import { DirectiveValue } from '../directive-value.js';
import { ParsedDirectives } from '../parsed-directives.js';
import { Window } from 'happy-dom';

const window = new Window({ console }).window;
// @ts-expect-error
global.window = window;

const document = window.document;

// ============================================================================
// parseModifiersString Tests
// ============================================================================

test('parseModifiersString: single modifier without arguments', t => {
    const result = parseModifiersString('debounce');
    t.is(result.length, 1);
    t.is(result[0][0], 'debounce');
    t.deepEqual(result[0][1], []);
});

test('parseModifiersString: single modifier with single argument', t => {
    const result = parseModifiersString('debounce(300)');
    t.is(result.length, 1);
    t.is(result[0][0], 'debounce');
    t.deepEqual(result[0][1], [300]);
});

test('parseModifiersString: single modifier with multiple arguments', t => {
    const result = parseModifiersString('debounce(300,100)');
    t.is(result.length, 1);
    t.is(result[0][0], 'debounce');
    t.deepEqual(result[0][1], [300, 100]);
});

test('parseModifiersString: modifier with string arguments', t => {
    const result = parseModifiersString('validate("email","required")');
    t.is(result.length, 1);
    t.is(result[0][0], 'validate');
    t.deepEqual(result[0][1], ['email', 'required']);
});

test('parseModifiersString: modifier with mixed argument types', t => {
    const result = parseModifiersString('custom(100,"text",true,false)');
    t.is(result.length, 1);
    t.is(result[0][0], 'custom');
    t.deepEqual(result[0][1], [100, 'text', true, false]);
});

test('parseModifiersString: multiple modifiers', t => {
    const result = parseModifiersString('debounce(300)#throttle(100)#preventDefault');
    t.is(result.length, 3);
    t.is(result[0][0], 'debounce');
    t.deepEqual(result[0][1], [300]);
    t.is(result[1][0], 'throttle');
    t.deepEqual(result[1][1], [100]);
    t.is(result[2][0], 'preventDefault');
    t.deepEqual(result[2][1], []);
});

test('parseModifiersString: modifier with single quotes', t => {
    const result = parseModifiersString("validate('email')");
    t.is(result.length, 1);
    t.deepEqual(result[0][1], ['email']);
});

test('parseModifiersString: modifier with double quotes', t => {
    const result = parseModifiersString('validate("email")');
    t.is(result.length, 1);
    t.deepEqual(result[0][1], ['email']);
});

test('parseModifiersString: boolean true value', t => {
    const result = parseModifiersString('flag(true)');
    t.deepEqual(result[0][1], [true]);
});

test('parseModifiersString: boolean false value', t => {
    const result = parseModifiersString('flag(false)');
    t.deepEqual(result[0][1], [false]);
});

test('parseModifiersString: boolean case insensitive', t => {
    const result = parseModifiersString('flag(True,FALSE)');
    t.deepEqual(result[0][1], [true, false]);
});

test('parseModifiersString: numeric arguments', t => {
    const result = parseModifiersString('numeric(123,456.789,-100)');
    t.deepEqual(result[0][1], [123, 456.789, -100]);
});

test('parseModifiersString: modifier with whitespace in arguments', t => {
    const result = parseModifiersString('debounce( 300 , 100 )');
    t.deepEqual(result[0][1], [300, 100]);
});

test('parseModifiersString: empty modifier string returns empty array', t => {
    const result = parseModifiersString('');
    t.deepEqual(result, []);
});

test('parseModifiersString: hyphenated modifier names', t => {
    const result = parseModifiersString('stop-propagation#prevent-default');
    t.is(result.length, 2);
    t.is(result[0][0], 'stop-propagation');
    t.is(result[1][0], 'prevent-default');
});

test('parseModifiersString: underscored modifier names', t => {
    const result = parseModifiersString('my_modifier(100)#another_one');
    t.is(result.length, 2);
    t.is(result[0][0], 'my_modifier');
    t.is(result[1][0], 'another_one');
});

// ============================================================================
// parseDirectiveValue Tests
// ============================================================================

test('parseDirectiveValue: simple target', t => {
    const result = parseDirectiveValue('name');
    t.is(result.target, 'name');
    t.deepEqual(result.targetParts, ['name']);
    t.is(result.eventModifiers.size, 0);
});

test('parseDirectiveValue: nested target', t => {
    const result = parseDirectiveValue('user.name');
    t.is(result.target, 'user.name');
    t.deepEqual(result.targetParts, ['user', 'name']);
});

test('parseDirectiveValue: deeply nested target', t => {
    const result = parseDirectiveValue('company.employees.manager.name');
    t.is(result.target, 'company.employees.manager.name');
    t.deepEqual(result.targetParts, ['company', 'employees', 'manager', 'name']);
});

test('parseDirectiveValue: target with modifiers', t => {
    const result = parseDirectiveValue('handleClick#debounce(300)');
    t.is(result.target, 'handleClick');
    t.is(result.eventModifiers.size, 1);
    t.deepEqual(result.eventModifiers.get('debounce'), [300]);
});

test('parseDirectiveValue: target with multiple modifiers', t => {
    const result = parseDirectiveValue('handleClick#debounce(300)#preventDefault');
    t.is(result.target, 'handleClick');
    t.is(result.eventModifiers.size, 2);
    t.deepEqual(result.eventModifiers.get('debounce'), [300]);
    t.deepEqual(result.eventModifiers.get('preventDefault'), []);
});

test('parseDirectiveValue: target with hyphen', t => {
    const result = parseDirectiveValue('my-property');
    t.is(result.target, 'my-property');
});

test('parseDirectiveValue: target with underscore and dollar sign', t => {
    const result = parseDirectiveValue('$_private');
    t.is(result.target, '$_private');
});

test('parseDirectiveValue: empty string target', t => {
    const result = parseDirectiveValue('');
    t.is(result.target, '');
    t.deepEqual(result.targetParts, ['']);
});

test('parseDirectiveValue: whitespace trimming', t => {
    const result = parseDirectiveValue('  name  ');
    t.is(result.target, 'name');
    t.deepEqual(result.targetParts, ['name']);
});

test('parseDirectiveValue: returns DirectiveValue instance', t => {
    const result = parseDirectiveValue('test');
    t.true(result instanceof DirectiveValue);
});

test('parseDirectiveValue: event modifiers is Map', t => {
    const result = parseDirectiveValue('test#mod1#mod2');
    t.true(result.eventModifiers instanceof Map);
});

test('parseDirectiveValue: numeric target parts', t => {
    const result = parseDirectiveValue('items.0.name');
    t.is(result.target, 'items.0.name');
    t.deepEqual(result.targetParts, ['items', '0', 'name']);
});

test('parseDirectiveValue: camelCase target', t => {
    const result = parseDirectiveValue('firstName');
    t.is(result.target, 'firstName');
    t.deepEqual(result.targetParts, ['firstName']);
});

// ============================================================================
// parseDirectives Tests
// ============================================================================

test('parseDirectives: no directives returns empty ParsedDirectives', t => {
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const result = parseDirectives(element);

    t.true(result instanceof ParsedDirectives);
    t.is(result.attributeDirectives.size, 0);
    t.is(result.propertyDirectives.size, 0);
    t.is(result.behaviorDirectives.size, 0);
    t.is(result.modelDirective, null);
    t.is(result.classDirective, null);
});

test('parseDirectives: parses attribute directives', t => {
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    element.setAttribute('data-a-title', 'pageTitle');
    element.setAttribute('data-a-class', 'className');

    const result = parseDirectives(element);

    t.is(result.attributeDirectives.size, 2);
    t.true(result.attributeDirectives.has('title'));
    t.true(result.attributeDirectives.has('class'));
});

test('parseDirectives: parses property directives', t => {
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    element.setAttribute('data-p-textContent', 'content');
    element.setAttribute('data-p-innerHTML', 'html');

    const result = parseDirectives(element);

    t.is(result.propertyDirectives.size, 2);
});

test('parseDirectives: parses behavior directives', t => {
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    element.setAttribute('data-b-click', 'handleClick');
    element.setAttribute('data-b-submit', 'handleSubmit');

    const result = parseDirectives(element);

    t.is(result.behaviorDirectives.size, 2);
    t.true(result.behaviorDirectives.has('click'));
    t.true(result.behaviorDirectives.has('submit'));
});

test('parseDirectives: parses model directive', t => {
    const element = /** @type {HTMLInputElement} */ (
        /** @type {any} */ (document.createElement('input'))
    );
    element.setAttribute('data-m', 'formData.email');

    const result = parseDirectives(element);

    t.truthy(result.modelDirective);
    if (result.modelDirective === null) return;

    t.is(result.modelDirective.target, 'formData.email');
});

test('parseDirectives: model directive on unsupported element shows warning', t => {
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    element.setAttribute('data-m', 'someValue');

    const result = parseDirectives(element);

    t.is(result.modelDirective, null);
});

test('parseDirectives: parses class directives', t => {
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    element.setAttribute('data-c-active', 'isActive');
    element.setAttribute('data-c-disabled', 'isDisabled');

    const result = parseDirectives(element);

    t.truthy(result.classDirective);
});

test('parseDirectives: multiple directives on same element', t => {
    const element = /** @type {HTMLInputElement} */ (
        /** @type {any} */ (document.createElement('input'))
    );
    element.setAttribute('data-a-placeholder', 'placeholderText');
    element.setAttribute('data-p-value', 'inputValue');
    element.setAttribute('data-b-change', 'handleChange');
    element.setAttribute('data-m', 'formData.email');
    element.setAttribute('data-c-error', 'hasError');

    const result = parseDirectives(element);

    t.is(result.attributeDirectives.size, 1);
    t.is(result.propertyDirectives.size, 1);
    t.is(result.behaviorDirectives.size, 1);
    t.truthy(result.modelDirective);
    t.truthy(result.classDirective);
});

test('parseDirectives: accepts custom attributes Map', t => {
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    const customAttrs = new Map([
        ['data-a-test', 'value'],
        ['data-p-innerHTML', 'content'],
    ]);

    const result = parseDirectives(element, customAttrs);

    t.is(result.attributeDirectives.size, 1);
    t.is(result.propertyDirectives.size, 1);
});

test('parseDirectives: handles native property names', t => {
    const element = /** @type {HTMLDivElement} */ (
        /** @type {any} */ (document.createElement('div'))
    );
    element.setAttribute('data-p-innerhtml', '<p>Content</p>');
    element.setAttribute('data-p-textcontent', 'Text');
    element.setAttribute('data-p-classname', 'myClass');

    const result = parseDirectives(element);

    // Should map to native properties
    t.is(result.propertyDirectives.size, 3);
});

test('parseDirectives: textarea element supports model directive', t => {
    const element = /** @type {HTMLTextAreaElement} */ (
        /** @type {any} */ (document.createElement('textarea'))
    );
    element.setAttribute('data-m', 'message');

    const result = parseDirectives(element);

    t.truthy(result.modelDirective);
    if (result.modelDirective === null) return;
    t.is(result.modelDirective.target, 'message');
});

test('parseDirectives: select element supports model directive', t => {
    const element = /** @type {HTMLSelectElement} */ (
        /** @type {any} */ (document.createElement('select'))
    );
    element.setAttribute('data-m', 'selectedOption');

    const result = parseDirectives(element);

    t.truthy(result.modelDirective);
    if (result.modelDirective === null) return;

    t.is(result.modelDirective.target, 'selectedOption');
});

test('parseDirectives: checkbox input supports model directive', t => {
    const element = /** @type {HTMLInputElement} */ (
        /** @type {any} */ (document.createElement('input'))
    );
    element.type = 'checkbox';
    element.setAttribute('data-m', 'isChecked');

    const result = parseDirectives(element);

    t.truthy(result.modelDirective);
});

test('parseDirectives: radio input supports model directive', t => {
    const element = /** @type {HTMLInputElement} */ (
        /** @type {any} */ (document.createElement('input'))
    );
    element.type = 'radio';
    element.setAttribute('data-m', 'selectedRadio');

    const result = parseDirectives(element);

    t.truthy(result.modelDirective);
});

// ============================================================================
// Integration Tests
// ============================================================================

test('integration: complex directive parsing', t => {
    const element = /** @type {HTMLInputElement} */ (
        /** @type {any} */ (document.createElement('input'))
    );
    element.type = 'text';
    element.setAttribute('data-a-placeholder', 'placeholderText');
    element.setAttribute('data-p-value', 'currentValue');
    element.setAttribute('data-b-input', 'handleInput#debounce(500)');
    element.setAttribute('data-b-blur', 'handleBlur#preventDefault');
    element.setAttribute('data-m', 'formData.email');
    element.setAttribute('data-c-invalid', 'hasValidationError');

    const result = parseDirectives(element);

    // Verify all directive types are parsed
    t.is(result.attributeDirectives.size, 1);
    t.is(result.propertyDirectives.size, 1);
    t.is(result.behaviorDirectives.size, 2);
    t.truthy(result.modelDirective);
    t.truthy(result.classDirective);
});

test('integration: parseDirectiveValue with modifiers', t => {
    const value = 'handleSubmit#debounce(300)#preventDefault#stopPropagation';
    const directive = parseDirectiveValue(value);

    t.is(directive.target, 'handleSubmit');
    t.is(directive.eventModifiers.size, 3);
    t.deepEqual(directive.eventModifiers.get('debounce'), [300]);
    t.deepEqual(directive.eventModifiers.get('preventDefault'), []);
    t.deepEqual(directive.eventModifiers.get('stopPropagation'), []);
});

test('integration: nested property with multiple directives', t => {
    const element = /** @type {HTMLInputElement} */ (
        /** @type {any} */ (document.createElement('input'))
    );
    element.setAttribute('data-m', 'user.profile.email');
    element.setAttribute('data-p-title', 'user.profile.emailLabel');
    element.setAttribute('data-a-aria-label', 'user.profile.emailDescription');

    const result = parseDirectives(element);

    if (result.modelDirective === null) return;

    t.is(result.modelDirective.target, 'user.profile.email');
    t.deepEqual(result.modelDirective.targetParts, ['user', 'profile', 'email']);
});

test('integration: directive with complex modifier arguments', t => {
    const value = 'validate#custom("email","required","minLength(8)")';
    const directive = parseDirectiveValue(value);

    let custom = directive.eventModifiers.get('custom');

    t.truthy(custom);

    if (!custom) return;
    t.is(custom[0], 'email');
    t.is(custom[1], 'required');
});
