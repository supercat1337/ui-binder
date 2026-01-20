// @ts-check

import test from 'ava';
import { HandlerContext } from './handler-context.js';

// ============================================================================
// HandlerContext Constructor Tests
// ============================================================================

test('HandlerContext: constructor with minimal options', t => {
    const state = { name: 'John', age: 30 };
    const context = new HandlerContext(state, {});
    
    t.is(context.state, state);
    t.is(context.signal, null);
    t.deepEqual(context.config, {});
    t.deepEqual(context.unsubscribers, []);
});

test('HandlerContext: constructor with full options', t => {
    const state = { user: { name: 'Alice' } };
    const config = { debug: true, timeout: 5000 };
    const abortController = new AbortController();
    
    const context = new HandlerContext(state, { config, signal: abortController.signal });
    
    t.is(context.state, state);
    t.is(context.signal, abortController.signal);
    t.deepEqual(context.config, config);
    t.deepEqual(context.unsubscribers, []);
});

test('HandlerContext: state is stored as reference', t => {
    /** @type {{ count: number }} */
    const state = { count: 0 };
    const context = new HandlerContext(state, {});
    
    state.count = 5;
    // @ts-ignore
    t.is(context.state.count, 5);
});

// ============================================================================
// get() Method Tests
// ============================================================================

test('HandlerContext.get: retrieve simple property', t => {
    const state = { name: 'John', age: 30 };
    const context = new HandlerContext(state, {});
    
    t.is(context.get('name'), 'John');
    t.is(context.get('age'), 30);
});

test('HandlerContext.get: retrieve nested property with string path', t => {
    const state = { user: { name: 'John', email: 'john@example.com' } };
    const context = new HandlerContext(state, {});
    
    t.is(context.get('user.name'), 'John');
    t.is(context.get('user.email'), 'john@example.com');
});

test('HandlerContext.get: retrieve nested property with array path', t => {
    const state = { user: { profile: { age: 30 } } };
    const context = new HandlerContext(state, {});
    
    t.is(context.get(['user', 'profile', 'age']), 30);
});

test('HandlerContext.get: return default value for missing property', t => {
    const state = { user: { name: 'John' } };
    const context = new HandlerContext(state, {});
    
    t.is(context.get('user.email', 'default@example.com'), 'default@example.com');
    t.is(context.get('missing', 'default-value'), 'default-value');
});

test('HandlerContext.get: return default value (null) when not specified', t => {
    const state = { user: { name: 'John' } };
    const context = new HandlerContext(state, {});
    
    t.is(context.get('missing'), null);
    t.is(context.get('user.email'), null);
});

test('HandlerContext.get: handle null/undefined in path', t => {
    const state = { user: null };
    const context = new HandlerContext(state, {});
    
    t.is(context.get('user.name'), null);
    t.is(context.get('user.name', 'fallback'), 'fallback');
});

test('HandlerContext.get: falsy values are returned correctly', t => {
    const state = { count: 0, active: false, name: '' };
    const context = new HandlerContext(state, {});
    
    t.is(context.get('count'), 0);
    t.is(context.get('active'), false);
    t.is(context.get('name'), '');
});

test('HandlerContext.get: deeply nested paths', t => {
    const state = {
        company: {
            employees: {
                manager: { name: 'Alice', salary: 100000 },
            },
        },
    };
    const context = new HandlerContext(state, {});
    
    t.is(context.get('company.employees.manager.name'), 'Alice');
    t.is(context.get('company.employees.manager.salary'), 100000);
});

test('HandlerContext.get: array indices in path', t => {
    const state = { items: ['apple', 'banana', 'cherry'] };
    const context = new HandlerContext(state, {});
    
    t.is(context.get('items.0'), 'apple');
    t.is(context.get('items.1'), 'banana');
});

// ============================================================================
// isActive Getter Tests
// ============================================================================

test('HandlerContext.isActive: returns true when no signal', t => {
    const context = new HandlerContext({}, {});
    t.true(context.isActive);
});

test('HandlerContext.isActive: returns true when signal is not aborted', t => {
    const abortController = new AbortController();
    const context = new HandlerContext({}, { signal: abortController.signal });
    
    t.true(context.isActive);
});

test('HandlerContext.isActive: returns false when signal is aborted', t => {
    const abortController = new AbortController();
    abortController.abort();
    const context = new HandlerContext({}, { signal: abortController.signal });
    
    t.false(context.isActive);
});

test('HandlerContext.isActive: updates after abort', t => {
    const abortController = new AbortController();
    const context = new HandlerContext({}, { signal: abortController.signal });
    
    t.true(context.isActive);
    abortController.abort();
    t.false(context.isActive);
});

// ============================================================================
// addCleanup() Method Tests
// ============================================================================

test('HandlerContext.addCleanup: adds cleanup function', t => {
    const context = new HandlerContext({}, {});
    const cleanup = () => {};
    
    const returned = context.addCleanup(cleanup);
    
    t.is(returned, cleanup);
    t.is(context.unsubscribers.length, 1);
    t.is(context.unsubscribers[0], cleanup);
});

test('HandlerContext.addCleanup: multiple cleanups', t => {
    const context = new HandlerContext({}, {});
    const cleanup1 = () => {};
    const cleanup2 = () => {};
    const cleanup3 = () => {};
    
    context.addCleanup(cleanup1);
    context.addCleanup(cleanup2);
    context.addCleanup(cleanup3);
    
    t.is(context.unsubscribers.length, 3);
    t.is(context.unsubscribers[0], cleanup1);
    t.is(context.unsubscribers[1], cleanup2);
    t.is(context.unsubscribers[2], cleanup3);
});

