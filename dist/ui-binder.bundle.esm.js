// src/utils/properties.js
function attributeNameToPropertyName(attrName, prefix = "data-") {
  if (!attrName.startsWith(prefix)) return attrName;
  let result = attrName.substring(prefix.length);
  result = result.replace(/\.\./g, "__DOT_MARKER__");
  let parts = result.split(".");
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];
    if (part.includes("--")) {
      let propParts = [];
      let subparts = part.split("--");
      for (let j = 0; j < subparts.length; j++) {
        let subpart = subparts[j];
        if (subpart.length == 1) {
          propParts.push(subpart);
          continue;
        } else {
          propParts.push(
            subpart.replace(/-([a-z])/gi, (g) => g[1].toUpperCase())
          );
        }
      }
      parts[i] = propParts.join("-");
    } else {
      if (part.length == 1) {
        parts[i] = part;
        continue;
      } else {
        parts[i] = part.replace(/-([a-z])/gi, (g) => g[1].toUpperCase());
      }
    }
  }
  result = parts.join(".");
  result = result.replace(/__DOT_MARKER__/g, "..");
  return result;
}
function propertyNameToAttributeName(input, prefix = "data-") {
  let result = [];
  let propPath = Array.isArray(input) ? input : input.split(".");
  for (let i = 0; i < propPath.length; i++) {
    let prop = propPath[i];
    prop = prop.replace(/-/g, "--").replace(/\./g, "..");
    prop = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
    result.push(prop);
  }
  return prefix + result.join(".");
}
function propertyNameToPath(propertyName) {
  let p = propertyName.replace(/\.\./g, "__DOT_MARKER__");
  let path = p.split(".");
  path = path.map((part) => part.replace(/__DOT_MARKER__/g, "."));
  return path;
}
function pathToPropertyName(path) {
  if (!Array.isArray(path)) {
    throw new Error("path must be an array of property names");
  }
  let result = [];
  for (let i = 0; i < path.length; i++) {
    let part = path[i];
    part = part.replace(/\./g, "__DOT_MARKER__");
    result.push(part);
  }
  return result.join(".").replace(/__DOT_MARKER__/g, "..");
}
function isSet(value) {
  return !(value === void 0 || value === null);
}
function getPropertyValue(obj, path) {
  return path.reduce((current, part) => {
    return isSet(current) ? current[part] : current;
  }, obj);
}
function setPropertyValue(obj, path, value) {
  return path.reduce((current, part, index) => {
    if (index === path.length - 1) {
      current[part] = value;
    }
    return current[part];
  }, obj);
}

// src/utils/dom.js
function getElementAttrs(element) {
  const attrs = /* @__PURE__ */ new Map();
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    attrs.set(attr.name, attr.value);
  }
  return attrs;
}
var nativeProps = {
  contenteditable: "contentEditable",
  innerhtml: "innerHTML",
  innertext: "innerText",
  outerhtml: "outerHTML",
  outertext: "outerText",
  classname: "className",
  textcontent: "textContent"
};
function isNativePropertyName(name, prefix = "data-") {
  let result = name.startsWith(prefix) ? name.substring(prefix.length) : name;
  result = result.toLowerCase();
  return nativeProps[result] || (result in window.Element.prototype ? result : false);
}

// src/utils/validators.js
function isValidForTwoWayBinding(element) {
  const tag = element.tagName;
  const type = element.type || "";
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") {
    const supportedTypes = [
      "text",
      "password",
      "email",
      "search",
      "tel",
      "url",
      "number",
      "range",
      "date",
      "time",
      "month",
      "week",
      "datetime-local",
      "color",
      "checkbox",
      "radio"
    ];
    return supportedTypes.includes(type);
  }
  if (element.contentEditable === "true") return true;
  if (element.getAttribute("role") === "textbox") return true;
  return false;
}

// src/models/directive-parser/constants.js
var DIRECTIVE_PREFIXES = {
  ATTRIBUTE: "data-a-",
  PROPERTY: "data-p-",
  BEHAVIOR: "data-b-",
  MODEL: "data-m",
  CLASS: "data-c"
};

