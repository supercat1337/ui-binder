import test from 'ava';
import { parseClassDirectives } from './class-directive.js';

// ============================================================================
// Return Type Tests
// ============================================================================

test('parseClassDirectives: returns ClassDirectiveValue with correct structure', t => {
    const attributes = new Map();
    const result = parseClassDirectives(attributes);

    t.truthy(result);
    t.is(typeof result, 'object');
    t.true(result.reactiveClasses instanceof Map);
    t.is(result.computedClass, null);
});

test('parseClassDirectives: empty attributes returns empty collections', t => {
    const attributes = new Map();
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.size, 0);
    t.is(result.computedClass, null);
});

// ============================================================================
// Reactive Classes (data-c-*) Tests
// ============================================================================

test('parseClassDirectives: single reactive class', t => {
    const attributes = new Map([['data-c-active', 'isActive']]);
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.size, 1);
    t.truthy(result.reactiveClasses.get('active'));
    t.is(result.reactiveClasses.get('active').target, 'isActive');
});

test('parseClassDirectives: multiple reactive classes', t => {
    const attributes = new Map([
        ['data-c-active', 'isActive'],
        ['data-c-disabled', 'isDisabled'],
        ['data-c-hidden', 'isHidden'],
    ]);
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.size, 3);
    t.is(result.reactiveClasses.get('active').target, 'isActive');
    t.is(result.reactiveClasses.get('disabled').target, 'isDisabled');
    t.is(result.reactiveClasses.get('hidden').target, 'isHidden');
});

test('parseClassDirectives: trims whitespace from property value', t => {
    const attributes = new Map([['data-c-active', '  isActive  ']]);
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.get('active').target, 'isActive');
});

test('parseClassDirectives: nested property names', t => {
    const attributes = new Map([
        ['data-c-active', 'user.isActive'],
        ['data-c-error', 'form.validation.hasError'],
    ]);
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.get('active').target, 'user.isActive');
    t.is(result.reactiveClasses.get('error').target, 'form.validation.hasError');
});

test('parseClassDirectives: empty reactive class values are added', t => {
    const attributes = new Map([
        ['data-c-active', ''],
        ['data-c-disabled', 'isDisabled'],
    ]);
    const result = parseClassDirectives(attributes);

    // parseDirectiveValue returns an object even for empty strings
    t.is(result.reactiveClasses.size, 2);
    t.is(result.reactiveClasses.get('disabled').target, 'isDisabled');
});

test('parseClassDirectives: whitespace-only reactive class values are added', t => {
    const attributes = new Map([
        ['data-c-active', '   '],
        ['data-c-disabled', 'isDisabled'],
    ]);
    const result = parseClassDirectives(attributes);

    // parseDirectiveValue returns an object for whitespace-only strings
    t.is(result.reactiveClasses.size, 2);
});

test('parseClassDirectives: class names with hyphens', t => {
    const attributes = new Map([
        ['data-c-my-active-class', 'isActive'],
        ['data-c-is-disabled', 'isDisabled'],
    ]);
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.get('my-active-class').target, 'isActive');
    t.is(result.reactiveClasses.get('is-disabled').target, 'isDisabled');
});

test('parseClassDirectives: preserves case sensitivity in class names', t => {
    const attributes = new Map([
        ['data-c-Active', 'property1'],
        ['data-c-active', 'property2'],
    ]);
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.size, 2);
    t.is(result.reactiveClasses.get('Active').target, 'property1');
    t.is(result.reactiveClasses.get('active').target, 'property2');
});

test('parseClassDirectives: preserves case sensitivity in property names', t => {
    const attributes = new Map([
        ['data-c-active', 'isActive'],
        ['data-c-disabled', 'IsDisabled'],
    ]);
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.get('active').target, 'isActive');
    t.is(result.reactiveClasses.get('disabled').target, 'IsDisabled');
});

test('parseClassDirectives: invalid property names with special chars', t => {
    const attributes = new Map([
        ['data-c-active', '!invalid'],
        ['data-c-disabled', 'isDisabled'],
    ]);
    const result = parseClassDirectives(attributes);

    // parseDirectiveValue still parses even invalid names, adds both
    t.is(result.reactiveClasses.size, 2);
    t.is(result.reactiveClasses.get('disabled').target, 'isDisabled');
});

test('parseClassDirectives: property names with array notation', t => {
    const attributes = new Map([
        ['data-c-active', 'array[0]'],
        ['data-c-valid', 'validProperty'],
    ]);
    const result = parseClassDirectives(attributes);

    // Both are parsed, but array[0] shows warning
    t.is(result.reactiveClasses.size, 2);
    t.is(result.reactiveClasses.get('valid').target, 'validProperty');
});

