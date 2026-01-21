// @ts-check

import test from 'ava';
import { Window } from 'happy-dom';

import {
    getNestedProperty,
    getPropertyValue,
    setPropertyValue,
    attributeNameToPropertyName,
    propertyNameToAttributeName,
    propertyNameToPath,
    pathToPropertyName,
} from './properties.js';

const window = new Window({ console }).window;
// @ts-expect-error
global.window = window;


// ============================================================================
// getNestedProperty Tests
// ============================================================================

test('getNestedProperty: single level property', t => {
    const obj = { name: 'John', age: 30 };
    t.is(getNestedProperty(obj, ['name']), 'John');
    t.is(getNestedProperty(obj, ['age']), 30);
});

test('getNestedProperty: nested properties', t => {
    const obj = { user: { name: 'John', email: 'john@example.com' } };
    t.is(getNestedProperty(obj, ['user', 'name']), 'John');
    t.is(getNestedProperty(obj, ['user', 'email']), 'john@example.com');
});

test('getNestedProperty: deeply nested properties', t => {
    const obj = {
        company: {
            employees: {
                manager: { name: 'Alice', salary: 100000 },
            },
        },
    };
    t.is(getNestedProperty(obj, ['company', 'employees', 'manager', 'name']), 'Alice');
    t.is(getNestedProperty(obj, ['company', 'employees', 'manager', 'salary']), 100000);
});

test('getNestedProperty: missing property returns undefined', t => {
    const obj = { user: { name: 'John' } };
    t.is(getNestedProperty(obj, ['user', 'email']), undefined);
    t.is(getNestedProperty(obj, ['notexist', 'name']), undefined);
});

test('getNestedProperty: empty path returns object', t => {
    const obj = { name: 'John' };
    t.is(getNestedProperty(obj, []), obj);
});

test('getNestedProperty: null/undefined in chain returns undefined', t => {
    const obj = { user: null };
    t.is(getNestedProperty(obj, ['user', 'name']), undefined);
});

test('getNestedProperty: array values', t => {
    const obj = { items: ['a', 'b', 'c'] };
    t.is(getNestedProperty(obj, ['items', '0']), 'a');
    t.is(getNestedProperty(obj, ['items', '1']), 'b');
});

// ============================================================================
// getPropertyValue Tests
// ============================================================================

test('getPropertyValue: single level property', t => {
    const obj = { name: 'John', age: 30 };
    t.is(getPropertyValue(obj, ['name']), 'John');
    t.is(getPropertyValue(obj, ['age']), 30);
});

test('getPropertyValue: nested properties', t => {
    const obj = { user: { name: 'John', email: 'john@example.com' } };
    t.is(getPropertyValue(obj, ['user', 'name']), 'John');
    t.is(getPropertyValue(obj, ['user', 'email']), 'john@example.com');
});

test('getPropertyValue: missing property returns undefined', t => {
    const obj = { user: { name: 'John' } };
    t.is(getPropertyValue(obj, ['user', 'email']), undefined);
});

test('getPropertyValue: null stops traversal', t => {
    const obj = { user: null };
    t.is(getPropertyValue(obj, ['user', 'name']), null);
});

test('getPropertyValue: object with falsy values', t => {
    const obj = { count: 0, active: false, name: '' };
    t.is(getPropertyValue(obj, ['count']), 0);
    t.is(getPropertyValue(obj, ['active']), false);
    t.is(getPropertyValue(obj, ['name']), '');
});

// ============================================================================
// setPropertyValue Tests
// ============================================================================

test('setPropertyValue: set single level property', t => {
    const obj = { name: 'John', age: 30 };
    setPropertyValue(obj, ['name'], 'Jane');
    t.is(obj.name, 'Jane');
});

test('setPropertyValue: set nested property', t => {
    const obj = { user: { name: 'John', email: 'john@example.com' } };
    setPropertyValue(obj, ['user', 'name'], 'Jane');
    t.is(obj.user.name, 'Jane');
});