// src/models/directive-value.js
var DirectiveValue = class {
  target = "";
  domProperty = "";
  event = "";
  /** @type {Map<string, Array<string|number|boolean>>} */
  eventModifiers = /* @__PURE__ */ new Map();
  /** @type {string[]} */
  get targetParts() {
    return propertyNameToPath(this.target);
  }
  /** @type {string[]} */
  get domPropertyParts() {
    return propertyNameToPath(this.domProperty);
  }
};

// src/models/class-directive-value.js
var ClassDirectiveValue = class {
  /** @type {Map<string, DirectiveValue>} */
  reactiveClasses = /* @__PURE__ */ new Map();
  // data-c-*="propertyName" (boolean reactive property)
  /** @type {DirectiveValue|null} */
  computedClass = null;
  // data-c="computedPropertyName" (string reactive property)
};

// src/models/parsed-directives.js
var ParsedDirectives = class {
  // a-directive manages element attributes
  /** @type {Map<string, DirectiveValue>} */
  attributeDirectives = /* @__PURE__ */ new Map();
  // p-directive manages element properties
  /** @type {Map<string, DirectiveValue>} */
  propertyDirectives = /* @__PURE__ */ new Map();
  // b-directive manages element behaviors (data-b-text, data-b-html, data-b-show, etc.)
  /** @type {Map<string, DirectiveValue>} */
  behaviorDirectives = /* @__PURE__ */ new Map();
  // m-directive manages two-way data binding
  /** @type {DirectiveValue|null} */
  modelDirective = null;
  // c-directive manages element className property
  /** @type {ClassDirectiveValue|null} */
  classDirective = null;
};

// src/models/directive-parser/parsers/attribute-directive.js
function parseAttributeDirective(value) {
  return parseDirectiveValue(value);
}

// src/models/directive-parser/parsers/class-directive.js
function parseClassDirectives(attributes) {
  const result = new ClassDirectiveValue();
  const hasDataC = attributes.has(DIRECTIVE_PREFIXES.CLASS);
  const dataCValue = hasDataC ? (attributes.get(DIRECTIVE_PREFIXES.CLASS) || "").trim() : "";
  const dataCStarAttributes = [];
  for (const [name] of attributes) {
    if (name.startsWith(DIRECTIVE_PREFIXES.CLASS + "-")) {
      dataCStarAttributes.push(name);
    }
  }
  if (hasDataC && dataCValue.length > 0) {
    result.computedClass = parseDirectiveValue(dataCValue);
    if (dataCStarAttributes.length > 0) {
      console.warn(
        `Element has both ${DIRECTIVE_PREFIXES.CLASS} and ${dataCStarAttributes.length} ${DIRECTIVE_PREFIXES.CLASS}-* attributes. Only ${DIRECTIVE_PREFIXES.CLASS} will be used. Ignored attributes: ${dataCStarAttributes.join(", ")}`
      );
    }
  } else {
    for (const [name, value] of attributes) {
      if (name.startsWith(DIRECTIVE_PREFIXES.CLASS + "-")) {
        const className = name.substring(DIRECTIVE_PREFIXES.CLASS.length + 1);
        result.reactiveClasses.set(className, parseDirectiveValue(value));
      }
    }
  }
  return result;
}

// src/models/directive-parser/parsers/model-directive.js
function parseModelDirective(value) {
  let directiveValue = new DirectiveValue();
  let rest = value;
  let atIndex = rest.lastIndexOf("@");
  if (atIndex !== -1) {
    directiveValue.event = rest.slice(atIndex + 1);
    rest = rest.slice(0, atIndex);
  }
  let hashIndex = rest.indexOf("#");
  let modifiersStr = "";
  if (hashIndex !== -1) {
    modifiersStr = rest.slice(hashIndex + 1);
    rest = rest.slice(0, hashIndex);
  }
  let colonIndex = rest.indexOf(":");
  if (colonIndex !== -1) {
    directiveValue.target = rest.slice(0, colonIndex);
    directiveValue.domProperty = rest.slice(colonIndex + 1);
  } else {
    directiveValue.target = rest;
  }
  if (modifiersStr) {
    let modifiers = parseModifiersString(modifiersStr);
    for (let [name, args] of modifiers) {
      directiveValue.eventModifiers.set(name, args);
    }
  }
  return directiveValue;
}