test('parseClassDirectives: property names with expressions', t => {
    const attributes = new Map([['data-c-active', 'isActive === true']]);
    const result = parseClassDirectives(attributes);

    // Parsed but stops at ===, extracts only 'isActive', shows warning
    t.is(result.reactiveClasses.size, 1);
    t.is(result.reactiveClasses.get('active').target, 'isActive');
});

test('parseClassDirectives: accepts property names with underscores', t => {
    const attributes = new Map([['data-c-active', '_isActive']]);
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.get('active').target, '_isActive');
});

test('parseClassDirectives: accepts property names with dollar signs', t => {
    const attributes = new Map([['data-c-active', '$isActive']]);
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.get('active').target, '$isActive');
});

test('parseClassDirectives: handles single character class and property names', t => {
    const attributes = new Map([['data-c-a', 'x']]);
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.get('a').target, 'x');
});

test('parseClassDirectives: handles very long class names', t => {
    const longName = 'my-very-long-class-name-with-many-hyphens';
    const attributes = new Map([[`data-c-${longName}`, 'isActive']]);
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.get(longName).target, 'isActive');
});

test('parseClassDirectives: handles very long property names', t => {
    const longProperty = 'user.profile.settings.theme.isDarkMode.value.isEnabled.forCurrentSession';
    const attributes = new Map([['data-c-theme', longProperty]]);
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.get('theme').target, longProperty);
});

test('parseClassDirectives: handles numeric class names', t => {
    const attributes = new Map([['data-c-0', 'isClass0']]);
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.get('0').target, 'isClass0');
});

test('parseClassDirectives: handles numeric property names', t => {
    const attributes = new Map([['data-c-active', '0']]);
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.get('active').target, '0');
});

// ============================================================================
// Computed Class (data-c) Tests
// ============================================================================

test('parseClassDirectives: computed class parsing', t => {
    const attributes = new Map([['data-c', 'computedClasses']]);
    const result = parseClassDirectives(attributes);

    t.truthy(result.computedClass);
    t.is(result.computedClass.target, 'computedClasses');
    t.is(result.reactiveClasses.size, 0);
});

test('parseClassDirectives: computed class with nested property', t => {
    const attributes = new Map([['data-c', 'user.theme.className']]);
    const result = parseClassDirectives(attributes);

    t.is(result.computedClass.target, 'user.theme.className');
});

test('parseClassDirectives: computed class whitespace trimming', t => {
    const attributes = new Map([['data-c', '  computedClasses  ']]);
    const result = parseClassDirectives(attributes);

    t.is(result.computedClass.target, 'computedClasses');
});

test('parseClassDirectives: computed class with empty string returns null', t => {
    const attributes = new Map([['data-c', '']]);
    const result = parseClassDirectives(attributes);

    // Empty value keeps data-c-, so computedClass is not set
    t.is(result.computedClass, null);
});

test('parseClassDirectives: computed class with whitespace-only returns null', t => {
    const attributes = new Map([['data-c', '   ']]);
    const result = parseClassDirectives(attributes);

    // Whitespace trims to empty, so computedClass is not set
    t.is(result.computedClass, null);
});

test('parseClassDirectives: computed class with special chars', t => {
    const attributes = new Map([['data-c', '_computedClasses']]);
    const result = parseClassDirectives(attributes);

    t.is(result.computedClass.target, '_computedClasses');
});

// ============================================================================
// Conflict Resolution Tests (data-c precedence)
// ============================================================================

test('parseClassDirectives: data-c takes precedence over data-c-*', t => {
    const attributes = new Map([
        ['data-c', 'computedClasses'],
        ['data-c-active', 'isActive'],
        ['data-c-disabled', 'isDisabled'],
    ]);
    const result = parseClassDirectives(attributes);

    t.is(result.computedClass.target, 'computedClasses');
    t.is(result.reactiveClasses.size, 0);
});

test('parseClassDirectives: empty data-c falls back to data-c-* parsing', t => {
    const attributes = new Map([
        ['data-c', ''],
        ['data-c-active', 'isActive'],
        ['data-c-disabled', 'isDisabled'],
    ]);
    const result = parseClassDirectives(attributes);

    t.is(result.computedClass, null);
    t.is(result.reactiveClasses.size, 2);
    t.is(result.reactiveClasses.get('active').target, 'isActive');
});

test('parseClassDirectives: whitespace-only data-c falls back to data-c-* parsing', t => {
    const attributes = new Map([
        ['data-c', '   '],
        ['data-c-active', 'isActive'],
        ['data-c-disabled', 'isDisabled'],
    ]);
    const result = parseClassDirectives(attributes);

    t.is(result.computedClass, null);
    t.is(result.reactiveClasses.size, 2);
});

