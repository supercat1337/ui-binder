// @ts-check

/**
 * Returns a Map of the attributes of the given element.
 * The keys are the attribute names, and the values are the attribute values.
 * @param {Element} element The element to get the attributes from.
 * @returns {Map<string, string>} A Map of the element's attributes.
 */
export function getElementAttrs(element) {
    // Safer method that works with both SVG and HTML
    const attrs = new Map();
    for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attrs.set(attr.name, attr.value);
    }
    return attrs;
}

const nativeProps = {
    contenteditable: 'contentEditable',
    innerhtml: 'innerHTML',
    innertext: 'innerText',
    outerhtml: 'outerHTML',
    outertext: 'outerText',
    classname: 'className',
    textcontent: 'textContent',
};

/**
 *
 * @param {string} name
 * @param {string} [prefix="data-"]
 * @returns {string|false}
 */
export function isNativePropertyName(name, prefix = 'data-') {
    let result = name.startsWith(prefix) ? name.substring(prefix.length) : name;

    result = result.toLowerCase();

    //console.log(`${result} in window.Element.prototype: `, result in window.Element.prototype);

    return nativeProps[result] || (result in window.Element.prototype ? result : false);
}
