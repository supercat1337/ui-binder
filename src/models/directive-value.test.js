// @ts-check

import test from 'ava';
import { DirectiveValue } from './directive-value.js';

// Return type tests
test('DirectiveValue: constructor returns DirectiveValue instance', t => {
    const dv = new DirectiveValue();
    t.true(dv instanceof DirectiveValue);
});

test('DirectiveValue: constructor initializes properties with empty strings', t => {
    const dv = new DirectiveValue();
    t.is(dv.target, '');
    t.is(dv.domProperty, '');
    t.is(dv.event, '');
});

test('DirectiveValue: constructor initializes eventModifiers as Map', t => {
    const dv = new DirectiveValue();
    t.true(dv.eventModifiers instanceof Map);
    t.is(dv.eventModifiers.size, 0);
});

// Property assignment tests
test('DirectiveValue: target property can be set', t => {
    const dv = new DirectiveValue();
    dv.target = 'myTarget';
    t.is(dv.target, 'myTarget');
});

test('DirectiveValue: domProperty property can be set', t => {
    const dv = new DirectiveValue();
    dv.domProperty = 'myProperty';
    t.is(dv.domProperty, 'myProperty');
});

test('DirectiveValue: event property can be set', t => {
    const dv = new DirectiveValue();
    dv.event = 'click';
    t.is(dv.event, 'click');
});

test('DirectiveValue: eventModifiers map can be used', t => {
    const dv = new DirectiveValue();
    dv.eventModifiers.set('stop', ['value1']);
    t.true(dv.eventModifiers.has('stop'));
    t.deepEqual(dv.eventModifiers.get('stop'), ['value1']);
});

// targetParts getter tests
test('DirectiveValue: targetParts returns array with empty string for empty target', t => {
    const dv = new DirectiveValue();
    const parts = dv.targetParts;
    t.true(Array.isArray(parts));
    t.deepEqual(parts, ['']);
});

test('DirectiveValue: targetParts returns single element for simple target', t => {
    const dv = new DirectiveValue();
    dv.target = 'user';
    const parts = dv.targetParts;
    t.deepEqual(parts, ['user']);
});

test('DirectiveValue: targetParts returns array for nested target path', t => {
    const dv = new DirectiveValue();
    dv.target = 'user.profile.name';
    const parts = dv.targetParts;
    t.deepEqual(parts, ['user', 'profile', 'name']);
});

test('DirectiveValue: targetParts handles dots in property names', t => {
    const dv = new DirectiveValue();
    dv.target = 'user..profile';
    const parts = dv.targetParts;
    // Double dots become single dot in property name
    t.deepEqual(parts, ['user.profile']);
});

test('DirectiveValue: targetParts with numeric indices (as strings)', t => {
    const dv = new DirectiveValue();
    dv.target = 'users.0.name';
    const parts = dv.targetParts;
    t.deepEqual(parts, ['users', '0', 'name']);
});

test('DirectiveValue: targetParts with complex path', t => {
    const dv = new DirectiveValue();
    dv.target = 'app.user.0.profile.name';
    const parts = dv.targetParts;
    t.deepEqual(parts, ['app', 'user', '0', 'profile', 'name']);
});

// domPropertyParts getter tests
test('DirectiveValue: domPropertyParts returns array with empty string for empty domProperty', t => {
    const dv = new DirectiveValue();
    const parts = dv.domPropertyParts;
    t.true(Array.isArray(parts));
    t.deepEqual(parts, ['']);
});

test('DirectiveValue: domPropertyParts returns single element for simple property', t => {
    const dv = new DirectiveValue();
    dv.domProperty = 'value';
    const parts = dv.domPropertyParts;
    t.deepEqual(parts, ['value']);
});

test('DirectiveValue: domPropertyParts returns array for nested property path', t => {
    const dv = new DirectiveValue();
    dv.domProperty = 'style.color';
    const parts = dv.domPropertyParts;
    t.deepEqual(parts, ['style', 'color']);
});

test('DirectiveValue: domPropertyParts handles dots in names', t => {
    const dv = new DirectiveValue();
    dv.domProperty = 'data..custom';
    const parts = dv.domPropertyParts;
    t.deepEqual(parts, ['data.custom']);
});

test('DirectiveValue: domPropertyParts with numeric indices (as strings)', t => {
    const dv = new DirectiveValue();
    dv.domProperty = 'classList.0';
    const parts = dv.domPropertyParts;
    t.deepEqual(parts, ['classList', '0']);
});

// Integration tests
test('DirectiveValue: full initialization with all properties', t => {
    const dv = new DirectiveValue();
    dv.target = 'user.name';
    dv.domProperty = 'textContent';
    dv.event = 'input';
    dv.eventModifiers.set('debounce', ['500']);

    t.is(dv.target, 'user.name');
    t.is(dv.domProperty, 'textContent');
    t.is(dv.event, 'input');
    t.deepEqual(dv.targetParts, ['user', 'name']);
    t.deepEqual(dv.domPropertyParts, ['textContent']);
    t.true(dv.eventModifiers.has('debounce'));
});

test('DirectiveValue: multiple event modifiers', t => {
    const dv = new DirectiveValue();
    dv.eventModifiers.set('stop', ['propagation']);
    dv.eventModifiers.set('prevent', ['default']);
    dv.eventModifiers.set('once', []);

    t.is(dv.eventModifiers.size, 3);
    t.deepEqual(dv.eventModifiers.get('stop'), ['propagation']);
    t.deepEqual(dv.eventModifiers.get('prevent'), ['default']);
    t.deepEqual(dv.eventModifiers.get('once'), []);
});

test('DirectiveValue: targetParts getter is computed dynamically', t => {
    const dv = new DirectiveValue();
    dv.target = 'foo';
    t.deepEqual(dv.targetParts, ['foo']);

    // Change target and verify targetParts updates
    dv.target = 'foo.bar';
    t.deepEqual(dv.targetParts, ['foo', 'bar']);
});

test('DirectiveValue: domPropertyParts getter is computed dynamically', t => {
    const dv = new DirectiveValue();
    dv.domProperty = 'value';
    t.deepEqual(dv.domPropertyParts, ['value']);

    // Change domProperty and verify domPropertyParts updates
    dv.domProperty = 'style.backgroundColor';
    t.deepEqual(dv.domPropertyParts, ['style', 'backgroundColor']);
});

test('DirectiveValue: independent instances do not share state', t => {
    const dv1 = new DirectiveValue();
    const dv2 = new DirectiveValue();

    dv1.target = 'user';
    dv1.eventModifiers.set('stop', ['prop']);

    t.is(dv2.target, '');
    t.is(dv2.eventModifiers.size, 0);
    t.not(dv1.eventModifiers, dv2.eventModifiers);
});