test('setPropertyValue: set deeply nested property', t => {
    const obj = {
        company: {
            employees: {
                manager: { name: 'Alice', salary: 100000 },
            },
        },
    };
    setPropertyValue(obj, ['company', 'employees', 'manager', 'name'], 'Bob');
    t.is(obj.company.employees.manager.name, 'Bob');
});

test('setPropertyValue: set property to null', t => {
    const obj = { user: { name: 'John' } };
    setPropertyValue(obj, ['user', 'name'], null);

    // @ts-expect-error
    t.is(obj.user.name, null);
});

test('setPropertyValue: set property to undefined', t => {
    const obj = { user: { name: 'John' } };
    setPropertyValue(obj, ['user', 'name'], undefined);

    // @ts-expect-error
    t.is(obj.user.name, undefined);
});

test('setPropertyValue: set property to number', t => {
    const obj = { count: 0 };
    setPropertyValue(obj, ['count'], 42);
    t.is(obj.count, 42);
});

test('setPropertyValue: set property to boolean', t => {
    const obj = { active: false };
    setPropertyValue(obj, ['active'], true);
    t.is(obj.active, true);
});

test('setPropertyValue: set property to object', t => {
    const obj = { user: {} };
    const newUser = { name: 'Jane', age: 25 };
    setPropertyValue(obj, ['user'], newUser);
    t.deepEqual(obj.user, newUser);
});

test('setPropertyValue: set property to array', t => {
    const obj = { items: [] };
    const newItems = ['a', 'b', 'c'];
    setPropertyValue(obj, ['items'], newItems);
    t.deepEqual(obj.items, newItems);
});

test('setPropertyValue: set new property on object', t => {
    const obj = { name: 'John' };
    setPropertyValue(obj, ['age'], 30);

    // @ts-expect-error
    t.is(obj.age, 30);
});

test('setPropertyValue: set array element', t => {
    const obj = { items: ['a', 'b', 'c'] };
    setPropertyValue(obj, ['items', '1'], 'x');
    t.is(obj.items[1], 'x');
});

test('setPropertyValue: set empty string property', t => {
    const obj = { name: 'John' };
    setPropertyValue(obj, ['name'], '');
    t.is(obj.name, '');
});

test('setPropertyValue: set property to 0', t => {
    const obj = { count: 5 };
    setPropertyValue(obj, ['count'], 0);
    t.is(obj.count, 0);
});

test('setPropertyValue: set property to false', t => {
    const obj = { active: true };
    setPropertyValue(obj, ['active'], false);
    t.is(obj.active, false);
});

test('setPropertyValue: modifies original object', t => {
    const obj = { user: { name: 'John' } };
    setPropertyValue(obj, ['user', 'name'], 'Jane');
    t.is(obj.user.name, 'Jane');
});

test('setPropertyValue: returns the value at the path', t => {
    const obj = { user: { name: 'John' } };
    const result = setPropertyValue(obj, ['user', 'name'], 'Jane');
    t.is(result, 'Jane');
});

test('setPropertyValue: returns the value at single level path', t => {
    const obj = { name: 'John' };
    const result = setPropertyValue(obj, ['name'], 'Jane');
    t.is(result, 'Jane');
});

test('setPropertyValue: returns the value at deeply nested path', t => {
    const obj = {
        company: {
            employees: {
                manager: { name: 'Alice' },
            },
        },
    };
    const result = setPropertyValue(obj, ['company', 'employees', 'manager', 'name'], 'Bob');
    t.is(result, 'Bob');
});

test('setPropertyValue: can chain multiple calls', t => {
    const obj = { user: { profile: { name: 'John' } } };
    setPropertyValue(obj, ['user', 'profile', 'name'], 'Jane');
    setPropertyValue(obj, ['user', 'profile', 'age'], 30);
    t.is(obj.user.profile.name, 'Jane');

    // @ts-expect-error
    t.is(obj.user.profile.age, 30);
});

