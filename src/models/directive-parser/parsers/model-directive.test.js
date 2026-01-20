import test from 'ava';
import { parseModelDirective } from './model-directive.js';

// ============================================================================
// Return Type Tests
// ============================================================================

test('parseModelDirective: returns DirectiveValue instance', t => {
    const result = parseModelDirective('value');

    t.truthy(result);
    t.is(typeof result, 'object');
    t.true(result.eventModifiers instanceof Map);
});

test('parseModelDirective: empty string returns DirectiveValue', t => {
    const result = parseModelDirective('');

    t.is(result.target, '');
    t.is(result.domProperty, '');
    t.is(result.event, '');
    t.is(result.eventModifiers.size, 0);
});

// ============================================================================
// Target Parsing Tests
// ============================================================================

test('parseModelDirective: simple target', t => {
    const result = parseModelDirective('myProperty');

    t.is(result.target, 'myProperty');
    t.is(result.domProperty, '');
    t.is(result.event, '');
});

test('parseModelDirective: nested target', t => {
    const result = parseModelDirective('user.name');

    t.is(result.target, 'user.name');
    t.true(Array.isArray(result.targetParts));
    t.deepEqual(result.targetParts, ['user', 'name']);
});

test('parseModelDirective: deeply nested target', t => {
    const result = parseModelDirective('form.user.address.street');

    t.is(result.target, 'form.user.address.street');
    t.deepEqual(result.targetParts, ['form', 'user', 'address', 'street']);
});

test('parseModelDirective: target with special characters', t => {
    const result = parseModelDirective('_myProperty');

    t.is(result.target, '_myProperty');
});

test('parseModelDirective: target with dollar sign', t => {
    const result = parseModelDirective('$store');

    t.is(result.target, '$store');
});

// ============================================================================
// DOM Property Parsing Tests
// ============================================================================

test('parseModelDirective: target with dom property', t => {
    const result = parseModelDirective('myValue:value');

    t.is(result.target, 'myValue');
    t.is(result.domProperty, 'value');
});

test('parseModelDirective: target with nested dom property', t => {
    const result = parseModelDirective('formData:style.color');

    t.is(result.target, 'formData');
    t.is(result.domProperty, 'style.color');
});

test('parseModelDirective: target with complex dom property', t => {
    const result = parseModelDirective('state:dataset.userId');

    t.is(result.target, 'state');
    t.is(result.domProperty, 'dataset.userId');
});

test('parseModelDirective: dom property with hyphens', t => {
    const result = parseModelDirective('value:aria-label');

    t.is(result.target, 'value');
    t.is(result.domProperty, 'aria-label');
});

test('parseModelDirective: only first colon separates target and dom property', t => {
    const result = parseModelDirective('target:prop:value');

    t.is(result.target, 'target');
    t.is(result.domProperty, 'prop:value');
});

// ============================================================================
// Event Modifier Parsing Tests
// ============================================================================

test('parseModelDirective: single modifier', t => {
    const result = parseModelDirective('myValue#debounce');

    t.is(result.target, 'myValue');
    t.is(result.eventModifiers.size, 1);
    t.true(result.eventModifiers.has('debounce'));
});

test('parseModelDirective: multiple modifiers', t => {
    const result = parseModelDirective('myValue#debounce(300)#trim');

    t.is(result.eventModifiers.size, 2);
    t.true(result.eventModifiers.has('debounce'));
    t.true(result.eventModifiers.has('trim'));
});

test('parseModelDirective: modifier with arguments', t => {
    const result = parseModelDirective('myValue#debounce(500)');

    const debounceArgs = result.eventModifiers.get('debounce');
    t.deepEqual(debounceArgs, [500]);
});

test('parseModelDirective: modifier with multiple arguments', t => {
    const result = parseModelDirective('myValue#range(1,100)');

    const rangeArgs = result.eventModifiers.get('range');
    t.deepEqual(rangeArgs, [1, 100]);
});

test('parseModelDirective: modifier with string arguments', t => {
    const result = parseModelDirective('myValue#format("currency")');

    const formatArgs = result.eventModifiers.get('format');
    t.true(Array.isArray(formatArgs));
    t.is(formatArgs.length, 1);
});

// ============================================================================
// Event Parsing Tests
// ============================================================================

test('parseModelDirective: event parsing', t => {
    const result = parseModelDirective('myValue@input');

    t.is(result.target, 'myValue');
    t.is(result.event, 'input');
});

test('parseModelDirective: custom event', t => {
    const result = parseModelDirective('myValue@customEvent');

    t.is(result.event, 'customEvent');
});

test('parseModelDirective: event with hyphens', t => {
    const result = parseModelDirective('myValue@value-changed');

    t.is(result.event, 'value-changed');
});

test('parseModelDirective: last @ is used for event', t => {
    const result = parseModelDirective('myValue@old@input');

    // Last @ separates the event
    t.is(result.event, 'input');
    t.is(result.target, 'myValue@old');
});

