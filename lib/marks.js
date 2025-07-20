import svg from './svg';
import events from './events';
export class Pane {
    constructor(target, container = document.body) {
        this.target = target;
        this.element = svg.createElement("svg");
        this.marks = [];
        // Match the coordinates of the target element
        this.element.style.position = "absolute";
        this.element.setAttribute("pointer-events", "none");
        // Set up mouse event proxying between the target element and the marks
        events.proxyMouse(this.target, this.marks);
        this.container = container;
        this.container.appendChild(this.element);
        this.render();
    }
    addMark(mark) {
        const g = svg.createElement("g");
        this.element.appendChild(g);
        mark.bind(g, this.container);
        this.marks.push(mark);
        mark.render();
        return mark;
    }
    removeMark(mark) {
        const idx = this.marks.indexOf(mark);
        if (idx === -1) {
            return;
        }
        const el = mark.unbind();
        if (el) {
            this.element.removeChild(el);
        }
        this.marks.splice(idx, 1);
    }
    render() {
        setCoords(this.element, coords(this.target, this.container));
        for (let m of this.marks) {
            m.render();
        }
    }
}
export class Mark {
    constructor() {
        this.container = null;
        this.range = null;
        this.element = null;
    }
    bind(element, container) {
        this.element = element;
        this.container = container;
    }
    unbind() {
        const el = this.element;
        this.element = null;
        return el;
    }
    render() { }
    dispatchEvent(e) {
        if (!this.element)
            return;
        this.element.dispatchEvent(e);
    }
    getBoundingClientRect() {
        // Always return a DOMRect, fallback to a default zero rect if element is missing
        if (this.element) {
            return this.element.getBoundingClientRect();
        }
        // Fallback: return a DOMRect with all zeros
        return new DOMRect(0, 0, 0, 0);
    }
    getClientRects() {
        var _a;
        const rects = [];
        let el = (_a = this.element) === null || _a === void 0 ? void 0 : _a.firstChild;
        while (el) {
            if (el instanceof Element) {
                rects.push(el.getBoundingClientRect());
            }
            el = el.nextSibling;
        }
        return rects;
    }
    filteredRanges() {
        if (!this.range) {
            return [];
        }
        // De-duplicate the boxes
        const rects = Array.from(this.range.getClientRects());
        const stringRects = rects.map((r) => JSON.stringify(r));
        const setRects = new Set(stringRects);
        return Array.from(setRects).map((sr) => JSON.parse(sr));
    }
}
export class Highlight extends Mark {
    constructor(range, className, data = {}, attributes = {}) {
        super();
        this.range = range;
        this.className = className;
        this.data = data;
        this.attributes = attributes;
    }
    bind(element, container) {
        super.bind(element, container);
        for (let attr in this.data) {
            if (Object.prototype.hasOwnProperty.call(this.data, attr)) {
                if (this.element instanceof HTMLElement) {
                    this.element.dataset[attr] = this.data[attr];
                }
            }
        }
        for (let attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                if (this.element instanceof HTMLElement ||
                    this.element instanceof SVGElement) {
                    this.element.setAttribute(attr, this.attributes[attr]);
                }
            }
        }
        if (this.className) {
            if (this.element instanceof HTMLElement ||
                this.element instanceof SVGElement) {
                this.element.classList.add(this.className);
            }
        }
    }
    render() {
        if (!this.element || !this.container)
            return;
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        const docFrag = this.element.ownerDocument.createDocumentFragment();
        const filtered = this.filteredRanges();
        const offset = this.element.getBoundingClientRect();
        const container = this.container.getBoundingClientRect();
        for (let i = 0, len = filtered.length; i < len; i++) {
            const r = filtered[i];
            const el = svg.createElement("rect");
            el.setAttribute("x", String(r.left - offset.left + container.left));
            el.setAttribute("y", String(r.top - offset.top + container.top));
            el.setAttribute("height", String(r.height));
            el.setAttribute("width", String(r.width));
            docFrag.appendChild(el);
        }
        this.element.appendChild(docFrag);
    }
}
export class Underline extends Highlight {
    constructor(range, className, data = {}, attributes = {}) {
        super(range, className, data, attributes);
    }
    render() {
        if (!this.element || !this.container)
            return;
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        const docFrag = this.element.ownerDocument.createDocumentFragment();
        const filtered = this.filteredRanges();
        const offset = this.element.getBoundingClientRect();
        const container = this.container.getBoundingClientRect();
        for (let i = 0, len = filtered.length; i < len; i++) {
            const r = filtered[i];
            const rect = svg.createElement("rect");
            rect.setAttribute("x", String(r.left - offset.left + container.left));
            rect.setAttribute("y", String(r.top - offset.top + container.top));
            rect.setAttribute("height", String(r.height));
            rect.setAttribute("width", String(r.width));
            rect.setAttribute("fill", "none");
            const line = svg.createElement("line");
            line.setAttribute("x1", String(r.left - offset.left + container.left));
            line.setAttribute("x2", String(r.left - offset.left + container.left + r.width));
            line.setAttribute("y1", String(r.top - offset.top + container.top + r.height - 1));
            line.setAttribute("y2", String(r.top - offset.top + container.top + r.height - 1));
            line.setAttribute("stroke-width", "1");
            line.setAttribute("stroke", "black"); //TODO: match text color?
            line.setAttribute("stroke-linecap", "square");
            docFrag.appendChild(rect);
            docFrag.appendChild(line);
        }
        this.element.appendChild(docFrag);
    }
}
function coords(el, container) {
    const offset = container.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    return {
        top: rect.top - offset.top,
        left: rect.left - offset.left,
        height: el.scrollHeight,
        width: el.scrollWidth
    };
}
function setCoords(el, coords) {
    el.style.setProperty("top", `${coords.top}px`, "important");
    el.style.setProperty("left", `${coords.left}px`, "important");
    el.style.setProperty("height", `${coords.height}px`, "important");
    el.style.setProperty("width", `${coords.width}px`, "important");
}