// ============================================================================
// attributeNameToPropertyName Tests
// ============================================================================

test('attributeNameToPropertyName: simple attribute', t => {
    t.is(attributeNameToPropertyName('data-name'), 'name');
    t.is(attributeNameToPropertyName('data-age'), 'age');
});

test('attributeNameToPropertyName: kebab-case to camelCase', t => {
    t.is(attributeNameToPropertyName('data-first-name'), 'firstName');
    t.is(attributeNameToPropertyName('data-user-email'), 'userEmail');
});

test('attributeNameToPropertyName: nested dot notation', t => {
    t.is(attributeNameToPropertyName('data-user.name'), 'user.name');
    t.is(attributeNameToPropertyName('data-user.first-name'), 'user.firstName');
    t.is(attributeNameToPropertyName('data-user.a'), 'user.a');
});

test('attributeNameToPropertyName: double hyphens', t => {
    t.is(attributeNameToPropertyName('data-test-attr--nested'), 'testAttr-nested');
    t.is(attributeNameToPropertyName('data-a--b'), 'a-b');
});

test('attributeNameToPropertyName: triple hyphens', t => {
    t.is(attributeNameToPropertyName('data-test-attr---nested'), 'testAttr-Nested');
});

test('attributeNameToPropertyName: quad hyphens', t => {
    t.is(attributeNameToPropertyName('data-test-attr----nested'), 'testAttr--nested');
});

test('attributeNameToPropertyName: custom prefix', t => {
    t.is(attributeNameToPropertyName('app-user-name', 'app-'), 'userName');
    t.is(attributeNameToPropertyName('x-first-name', 'x-'), 'firstName');
});

test('attributeNameToPropertyName: no matching prefix returns original', t => {
    t.is(attributeNameToPropertyName('name'), 'name');
    t.is(attributeNameToPropertyName('user-email'), 'user-email');
});

test('attributeNameToPropertyName: double dots preserved', t => {
    t.is(attributeNameToPropertyName('data-obj..path'), 'obj..path');
});

test('attributeNameToPropertyName: single character parts', t => {
    t.is(attributeNameToPropertyName('data-a-b-c'), 'aBC');
    t.is(attributeNameToPropertyName('data-x-y'), 'xY');
});

// ============================================================================
// propertyNameToAttributeName Tests
// ============================================================================

test('propertyNameToAttributeName: simple property', t => {
    t.is(propertyNameToAttributeName('name'), 'data-name');
    t.is(propertyNameToAttributeName('age'), 'data-age');
});

test('propertyNameToAttributeName: camelCase to kebab-case', t => {
    t.is(propertyNameToAttributeName('firstName'), 'data-first-name');
    t.is(propertyNameToAttributeName('userEmail'), 'data-user-email');
});

test('propertyNameToAttributeName: nested dot notation', t => {
    t.is(propertyNameToAttributeName('user.name'), 'data-user.name');
    t.is(propertyNameToAttributeName('user.firstName'), 'data-user.first-name');
});

test('propertyNameToAttributeName: existing hyphens', t => {
    t.is(propertyNameToAttributeName('user-name'), 'data-user--name');
});

test('propertyNameToAttributeName: double dots', t => {
    t.is(propertyNameToAttributeName('obj..path'), 'data-obj..path');
});

test('propertyNameToAttributeName: array input', t => {
    t.is(propertyNameToAttributeName(['name']), 'data-name');
    t.is(propertyNameToAttributeName(['user', 'name']), 'data-user.name');
    t.is(propertyNameToAttributeName(['user', 'firstName']), 'data-user.first-name');
});

test('propertyNameToAttributeName: custom prefix', t => {
    t.is(propertyNameToAttributeName('userName', 'app-'), 'app-user-name');
    t.is(propertyNameToAttributeName(['user', 'name'], 'x-'), 'x-user.name');
});