// ============================================================================
// Complex Combinations Tests
// ============================================================================

test('parseModelDirective: target with dom property and event', t => {
    const result = parseModelDirective('myValue:style@input');

    t.is(result.target, 'myValue');
    t.is(result.domProperty, 'style');
    t.is(result.event, 'input');
});

test('parseModelDirective: target with dom property and modifier', t => {
    const result = parseModelDirective('myValue:style#debounce(300)');

    t.is(result.target, 'myValue');
    t.is(result.domProperty, 'style');
    t.is(result.eventModifiers.size, 1);
});

test('parseModelDirective: complete directive with all parts', t => {
    const result = parseModelDirective('formData:value#debounce(300)#trim@change');

    t.is(result.target, 'formData');
    t.is(result.domProperty, 'value');
    t.is(result.event, 'change');
    t.is(result.eventModifiers.size, 2);
    t.true(result.eventModifiers.has('debounce'));
    t.true(result.eventModifiers.has('trim'));
});

test('parseModelDirective: nested target with modifiers and event', t => {
    const result = parseModelDirective('user.profile.name#uppercase@blur');

    t.is(result.target, 'user.profile.name');
    t.is(result.event, 'blur');
    t.deepEqual(result.targetParts, ['user', 'profile', 'name']);
});

test('parseModelDirective: complex nested dom property', t => {
    const result = parseModelDirective('state:data.attrs.custom#transform@change');

    t.is(result.target, 'state');
    t.is(result.domProperty, 'data.attrs.custom');
    t.is(result.event, 'change');
});

// ============================================================================
// Edge Cases Tests
// ============================================================================

test('parseModelDirective: whitespace in target', t => {
    const result = parseModelDirective('  myValue  ');

    // No trimming is done by the parser
    t.is(result.target, '  myValue  ');
});

test('parseModelDirective: empty parts', t => {
    const result = parseModelDirective(':domProperty');

    t.is(result.target, '');
    t.is(result.domProperty, 'domProperty');
});

test('parseModelDirective: only event', t => {
    const result = parseModelDirective('@input');

    t.is(result.target, '');
    t.is(result.event, 'input');
});

test('parseModelDirective: only modifiers', t => {
    const result = parseModelDirective('#debounce(300)');

    t.is(result.target, '');
    t.is(result.eventModifiers.size, 1);
});

test('parseModelDirective: single character target', t => {
    const result = parseModelDirective('x');

    t.is(result.target, 'x');
});

test('parseModelDirective: very long target', t => {
    const longTarget = 'very.long.nested.property.structure.with.many.levels';
    const result = parseModelDirective(longTarget);

    t.is(result.target, longTarget);
    t.true(result.targetParts.length > 5);
});

test('parseModelDirective: numeric target parts', t => {
    const result = parseModelDirective('data.0.value');

    t.is(result.target, 'data.0.value');
    t.deepEqual(result.targetParts, ['data', '0', 'value']);
});

// ============================================================================
// Integration Tests
// ============================================================================

test('integration: form input with full directive', t => {
    const result = parseModelDirective('form.email:value#email#debounce(400)@input');

    t.is(result.target, 'form.email');
    t.is(result.domProperty, 'value');
    t.is(result.event, 'input');
    t.is(result.eventModifiers.size, 2);
    t.deepEqual(result.targetParts, ['form', 'email']);
});

test('integration: select element with model directive', t => {
    const result = parseModelDirective('selectedOption:value@change');

    t.is(result.target, 'selectedOption');
    t.is(result.domProperty, 'value');
    t.is(result.event, 'change');
});

test('integration: custom input component', t => {
    const result = parseModelDirective('store.user.firstName#capitalize#trim@update');

    t.is(result.target, 'store.user.firstName');
    t.is(result.eventModifiers.size, 2);
    t.is(result.event, 'update');
    t.deepEqual(result.targetParts, ['store', 'user', 'firstName']);
});

test('integration: textarea with multiple modifiers', t => {
    const result = parseModelDirective('message:innerHTML#strip#limit(500)#debounce(300)@input');

    t.is(result.target, 'message');
    t.is(result.domProperty, 'innerHTML');
    t.is(result.eventModifiers.size, 3);
    t.is(result.event, 'input');
});

test('integration: targetParts creation from complex nested target', t => {
    const result = parseModelDirective('app.modules.settings.theme.darkMode:checked@toggle');

    t.is(result.target, 'app.modules.settings.theme.darkMode');
    t.is(result.domProperty, 'checked');
    t.is(result.event, 'toggle');
    t.deepEqual(result.targetParts, ['app', 'modules', 'settings', 'theme', 'darkMode']);
});

test('integration: directive with all modifier types', t => {
    const result = parseModelDirective('data#mod1(arg1,arg2)#mod2#mod3(value)@customEvent');

    t.is(result.target, 'data');
    t.is(result.event, 'customEvent');
    t.is(result.eventModifiers.size, 3);
});