// src/models/directive-parser/parsers/property-directive.js
function parsePropertyDirective(value) {
  return parseDirectiveValue(value);
}

// src/models/directive-parser/parsers/behavior-directive.js
function parseBehaviorDirective(value) {
  return parseDirectiveValue(value);
}

// src/models/directive-parser/utils.js
function parseModifiersString(str) {
  const modifiers = [];
  const tokens = str.split("#").filter((token) => token.length > 0);
  for (let token of tokens) {
    let match = token.match(/^([A-Za-z0-9_-]+)(?:\(([^)]*)\))?/);
    if (match) {
      let args = match[2] ? match[2].split(",").map((arg) => {
        arg = arg.trim();
        if (!isNaN(Number(arg)) && arg !== "") {
          return Number(arg);
        }
        if (arg.toLowerCase() === "true") return true;
        if (arg.toLowerCase() === "false") return false;
        if (arg.startsWith("'") && arg.endsWith("'") || arg.startsWith('"') && arg.endsWith('"')) {
          return arg.slice(1, -1);
        }
        return arg;
      }) : [];
      modifiers.push([match[1], args]);
    }
  }
  return modifiers;
}
function parseDirectiveValue(value) {
  let directiveValue = new DirectiveValue();
  let rest = value.trim();
  let m = rest.match(/^([A-Za-z0-9_.$\-]+[A-Za-z0-9_$\-]*)/);
  if (m) {
    directiveValue.target = m[1];
    rest = rest.slice(m[1].length);
  } else {
    directiveValue.target = "";
  }
  if (rest.startsWith("#")) {
    let modifiers = parseModifiersString(rest.slice(1));
    for (let [name, args] of modifiers) {
      directiveValue.eventModifiers.set(name, args);
    }
  } else if (rest.length > 0 && directiveValue.target) {
    console.warn(`Unexpected characters in directive value after target: "${rest}"`);
  }
  if (!directiveValue.target) {
    console.warn(`Could not parse target from directive value: "${value}"`);
  }
  return directiveValue;
}
function parseDirectives(element, attributes = null) {
  let directives = new ParsedDirectives();
  if (!attributes) attributes = getElementAttrs(element);
  let hasClassDirective = false;
  for (let [name, value] of attributes) {
    if (name.startsWith(DIRECTIVE_PREFIXES.ATTRIBUTE)) {
      let attrName = name.substring(DIRECTIVE_PREFIXES.ATTRIBUTE.length);
      directives.attributeDirectives.set(attrName, parseAttributeDirective(value));
    } else if (name.startsWith(DIRECTIVE_PREFIXES.PROPERTY)) {
      let nativeProp = isNativePropertyName(name, DIRECTIVE_PREFIXES.PROPERTY);
      if (nativeProp) {
        directives.propertyDirectives.set(nativeProp, parseDirectiveValue(value));
        continue;
      }
      let propName = attributeNameToPropertyName(
        name,
        DIRECTIVE_PREFIXES.PROPERTY
      );
      directives.propertyDirectives.set(propName, parsePropertyDirective(value));
    } else if (name.startsWith(DIRECTIVE_PREFIXES.BEHAVIOR)) {
      let directiveName = name.substring(DIRECTIVE_PREFIXES.BEHAVIOR.length);
      directives.behaviorDirectives.set(directiveName, parseBehaviorDirective(value));
    } else if (name === DIRECTIVE_PREFIXES.MODEL) {
      if (!isValidForTwoWayBinding(element)) {
        console.warn(
          `${DIRECTIVE_PREFIXES.MODEL} is not valid on ${element.tagName}${// @ts-ignore
          element.type ? `[type="${element.type}"]` : ""}`
        );
      } else {
        directives.modelDirective = parseModelDirective(value);
      }
    } else if (name.startsWith(DIRECTIVE_PREFIXES.CLASS + "-") || name === DIRECTIVE_PREFIXES.CLASS) {
      hasClassDirective = true;
    }
  }
  if (hasClassDirective) {
    directives.classDirective = parseClassDirectives(attributes);
  }
  return directives;
}