// ============================================================================
// Non-matching Attributes Tests
// ============================================================================

test('parseClassDirectives: ignores other directive attributes', t => {
    const attributes = new Map([
        ['data-a-title', 'tooltipText'],
        ['data-p-disabled', 'isSubmitting'],
        ['data-b-click', 'handleSubmit'],
        ['data-c-active', 'isActive'],
        ['data-m-show', 'isVisible'],
    ]);
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.size, 1);
    t.is(result.reactiveClasses.get('active').target, 'isActive');
});

test('parseClassDirectives: ignores regular HTML attributes', t => {
    const attributes = new Map([
        ['id', 'my-id'],
        ['class', 'existing-class'],
        ['data-test', 'value'],
        ['aria-label', 'label'],
        ['data-c-active', 'isActive'],
    ]);
    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.size, 1);
    t.is(result.reactiveClasses.get('active').target, 'isActive');
});

test('parseClassDirectives: handles malformed data-c- attributes', t => {
    const attributes = new Map([
        ['data-c-', 'shouldIgnore'],
        ['data-c-valid', 'isValid'],
    ]);
    const result = parseClassDirectives(attributes);

    // data-c- with empty name creates empty string key
    t.is(result.reactiveClasses.size, 2);
    t.is(result.reactiveClasses.get('valid').target, 'isValid');
});

// ============================================================================
// Integration Tests
// ============================================================================

test('integration: realistic element with reactive classes', t => {
    const attributes = new Map([
        ['class', 'existing-class'],
        ['id', 'my-element'],
        ['data-c-active', 'isActive'],
        ['data-c-visible', 'user.isVisible'],
        ['data-c-error', 'form.hasErrors'],
    ]);

    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.size, 3);
    t.is(result.reactiveClasses.get('active').target, 'isActive');
    t.is(result.reactiveClasses.get('visible').target, 'user.isVisible');
    t.is(result.reactiveClasses.get('error').target, 'form.hasErrors');
    t.is(result.computedClass, null);
});

test('integration: complex form field with multiple classes', t => {
    const attributes = new Map([
        ['data-c-invalid', 'field.hasError'],
        ['data-c-required', 'field.isRequired'],
        ['data-c-dirty', 'field.isDirty'],
        ['data-c-touched', 'field.isTouched'],
        ['data-c-disabled', 'form.isSubmitting'],
        ['data-c-readonly', 'field.isReadonly'],
    ]);

    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.size, 6);
    const classNames = Array.from(result.reactiveClasses.keys()).sort();
    t.deepEqual(classNames, ['dirty', 'disabled', 'invalid', 'readonly', 'required', 'touched']);
});

test('integration: element with multiple directive types', t => {
    const attributes = new Map([
        ['id', 'my-button'],
        ['type', 'submit'],
        ['class', 'btn btn-primary'],
        ['data-a-title', 'tooltipText'],
        ['data-p-disabled', 'isSubmitting'],
        ['data-b-click', 'handleSubmit'],
        ['data-c-loading', 'isLoading'],
        ['data-c-disabled', 'isDisabled'],
        ['data-c-focus-ring', 'isFocused'],
    ]);

    const result = parseClassDirectives(attributes);

    t.is(result.reactiveClasses.size, 3);
    t.is(result.reactiveClasses.get('loading').target, 'isLoading');
    t.is(result.reactiveClasses.get('disabled').target, 'isDisabled');
    t.is(result.reactiveClasses.get('focus-ring').target, 'isFocused');
});

test('integration: switching from reactive to computed class', t => {
    const reactiveAttrs = new Map([
        ['data-c-active', 'isActive'],
        ['data-c-disabled', 'isDisabled'],
    ]);
    const result1 = parseClassDirectives(reactiveAttrs);

    t.is(result1.reactiveClasses.size, 2);
    t.is(result1.computedClass, null);

    const computedAttrs = new Map([
        ['data-c', 'themeClass'],
    ]);
    const result2 = parseClassDirectives(computedAttrs);

    t.is(result2.reactiveClasses.size, 0);
    t.is(result2.computedClass.target, 'themeClass');
});

test('integration: DirectiveValue objects have required properties', t => {
    const attributes = new Map([['data-c-active', 'isActive']]);
    const result = parseClassDirectives(attributes);

    const directive = result.reactiveClasses.get('active');
    t.truthy(directive.target);
    t.truthy(directive.targetParts);
    t.true(Array.isArray(directive.targetParts));
    t.true(directive.eventModifiers instanceof Map);
});
