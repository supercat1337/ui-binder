// @ts-check

import test from 'ava';
import { Window } from 'happy-dom';

import { isValidPropertyName, isValidForTwoWayBinding } from './validators.js';

const document = new Window({ console }).document;

// ============================================================================
// isValidPropertyName Tests
// ============================================================================

test('isValidPropertyName: simple property names', t => {
    t.true(isValidPropertyName('isActive'));
    t.true(isValidPropertyName('userName'));
    t.true(isValidPropertyName('_private'));
    t.true(isValidPropertyName('$special'));
    t.true(isValidPropertyName('prop123'));
});

test('isValidPropertyName: nested properties', t => {
    t.true(isValidPropertyName('user.name'));
    t.true(isValidPropertyName('form.user.email'));
    t.true(isValidPropertyName('data.items.0.title'));
    t.true(isValidPropertyName('obj.nested.deeply.prop'));
});

test('isValidPropertyName: properties with underscores and dollar signs', t => {
    t.true(isValidPropertyName('_privateField'));
    t.true(isValidPropertyName('$scope'));
    t.true(isValidPropertyName('__proto__'));
    t.true(isValidPropertyName('user_name'));
    t.true(isValidPropertyName('$_mixed'));
});

test('isValidPropertyName: hyphenated properties', t => {
    t.true(isValidPropertyName('data-value'));
    t.true(isValidPropertyName('my-prop'));
    t.true(isValidPropertyName('a-b-c'));
});

test('isValidPropertyName: invalid - expressions', t => {
    t.false(isValidPropertyName("size === 'lg'"));
    t.false(isValidPropertyName('!isHidden'));
    t.false(isValidPropertyName('isActive || isLoading'));
    t.false(isValidPropertyName('count + 1'));
    t.false(isValidPropertyName('name ? "yes" : "no"'));
});

test('isValidPropertyName: invalid - reserved words are allowed', t => {
    // Note: Reserved words are valid as property names (can access them with dot notation)
    t.true(isValidPropertyName('class'));
    t.true(isValidPropertyName('function'));
    t.true(isValidPropertyName('return'));
});

test('isValidPropertyName: invalid - double dots', t => {
    t.false(isValidPropertyName('prop..name'));
    t.false(isValidPropertyName('a..b'));
});

test('isValidPropertyName: invalid - leading/trailing dots', t => {
    t.false(isValidPropertyName('.prop'));
    t.false(isValidPropertyName('prop.'));
    t.false(isValidPropertyName('.prop.'));
});

test('isValidPropertyName: invalid - trailing hyphen', t => {
    t.false(isValidPropertyName('prop-'));
    t.false(isValidPropertyName('data-'));
});

test('isValidPropertyName: invalid - special characters', t => {
    t.false(isValidPropertyName('prop@name'));
    t.false(isValidPropertyName('prop#id'));
    t.false(isValidPropertyName('prop!active'));
    t.false(isValidPropertyName('prop&value'));
    t.false(isValidPropertyName('prop name'));
});

test('isValidPropertyName: invalid - empty string', t => {
    t.false(isValidPropertyName(''));
});

test('isValidPropertyName: invalid - starting with number', t => {
    t.false(isValidPropertyName('1prop'));
    t.false(isValidPropertyName('0item'));
});

test('isValidPropertyName: numeric indices in paths', t => {
    t.true(isValidPropertyName('items.0'));
    t.true(isValidPropertyName('array.123.value'));
});

// ============================================================================
// isValidForTwoWayBinding Tests
// ============================================================================

test('isValidForTwoWayBinding: TEXTAREA elements', t => {
    const textarea = /** @type {HTMLTextAreaElement} */ (
        /** @type {any} */ (document.createElement('textarea'))
    );
    t.true(isValidForTwoWayBinding(textarea));
});

test('isValidForTwoWayBinding: SELECT elements', t => {
    const select = /** @type {HTMLSelectElement} */ (
        /** @type {any} */ (document.createElement('select'))
    );
    t.true(isValidForTwoWayBinding(select));
});

test('isValidForTwoWayBinding: INPUT with text type', t => {
    const input = /** @type {HTMLInputElement} */ (
        /** @type {any} */ (document.createElement('input'))
    );
    input.type = 'text';
    t.true(isValidForTwoWayBinding(input));
});

test('isValidForTwoWayBinding: INPUT with supported types', t => {
    const supportedTypes = [
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

    supportedTypes.forEach(type => {
        const input = /** @type {HTMLInputElement} */ (
            /** @type {any} */ (document.createElement('input'))
        );
        input.type = type;
        t.true(isValidForTwoWayBinding(input), `INPUT type="${type}" should be valid`);
    });
});

test('isValidForTwoWayBinding: INPUT with unsupported types', t => {
    const unsupportedTypes = ['submit', 'reset', 'button', 'file', 'hidden', 'image'];

    unsupportedTypes.forEach(type => {
        const input = /** @type {HTMLInputElement} */ (
            /** @type {any} */ (document.createElement('input'))
        );
        input.type = type;
        t.false(isValidForTwoWayBinding(input), `INPUT type="${type}" should be invalid`);
    });
});

test('isValidForTwoWayBinding: contenteditable elements', t => {
    const div = /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div')));
    div.contentEditable = 'true';
    t.true(isValidForTwoWayBinding(div));
});

test('isValidForTwoWayBinding: elements with textbox role', t => {
    const div = /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div')));
    div.setAttribute('role', 'textbox');
    t.true(isValidForTwoWayBinding(div));
});

test('isValidForTwoWayBinding: unsupported elements', t => {
    const span = /** @type {HTMLSpanElement} */ (
        /** @type {any} */ (document.createElement('span'))
    );
    t.false(isValidForTwoWayBinding(span));
});

test('isValidForTwoWayBinding: div without contenteditable', t => {
    const div = /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div')));
    t.false(isValidForTwoWayBinding(div));
});

test('isValidForTwoWayBinding: INPUT without type attribute', t => {
    const input = /** @type {HTMLInputElement} */ (
        /** @type {any} */ (document.createElement('input'))
    );
    // Default type is 'text'
    t.true(isValidForTwoWayBinding(input));
});

test('isValidForTwoWayBinding: elements with other roles', t => {
    const div = /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div')));
    div.setAttribute('role', 'button');
    t.false(isValidForTwoWayBinding(div));
});

test('isValidForTwoWayBinding: contenteditable false', t => {
    const div = /** @type {HTMLDivElement} */ (/** @type {any} */ (document.createElement('div')));
    div.contentEditable = 'false';
    t.false(isValidForTwoWayBinding(div));
});

test('isValidForTwoWayBinding: edge case - button INPUT', t => {
    const input = /** @type {HTMLInputElement} */ (
        /** @type {any} */ (document.createElement('input'))
    );
    input.type = 'button';
    t.false(isValidForTwoWayBinding(input));
});

test('isValidForTwoWayBinding: edge case - submit INPUT', t => {
    const input = /** @type {HTMLInputElement} */ (
        /** @type {any} */ (document.createElement('input'))
    );
    input.type = 'submit';
    t.false(isValidForTwoWayBinding(input));
});
