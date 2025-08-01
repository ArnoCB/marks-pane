export function createElement(name: string): SVGElement {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}

export default {
    createElement: createElement
};