// node_modules/@supercat1337/event-emitter/dist/event-emitter.esm.js
var EventEmitter = class {
  /**
   * Object that holds events and their listeners
   * @type {Object.<string, Function[]>}
   */
  events = {};
  /** @type {Object.<"#has-listeners"|"#no-listeners"|"#listener-error", Function[]>} */
  #internalEvents = {
    "#has-listeners": [],
    "#no-listeners": [],
    "#listener-error": []
  };
  #isDestroyed = false;
  /**
   * logErrors indicates whether errors thrown by listeners should be logged to the console.
   * @type {boolean}
   */
  logErrors = true;
  /**
   * Is the event emitter destroyed?
   * @type {boolean}
   */
  get isDestroyed() {
    return this.#isDestroyed;
  }
  /**
   * on is used to add a callback function that's going to be executed when the event is triggered
   * @param {T} event
   * @param {Function} listener
   * @returns {()=>void}
   */
  on(event, listener) {
    if (this.#isDestroyed) {
      throw new Error("EventEmitter is destroyed");
    }
    if (typeof this.events[event] !== "object") {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    let that = this;
    let unsubscriber = function() {
      that.removeListener(event, listener);
    };
    if (this.events[event].length == 1) {
      this.#emitInternal("#has-listeners", event);
    }
    return unsubscriber;
  }
  /**
   * Internal method to add a listener to an internal event
   * @param {"#has-listeners"|"#no-listeners"|"#listener-error"} event
   * @param {Function} listener
   * @returns {()=>void}
   */
  #onInternalEvent(event, listener) {
    this.#internalEvents[event].push(listener);
    let that = this;
    let unsubscriber = function() {
      that.#removeInternalListener(event, listener);
    };
    return unsubscriber;
  }
  /**
   * Internal method to remove a listener from an internal event
   * @param {"#has-listeners"|"#no-listeners"|"#listener-error"} event
   * @param {Function} listener
   */
  #removeInternalListener(event, listener) {
    var idx;
    if (typeof this.#internalEvents[event] === "object") {
      idx = this.#internalEvents[event].indexOf(listener);
      if (idx > -1) {
        this.#internalEvents[event].splice(idx, 1);
      }
    }
  }
  /**
   * off is an alias for removeListener
   * @param {T} event
   * @param {Function} listener
   */
  off(event, listener) {
    return this.removeListener(event, listener);
  }
  /**
   * Remove an event listener from an event
   * @param {T} event
   * @param {Function} listener
   */
  removeListener(event, listener) {
    if (this.#isDestroyed) {
      return;
    }
    var idx;
    if (!this.events[event]) return;
    idx = this.events[event].indexOf(listener);
    if (idx > -1) {
      this.events[event].splice(idx, 1);
      if (this.events[event].length == 0) {
        this.#emitInternal("#no-listeners", event);
      }
    }
  }
  /**
   * emit is used to trigger an event
   * @param {T} event
   * @param {...any} args
   */
  emit(event, ...args) {
    if (this.#isDestroyed) {
      return;
    }
    if (typeof this.events[event] !== "object") return;
    var listeners = this.events[event];
    var length = listeners.length;
    for (var i = 0; i < length; i++) {
      try {
        listeners[i].apply(this, args);
      } catch (e) {
        this.#emitInternal("#listener-error", e, event, ...args);
        if (this.logErrors) {
          console.error(`Error in listener for event "${event}":`, e);
        }
      }
    }
  }
  /**
   * Internal function to emit an event
   * @param {"#has-listeners"|"#no-listeners"|"#listener-error"} event
   * @param {...any} args
   */
  #emitInternal(event, ...args) {
    var listeners = this.#internalEvents[event];
    var length = listeners.length;
    for (var i = 0; i < length; i++) {
      try {
        listeners[i].apply(this, args);
      } catch (e) {
        let listenerError = e;
        listenerError.cause = {
          event,
          args
        };
        if (event === "#listener-error") {
          if (this.logErrors) {
            console.error(
              `Error in listener for internal event "${event}":`,
              listenerError
            );
          }
          continue;
        }
        if (event === "#has-listeners") {
          if (this.logErrors) {
            console.error(
              `Error in listener for internal event "${event}":`,
              listenerError
            );
          }
          this.#emitInternal(
            "#listener-error",
            listenerError,
            "#has-listeners",
            ...args
          );
        }
        if (event === "#no-listeners") {
          if (this.logErrors) {
            console.error(
              `Error in listener for internal event "${event}":`,
              listenerError
            );
          }
          this.#emitInternal(
            "#listener-error",
            listenerError,
            "#no-listeners",
            ...args
          );
        }
      }
    }
  }
  /**
   * Add a one-time listener
   * @param {T} event
   * @param {Function} listener
   * @returns {()=>void}
   */
  once(event, listener) {
    return this.on(event, function g() {
      this.removeListener(event, g);
      listener.apply(this, arguments);
    });
  }
  /**
   * Wait for an event to be emitted
   * @param {T} event
   * @param {number} [max_wait_ms=0] - Maximum time to wait in ms. If 0, the function will wait indefinitely.
   * @returns {Promise<boolean>} - Resolves with true if the event was emitted, false if the time ran out.
   */
  waitForEvent(event, max_wait_ms = 0) {
    if (this.#isDestroyed) {
      throw new Error("EventEmitter is destroyed");
    }
    return new Promise((resolve) => {
      let timeout;
      let unsubscriber = this.on(event, () => {
        if (max_wait_ms > 0) {
          clearTimeout(timeout);
        }
        unsubscriber();
        resolve(true);
      });
      if (max_wait_ms > 0) {
        timeout = setTimeout(() => {
          unsubscriber();
          resolve(false);
        }, max_wait_ms);
      }
    });
  }
  /**
   * Wait for any of the specified events to be emitted
   * @param {T[]} events - Array of event names to wait for
   * @param {number} [max_wait_ms=0] - Maximum time to wait in ms. If 0, the function will wait indefinitely.
   * @returns {Promise<boolean>} - Resolves with true if any event was emitted, false if the time ran out.
   */
  waitForAnyEvent(events, max_wait_ms = 0) {
    if (this.#isDestroyed) {
      throw new Error("EventEmitter is destroyed");
    }
    return new Promise((resolve) => {
      let timeout;
      let unsubscribers = [];
      const main_unsubscriber = () => {
        if (max_wait_ms > 0) {
          clearTimeout(timeout);
        }
        unsubscribers.forEach((unsubscriber) => {
          unsubscriber();
        });
        resolve(true);
      };
      events.forEach((event) => {
        unsubscribers.push(this.on(event, main_unsubscriber));
      });
      if (max_wait_ms > 0) {
        timeout = setTimeout(() => {
          main_unsubscriber();
          resolve(false);
        }, max_wait_ms);
      }
    });
  }
  /**
   * Clear all events
   */
  clear() {
    this.events = {};
  }
  /**
   * Destroys the event emitter, clearing all events and listeners.
   * @alias clear
   */
  destroy() {
    if (this.#isDestroyed) {
      return;
    }
    this.#isDestroyed = true;
    this.#internalEvents = {
      "#has-listeners": [],
      "#no-listeners": [],
      "#listener-error": []
    };
    this.events = {};
  }
  /**
   * Clears all listeners for a specified event.
   * @param {T} event - The event for which to clear all listeners.
   */
  clearEventListeners(event) {
    if (this.#isDestroyed) {
      return;
    }
    let listeners = this.events[event] || [];
    let listenersCount = listeners.length;
    if (listenersCount > 0) {
      this.events[event] = [];
      this.#emitInternal("#no-listeners", event);
    }
  }
  /**
   * onHasEventListeners() is used to subscribe to the "#has-listeners" event. This event is emitted when the number of listeners for any event (except "#has-listeners" and "#no-listeners") goes from 0 to 1.
   * @param {Function} callback
   * @returns {()=>void}
   */
  onHasEventListeners(callback) {
    if (this.#isDestroyed) {
      throw new Error("EventEmitter is destroyed");
    }
    return this.#onInternalEvent("#has-listeners", callback);
  }
  /**
   * onNoEventListeners() is used to subscribe to the "#no-listeners" event. This event is emitted when the number of listeners for any event (except "#has-listeners" and "#no-listeners") goes from 1 to 0.
   * @param {Function} callback
   * @returns {()=>void}
   */
  onNoEventListeners(callback) {
    if (this.#isDestroyed) {
      throw new Error("EventEmitter is destroyed");
    }
    return this.#onInternalEvent("#no-listeners", callback);
  }
  /**
   * onListenerError() is used to subscribe to the "#listener-error" event. This event is emitted when any listener throws an error.
   * @param {Function} callback
   * @returns {()=>void}
   */
  onListenerError(callback) {
    if (this.#isDestroyed) {
      throw new Error("EventEmitter is destroyed");
    }
    return this.#onInternalEvent("#listener-error", callback);
  }
};

