// @ts-check

export {
    attributeNameToPropertyName,
    propertyNameToAttributeName,
    pathToPropertyName,
    getPropertyValue,
    setPropertyValue,
    propertyNameToPath,
} from './utils/properties.js';

export { getElementAttrs } from './utils/dom.js';

export { isValidForTwoWayBinding } from './utils/validators.js';
export { DIRECTIVE_PREFIXES } from './models/directive-parser/constants.js';

export { parseDirectives } from './models/directive-parser/utils.js';

export { DirectiveParser } from './models/directive-parser.js';
export { DirectiveValue } from './models/directive-value.js';
export { ClassDirectiveValue } from './models/class-directive-value.js';
export { ParsedDirectives } from './models/parsed-directives.js';
export { BridgeBase } from './models/bridge-base.js';
