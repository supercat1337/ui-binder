# UI Binder — Foundation for Reactive Bridges

**UI Binder** is not a framework, but a foundation for building bridges between DOM and any reactive system (MobX, Valtio, Solid.js, Nano Stores, etc.). The library provides a parser for declarative `data-*` directives and an architecture for building your own reactive adapters.

## 🏗️ Philosophy

UI Binder follows the principle **"Do one thing and do it well"**:
- **Does NOT** manage state
- **Does NOT** implement reactivity
- **Does NOT** handle rendering

Instead, the library:
- **Parses** declarative directives from HTML
- **Provides** architecture for building bridges
- **Manages** subscription lifecycle
- **Remains** minimal and independent

## 🚀 Quick Start

### Installation
```bash
npm install @supercat1337/ui-binder
```

### Usage with a Bridge (Pseudocode Example)
```javascript
// Pseudocode: This shows the intended usage pattern
// Actual bridge implementations (MobXBridge, ValtioBridge, etc.)
// would be provided by separate packages or custom implementations

import { BridgeBase } from '@supercat1337/ui-binder';

// Custom bridge implementation for your reactive system
class CustomReactiveBridge extends BridgeBase {
    // ... implementation details
}

// Create bridge
const bridge = new CustomReactiveBridge();

// Create reactive state (specific to your reactive system)
const state = createReactiveState({
    user: { name: 'Alex', active: true },
    count: 0
});

const controller = new AbortController;

// Bind element to state
const binding = bridge.bindElement(
    document.querySelector('#user-input'),
    state,
    {
        signal: controller.signal, // Automatic cleanup
        config: { debounce: 300 }
    }
);

// Later, you can unbind
binding.dispose();
// Or controller.abort();
```

## 📋 Directive System

UI Binder parses 5 types of directives, all using the universal `DirectiveValue` format.

### 1. Two-Way Binding — `data-m`
```html
<input type="text" data-m="user.name">
<textarea data-m="content#debounce(300)"></textarea>
<select data-m="selectedOption@change"></select>
```

**Format:** `data-m="target[#modifiers...][@event]"`

### 2. Attribute Directives — `data-a-*`
```html
<img data-a-src="image.url" data-a-alt="description">
<div data-a-class="statusClass#throttle(100)"></div>
```

**Format:** `data-a-{attributeName}="target[#modifiers...]"`

### 3. Property Directives — `data-p-*`
```html
<div data-p-textcontent="message.text"></div>
<input data-p-disabled="form.isSubmitting">
<div data-p-innerhtml="content.html#sanitize"></div>
```

**Format:** `data-p-{propertyName}="target[#modifiers...]"`

### 4. Class Directives — `data-c` / `data-c-*`
```html
<!-- Boolean classes -->
<button data-c-active="user.isActive" 
        data-c-loading="form.isLoading">
</button>

<!-- Computed classes -->
<div data-c="theme.classes#debounce(200)"></div>
```

**Format:**
- `data-c-{className}="booleanProperty[#modifiers...]"`
- `data-c="stringProperty[#modifiers...]"`

### 5. Behavior Directives — `data-b-*`
```html
<!-- Semantics defined by the bridge implementation -->
<div data-b-text="message.content"></div>
<div data-b-html="content.markdown"></div>
<div data-b-show="ui.isVisible"></div>
```

**Format:** `data-b-{behaviorName}="target[#modifiers...]"`

## 🎯 Universal DirectiveValue Format

All directives are parsed into a universal structure:

```typescript
class DirectiveValue {
    target: string;           // Property path ("user.name")
    targetParts: string[];    // Split path (["user", "name"])
    domProperty: string;      // DOM property (for data-m:value)
    event: string;           // Event (for data-m)
    eventModifiers: Map<     // Modifiers (#debounce(300))
        string, 
        Array<string|number|boolean>
    >;
}
```

## 🔧 Core API

### DirectiveParser
The central directive parser:

```javascript
import { DirectiveParser } from '@supercat1337/ui-binder';

const parser = new DirectiveParser();

// Subscribe to directive events
parser.onModelDirective((element, directive, handlerContext) => {
    // directive: DirectiveValue
    // handlerContext: HandlerContext
});

// Parse element
const result = parser.processElement(element, state, options);
// { directives: ParsedDirectives, context: HandlerContext }
```

### BridgeBase
Abstract base class for bridges (now includes behavior directive callback):

```javascript
import { BridgeBase } from '@supercat1337/ui-binder';

class MyBridge extends BridgeBase {
    constructor() {
        super();
    }
    
    // Required methods
    isStateCompatible(state) { /* ... */ }
    attributeDirectivesCallback(element, directives, context) { /* ... */ }
    modelDirectiveCallback(element, directive, context) { /* ... */ }
    propertyDirectivesCallback(element, directives, context) { /* ... */ }
    classDirectiveCallback(element, directive, context) { /* ... */ }
    behaviorDirectiveCallback(element, directives, context) { /* ... */ }
}
```

