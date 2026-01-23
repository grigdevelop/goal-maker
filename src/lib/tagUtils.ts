/**
 * Remove classes from all children of an element which have a specific attribute.
 * The classes to remove are determined by the value of the attribute.
 * If the attribute does not exist on an element, no classes are removed.
 * If a class does not exist on an element, it is not removed.
 * @param {Element} el - The element to remove classes from.
 * @param {string} attr - The attribute name to look for.
 */
export function removeAttributeClass(el: Element, attr: string) {
    const elements = el.querySelectorAll(`[${attr}]`);
    elements.forEach((element) => {
        const toggleClass = element.getAttribute(attr);
        if (toggleClass) {
            toggleClass.split(' ').forEach((cls) => {
                if (cls) element.classList.remove(cls);
            });
        }
    });
}

/**
 * Add classes to all children of an element which have a specific attribute.
 * The classes to add are determined by the value of the attribute.
 * If the attribute does not exist on an element, no classes are added.
 * If a class already exists on an element, it is not added again.
 * @param {Element} el - The element to add classes to.
 * @param {string} attr - The attribute name to look for.
 */
export function addAttributeClass(el: Element, attr: string) {
    const elements = el.querySelectorAll(`[${attr}]`);
    elements.forEach((element) => {
        const toggleClass = element.getAttribute(attr);
        if (toggleClass) {
            toggleClass.split(' ').forEach((cls) => {
                if (cls && !element.classList.contains(cls)) element.classList.add(cls);
            });
        }
    });
}