// src/models/handler-context.js
var HandlerContext = class {
  /**
   * Constructor for HandlerContext.
   * @param {Object} state
   * @param {{ config ?: Object, signal?: AbortSignal|null }} options
   */
  constructor(state, { config = {}, signal = null }) {
    this.state = state;
    this.signal = signal;
    this.config = config;
    this.unsubscribers = [];
  }
  /**
   * Get a value from the state object by path.
   * If the value is not found, return the default value.
   * @param {string|string[]} path - Path to the value in the state object.
   * @param {*} defaultValue - Optional default value to return if the value is not found.
   * @returns {*} Value from the state object or the default value.
   */
  get(path, defaultValue = null) {
    let p = Array.isArray(path) ? path : propertyNameToPath(path);
    return getPropertyValue(this.state, p) ?? defaultValue;
  }
  /**
   * Checks if the handler is active.
   * @returns {boolean} True if the handler is active, false otherwise.
   */
  get isActive() {
    return !this.signal || !this.signal.aborted;
  }
  /**
   * Adds a cleanup function to the handler context.
   * @param {()=>void} cleanupFn - The cleanup function to add.
   * @returns {Function} The cleanup function that was added.
   */
  addCleanup(cleanupFn) {
    this.unsubscribers.push(cleanupFn);
    if (this.signal && !this.signal.aborted) {
      this.signal.addEventListener("abort", () => this.dispose(), { once: true });
    }
    return cleanupFn;
  }
  dispose() {
    this.unsubscribers.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        console.warn("Error during cleanup:", error);
      }
    });
    this.unsubscribers = [];
  }
};