### HandlerContext
Container for state and lifecycle management:

```javascript
// Created automatically in parser.processElement()
const context = new HandlerContext(state, {
    signal: abortSignal,  // For automatic cleanup
    config: { /* ... */ } // Additional configuration
});

// Context methods
context.get('user.name');           // Safe value retrieval
context.addCleanup(() => { ... }); // Register cleanup
context.dispose();                  // Unsubscribe from all subscriptions
```

## 🏗️ Building Your Own Bridge

### Example: Bridge for a Reactive System (Pseudocode)

```javascript
import { BridgeBase } from '@supercat1337/ui-binder';

// Pseudocode: Example bridge structure
// Actual implementation depends on your reactive system
export class CustomReactiveBridge extends BridgeBase {
    isStateCompatible(state) {
        // Check if state is compatible with your reactive system
        return state && typeof state === 'object' && state.__isReactive;
    }
    
    modelDirectiveCallback(element, directive, context) {
        const { state, addCleanup } = context;
        
        // Subscribe to state changes (pseudocode)
        const unsubscribe = watchReactiveState(state, () => {
            const value = context.get(directive.target);
            element.value = value ?? '';
        });
        
        // DOM event handler
        const eventHandler = (e) => {
            const newValue = element.value;
            // Update reactive state (pseudocode)
            updateReactiveState(state, directive.targetParts, newValue);
        };
        
        element.addEventListener('input', eventHandler);
        
        addCleanup(() => {
            unsubscribe();
            element.removeEventListener('input', eventHandler);
        });
    }
    
    behaviorDirectiveCallback(element, directives, context) {
        directives.forEach((directive, behaviorName) => {
            switch (behaviorName) {
                case 'text':
                    this.handleText(element, directive, context);
                    break;
                case 'html':
                    this.handleHtml(element, directive, context);
                    break;
                case 'show':
                    this.handleShow(element, directive, context);
                    break;
                // ... your custom behaviors
            }
        });
    }
    
    handleText(element, directive, context) {
        const dispose = watchReactiveState(() => {
            const value = context.get(directive.target);
            element.textContent = value ?? '';
        });
        context.addCleanup(dispose);
    }
    
    // ... implementation of other callbacks
}
```

## 🛠️ Utilities

```javascript
import { 
    getPropertyValue,
    setPropertyValue,
    propertyNameToPath,
    pathToPropertyName,
    attributeNameToPropertyName,
    propertyNameToAttributeName,
    isValidForTwoWayBinding
} from '@supercat1337/ui-binder';

// Working with property paths
getPropertyValue(state, ['user', 'name']);
setPropertyValue(state, ['user', 'name']);
propertyNameToPath('user.profile.name'); // ['user', 'profile', 'name']
pathToPropertyName(['user', 'profile']); // 'user.profile'

// Name conversion
attributeNameToPropertyName('data-user-name'); // 'userName'
propertyNameToAttributeName('userName'); // 'data-user-name'

// Element validation
isValidForTwoWayBinding(inputElement); // true/false
```

## 🎯 Advantages

1. **Independence** — works with any reactive system
2. **Declarative** — clean HTML with `data-*` attributes
3. **Flexible** — easy to create custom bridges and directives
4. **Safe** — automatic lifecycle management via `AbortSignal`
5. **Minimal** — only parsing and architecture, no imposed solutions

## 📚 Example Application

```html
<div id="app">
    <input type="text" data-m="user.name">
    <div data-c-active="user.isActive">Active</div>
    <button data-p-disabled="form.isSubmitting">Submit</button>
    <span data-b-text="user.email"></span>
</div>
```

```javascript
// Pseudocode: Example application structure
// Actual implementation requires a concrete bridge

import { BridgeBase } from '@supercat1337/ui-binder';

// Create your bridge implementation
class AppBridge extends BridgeBase {
    // ... implement required methods
}

// Create reactive state (using your preferred reactive system)
const state = createReactiveState({
    user: { name: '', email: '', isActive: true },
    form: { isSubmitting: false }
});

// Initialize bridge
const bridge = new AppBridge();
const controller = new AbortController();

// Bind all elements
document.querySelectorAll('*')
    .forEach(element => {
        bridge.bindElement(element, state, {
            signal: controller.signal
        });
    });
```

## 🤝 Compatibility

- **Browsers**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **Bundlers**: Webpack, Rollup, Vite, Parcel
- **Reactive Systems**: Any (MobX, Valtio, Solid, RxJS, custom)
- **TypeScript**: Full type support

## 📄 License

MIT © 2026 Supercat1337