test('propertyNameToAttributeName: complex nested camelCase', t => {
    t.is(propertyNameToAttributeName('myComplexProperty'), 'data-my-complex-property');
    t.is(propertyNameToAttributeName('user.myComplexProperty'), 'data-user.my-complex-property');
});

// ============================================================================
// propertyNameToPath Tests
// ============================================================================

test('propertyNameToPath: simple property', t => {
    t.deepEqual(propertyNameToPath('name'), ['name']);
    t.deepEqual(propertyNameToPath('age'), ['age']);
});

test('propertyNameToPath: nested properties', t => {
    t.deepEqual(propertyNameToPath('user.name'), ['user', 'name']);
    t.deepEqual(propertyNameToPath('user.email'), ['user', 'email']);
});

test('propertyNameToPath: deeply nested', t => {
    t.deepEqual(propertyNameToPath('user.profile.name'), ['user', 'profile', 'name']);
    t.deepEqual(propertyNameToPath('a.b.c.d'), ['a', 'b', 'c', 'd']);
});

test('propertyNameToPath: double dots preserved', t => {
    t.deepEqual(propertyNameToPath('obj..path'), ['obj.path']);
    t.deepEqual(propertyNameToPath('a..b..c'), ['a.b.c']);
});

test('propertyNameToPath: multiple double dots', t => {
    t.deepEqual(propertyNameToPath('a....b'), ['a..b']);
});

// ============================================================================
// pathToPropertyName Tests
// ============================================================================

test('pathToPropertyName: simple path', t => {
    t.is(pathToPropertyName(['name']), 'name');
    t.is(pathToPropertyName(['age']), 'age');
});

test('pathToPropertyName: nested path', t => {
    t.is(pathToPropertyName(['user', 'name']), 'user.name');
    t.is(pathToPropertyName(['user', 'email']), 'user.email');
});

test('pathToPropertyName: deeply nested path', t => {
    t.is(pathToPropertyName(['user', 'profile', 'name']), 'user.profile.name');
    t.is(pathToPropertyName(['a', 'b', 'c', 'd']), 'a.b.c.d');
});

test('pathToPropertyName: parts with dots become double dots', t => {
    t.is(pathToPropertyName(['obj.', 'path']), 'obj...path');
    t.is(pathToPropertyName(['a.', 'b.']), 'a...b..');
});

test('pathToPropertyName: not an array throws error', t => {
    const error = t.throws(() => {
        // @ts-expect-error
        pathToPropertyName('user.name');
    }, { instanceOf: Error });
    t.is(error.message, 'path must be an array of property names');
});

test('pathToPropertyName: inverse of propertyNameToPath', t => {
    const original = 'user.profile.name';
    const path = propertyNameToPath(original);
    const reconstructed = pathToPropertyName(path);
    t.is(reconstructed, original);
});

test('pathToPropertyName: inverse with double dots', t => {
    const original = 'obj..path';
    const path = propertyNameToPath(original);
    const reconstructed = pathToPropertyName(path);
    t.is(reconstructed, original);
});

// ============================================================================
// Integration Tests
// ============================================================================

test('integration: attributeNameToPropertyName -> getNestedProperty', t => {
    const obj = { user: { firstName: 'John', lastName: 'Doe' } };
    const attrName = 'data-user.first-name';
    const propName = attributeNameToPropertyName(attrName);
    const path = propertyNameToPath(propName);
    const value = getNestedProperty(obj, path);
    t.is(value, 'John');
});

test('integration: propertyNameToAttributeName -> attributeNameToPropertyName roundtrip', t => {
    const original = 'user.firstName';
    const attrName = propertyNameToAttributeName(original);
    const propName = attributeNameToPropertyName(attrName);
    t.is(propName, original);
});

test('integration: pathToPropertyName -> propertyNameToPath roundtrip', t => {
    const original = ['user', 'profile', 'email'];
    const propName = pathToPropertyName(original);
    const path = propertyNameToPath(propName);
    t.deepEqual(path, original);
});