test('HandlerContext.addCleanup: returns the cleanup function', t => {
    const context = new HandlerContext({}, {});
    const cleanup = () => {
        console.log('cleaning up');
    };
    
    const returned = context.addCleanup(cleanup);
    t.is(returned, cleanup);
});

test('HandlerContext.addCleanup: with abort signal (not aborted)', t => {
    const abortController = new AbortController();
    const context = new HandlerContext({}, { signal: abortController.signal });
    
    let callCount = 0;
    const cleanup = () => {
        callCount++;
    };
    
    context.addCleanup(cleanup);
    t.is(callCount, 0);
});

// ============================================================================
// dispose() Method Tests
// ============================================================================

test('HandlerContext.dispose: calls all cleanup functions', t => {
    const context = new HandlerContext({}, {});
    let count = 0;
    
    context.addCleanup(() => {
        count++;
    });
    context.addCleanup(() => {
        count++;
    });
    context.addCleanup(() => {
        count++;
    });
    
    context.dispose();
    t.is(count, 3);
});

test('HandlerContext.dispose: clears unsubscribers after dispose', t => {
    const context = new HandlerContext({}, {});
    context.addCleanup(() => {});
    context.addCleanup(() => {});
    
    t.is(context.unsubscribers.length, 2);
    context.dispose();
    t.is(context.unsubscribers.length, 0);
});

test('HandlerContext.dispose: handles errors in cleanup functions', t => {
    const context = new HandlerContext({}, {});
    
    context.addCleanup(() => {
        throw new Error('Cleanup error 1');
    });
    context.addCleanup(() => {
        // This should still be called even if the first one throws
    });
    context.addCleanup(() => {
        throw new Error('Cleanup error 3');
    });
    
    // Should not throw, errors are caught and logged
    t.notThrows(() => {
        context.dispose();
    });
    
    // All cleanup functions should have been attempted
    t.is(context.unsubscribers.length, 0);
});

test('HandlerContext.dispose: can be called multiple times', t => {
    const context = new HandlerContext({}, {});
    let count = 0;
    
    context.addCleanup(() => {
        count++;
    });
    
    context.dispose();
    t.is(count, 1);
    
    // Adding another after dispose
    context.addCleanup(() => {
        count++;
    });
    
    context.dispose();
    t.is(count, 2);
});

test('HandlerContext.dispose: cleanup functions called in order', t => {
    const context = new HandlerContext({}, {});
    /** @type {number[]} */
    const callOrder = [];
    
    context.addCleanup(() => {
        callOrder.push(1);
    });
    context.addCleanup(() => {
        callOrder.push(2);
    });
    context.addCleanup(() => {
        callOrder.push(3);
    });
    
    context.dispose();
    t.deepEqual(callOrder, [1, 2, 3]);
});

// ============================================================================
// Integration Tests
// ============================================================================

test('integration: create context, get values, and cleanup', t => {
    const state = {
        user: { name: 'John', email: 'john@example.com' },
        config: { debug: true },
    };
    const context = new HandlerContext(state, {
        config: { timeout: 5000 },
    });
    
    t.is(context.get('user.name'), 'John');
    t.is(context.get('user.email'), 'john@example.com');
    t.deepEqual(context.config, { timeout: 5000 });
    
    let cleanupCalled = false;
    context.addCleanup(() => {
        cleanupCalled = true;
    });
    
    t.false(cleanupCalled);
    context.dispose();
    t.true(cleanupCalled);
});

test('integration: abort signal triggers cleanup on dispose', t => {
    const abortController = new AbortController();
    const context = new HandlerContext({}, { signal: abortController.signal });
    
    let cleanupCalled = false;
    context.addCleanup(() => {
        cleanupCalled = true;
    });
    
    t.true(context.isActive);
    t.false(cleanupCalled);
    
    context.dispose();
    t.true(cleanupCalled);
    
    // Now abort the signal
    abortController.abort();
    t.false(context.isActive);
});

test('integration: state mutations reflect in context', t => {
    const state = { count: 0, user: { name: 'John' } };
    const context = new HandlerContext(state, {});
    
    t.is(context.get('count'), 0);
    t.is(context.get('user.name'), 'John');
    
    // Mutate the state
    state.count = 5;
    state.user.name = 'Alice';
    
    // Context should reflect the changes
    t.is(context.get('count'), 5);
    t.is(context.get('user.name'), 'Alice');
});

test('integration: multiple contexts with separate state', t => {
    const state1 = { value: 1 };
    const state2 = { value: 2 };
    const state3 = { value: 3 };
    
    const context1 = new HandlerContext(state1, {});
    const context2 = new HandlerContext(state2, {});
    const context3 = new HandlerContext(state3, {});
    
    t.is(context1.get('value'), 1);
    t.is(context2.get('value'), 2);
    t.is(context3.get('value'), 3);
});

test('integration: cleanup with active abort signal', t => {
    const abortController = new AbortController();
    const context = new HandlerContext({}, { signal: abortController.signal });
    
    let cleanupCount = 0;
    context.addCleanup(() => {
        cleanupCount++;
    });
    
    t.is(cleanupCount, 0);
    context.dispose();
    t.is(cleanupCount, 1);
});