// src/models/directive-parser.js
var EVENTS = {
  modelDirective: "modelDirective",
  attributeDirective: "attributeDirective",
  propertyDirective: "propertyDirective",
  classDirective: "classDirective",
  behaviorDirective: "behaviorDirective"
};
var DirectiveParser = class {
  /** @type {EventEmitter<keyof EVENTS>} */
  eventEmitter = new EventEmitter();
  /**
   * Parses all directives from an element and emits appropriate events.
   *
   * @param {Element} element - The DOM element to parse directives from
   * @param {Object} state - The state object to bind to
   * @param {{ signal?: AbortSignal, config?: Object}} [userOptions = {}] - Additional options
   * @returns {{ directives: ParsedDirectives, context: HandlerContext }}
   */
  processElement(element, state, userOptions = {}) {
    let parsedDirectives = parseDirectives(element);
    const { signal, config } = userOptions;
    const context = new HandlerContext(state, {
      config,
      signal
    });
    if (parsedDirectives.modelDirective) {
      this.eventEmitter.emit(
        EVENTS.modelDirective,
        element,
        parsedDirectives.modelDirective,
        context
      );
    }
    if (parsedDirectives.attributeDirectives.size > 0) {
      this.eventEmitter.emit(
        EVENTS.attributeDirective,
        element,
        parsedDirectives.attributeDirectives,
        context
      );
    }
    if (parsedDirectives.propertyDirectives.size > 0) {
      this.eventEmitter.emit(
        EVENTS.propertyDirective,
        element,
        parsedDirectives.propertyDirectives,
        context
      );
    }
    if (parsedDirectives.classDirective) {
      this.eventEmitter.emit(
        EVENTS.classDirective,
        element,
        parsedDirectives.classDirective,
        context
      );
    }
    if (parsedDirectives.behaviorDirectives.size > 0) {
      this.eventEmitter.emit(
        EVENTS.behaviorDirective,
        element,
        parsedDirectives.behaviorDirectives,
        context
      );
    }
    return {
      directives: parsedDirectives,
      context
    };
  }
  /**
   * Registers a callback for attribute directive events.
   * Called when element attributes matching `data-a-*` pattern are found.
   *
   * @param {(element:Element, attributeDirectives:Map<string, DirectiveValue>, handlerContext:HandlerContext)=>void} callback - Handler function receiving element and directives map
   * @returns {()=>void} Unsubscribe function to remove the listener
   */
  onAttributeDirective(callback) {
    return this.eventEmitter.on(EVENTS.attributeDirective, callback);
  }
  /**
   * Registers a callback for model directive events.
   * Called when a two-way binding directive (`data-m`) is found.
   *
   * @param {(element:Element, modelDirective:DirectiveValue, handlerContext:HandlerContext)=>void} callback - Handler function receiving element and model directive
   * @returns {()=>void} Unsubscribe function to remove the listener
   */
  onModelDirective(callback) {
    return this.eventEmitter.on(EVENTS.modelDirective, callback);
  }
  /**
   * Registers a callback for property directive events.
   * Called when element properties matching `data-p-*` pattern are found.
   *
   * @param {(element:Element, propertyDirectives:Map<string, DirectiveValue>, handlerContext:HandlerContext)=>void} callback - Handler function receiving element and directives map
   * @returns {()=>void} Unsubscribe function to remove the listener
   */
  onPropertyDirective(callback) {
    return this.eventEmitter.on(EVENTS.propertyDirective, callback);
  }
  /**
   * Registers a callback for class directive events.
   * Called when class directives matching `data-c*` pattern are found.
   *
   * @param {(element:Element, classDirective:ClassDirectiveValue, handlerContext:HandlerContext)=>void} callback - Handler function receiving element and class directive
   * @returns {()=>void} Unsubscribe function to remove the listener
   */
  onClassDirective(callback) {
    return this.eventEmitter.on(EVENTS.classDirective, callback);
  }
  /**
   * Registers a callback for behavior directive events.
   * Called when behavior directives matching `data-b-*` pattern are found.
   *
   * @param {(element:Element, behaviorDirectives:Map<string, DirectiveValue>, handlerContext:HandlerContext)=>void} callback - Handler function receiving element and directives map
   * @returns {()=>void} Unsubscribe function to remove the listener
   */
  onBehaviorDirective(callback) {
    return this.eventEmitter.on(EVENTS.behaviorDirective, callback);
  }
  /**
   * Clears all event listeners.
   */
  clear() {
    this.eventEmitter.clear();
  }
};

// src/models/bridge-base.js
var BridgeBase = class {
  constructor() {
    this.boundElements = /* @__PURE__ */ new Map();
    this.parser = new DirectiveParser();
    let that = this;
    this.parser.onAttributeDirective((element, attributeDirectives, handlerContext) => {
      that.attributeDirectivesCallback(element, attributeDirectives, handlerContext);
    });
    this.parser.onModelDirective((element, modelDirective, handlerContext) => {
      that.modelDirectiveCallback(element, modelDirective, handlerContext);
    });
    this.parser.onPropertyDirective((element, propertyDirectives, handlerContext) => {
      that.propertyDirectivesCallback(element, propertyDirectives, handlerContext);
    });
    this.parser.onClassDirective((element, classDirective, handlerContext) => {
      that.classDirectiveCallback(element, classDirective, handlerContext);
    });
  }
  /**
   * Binds the element to the reactive state.
   * @param {Element} element
   * @param {Object} state
   * @param {Object} options - Optional configuration
   * @param {AbortSignal} [options.signal] - Signal for automatic cleanup
   * @param {Object} [options.config] - Additional configuration
   * @returns {{ context: HandlerContext, directives: Object, dispose: () => void }}
   */
  bindElement(element, state, options = {}) {
    if (!this.isStateCompatible(state)) {
      throw new Error(`State is not compatible with bridge ${this.constructor.name}`);
    }
    if (this.boundElements.has(element)) {
      this.unbindElement(element);
    }
    const result = this.parser.processElement(element, state, options);
    this.boundElements.set(element, result.context);
    return {
      context: result.context,
      directives: result.directives,
      dispose: () => this.unbindElement(element)
    };
  }
  /**
   * Unbinds the element from the reactive state.
   * @param {Element} element
   */
  unbindElement(element) {
    const context = this.boundElements.get(element);
    if (context) {
      context.dispose();
      this.boundElements.delete(element);
    }
  }
  /**
   * Disposes the bridge.
   */
  dispose() {
    for (const [element] of this.boundElements) {
      this.unbindElement(element);
    }
  }
  // ============ Abstract ============
  /**
   * @param {unknown} state
   * @returns {boolean}
   */
  isStateCompatible(state) {
    console.warn("Method must be implemented by subclass");
    return false;
  }
  /**
   * Callback for attribute directives
   * @param {Element} element
   * @param {Map<string, DirectiveValue>} directives
   * @param {HandlerContext} handlerContext
   */
  attributeDirectivesCallback(element, directives, handlerContext) {
    console.log("Attribute directives found:", directives);
    console.warn("Method must be implemented by subclass");
  }
  /**
   * Callback for class directive
   * @param {Element} element
   * @param {ClassDirectiveValue} directive
   * @param {HandlerContext} handlerContext
   */
  classDirectiveCallback(element, directive, handlerContext) {
    console.log("Class directive found:", directive);
    console.warn("Method must be implemented by subclass");
  }
  /**
   * Callback for property directives
   * @param {Element} element
   * @param {Map<string, DirectiveValue>} directives
   * @param {HandlerContext} handlerContext
   */
  propertyDirectivesCallback(element, directives, handlerContext) {
    console.log("Property directives found:", directives);
    console.warn("Method must be implemented by subclass");
  }
  /**
   * Callback for model directive
   * @param {Element} element
   * @param {DirectiveValue} directive
   * @param {HandlerContext} handlerContext
   */
  modelDirectiveCallback(element, directive, handlerContext) {
    console.log("Model directive found:", directive);
    console.warn("Method must be implemented by subclass");
  }
  /**
   * Callback for behavior directive
   * @param {Element} element
   * @param {Map<string, DirectiveValue>} directives
   * @param {HandlerContext} handlerContext
   */
  behaviorDirectiveCallback(element, directives, handlerContext) {
    console.log("Behavior directives found:", directives);
    console.warn("Method must be implemented by subclass");
  }
};
export {
  BridgeBase,
  ClassDirectiveValue,
  DIRECTIVE_PREFIXES,
  DirectiveParser,
  DirectiveValue,
  ParsedDirectives,
  attributeNameToPropertyName,
  getElementAttrs,
  getPropertyValue,
  isValidForTwoWayBinding,
  parseDirectives,
  pathToPropertyName,
  propertyNameToAttributeName,
  propertyNameToPath,
  setPropertyValue
};
