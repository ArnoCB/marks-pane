(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.MarksPane = {}));
})(this, (function (exports) { 'use strict';

    function createElement(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    var svg = {
        createElement: createElement
    };

    var events = {
        proxyMouse: proxyMouse
    };
    function proxyMouse(target, tracked) {
        let eventTarget = target;
        if (target.nodeName === "iframe" || target.nodeName === "IFRAME") {
            try {
                eventTarget = target.contentDocument || target;
            }
            catch (err) {
                eventTarget = target;
            }
        }
        function dispatch(e) {
            // We walk through the set of tracked elements in reverse order so that
            // events are sent to those most recently added first.
            //
            // This is the least surprising behaviour as it simulates the way the
            // browser would work if items added later were drawn "on top of"
            // earlier ones.
            for (var i = tracked.length - 1; i >= 0; i--) {
                var t = tracked[i];
                let x, y;
                if ("touches" in e && e.touches.length) {
                    x = e.touches[0].clientX;
                    y = e.touches[0].clientY;
                }
                else {
                    x = e.clientX;
                    y = e.clientY;
                }
                if (!contains(t, target, x, y))
                    continue;
                t.dispatchEvent(clone(e));
                break;
            }
        }
        for (const ev of ["mouseup", "mousedown", "click"]) {
            eventTarget.addEventListener(ev, (e) => dispatch(e), false);
        }
        eventTarget.addEventListener("touchstart", (e) => dispatch(e), false);
    }
    /**
     * Clone a mouse event object.
     */
    function clone(e) {
        if ("touches" in e) {
            // TouchEvent: cloning is not supported, just return the original event
            return e;
        }
        const opts = Object.assign({}, e, { bubbles: false });
        return new MouseEvent(e.type, opts);
    }
    /**
     * Check if the item contains the point denoted by the passed coordinates
     */
    function contains(item, target, x, y) {
        var offset = target.getBoundingClientRect();
        function rectContains(r, x, y) {
            var top = r.top - offset.top;
            var left = r.left - offset.left;
            var bottom = top + r.height;
            var right = left + r.width;
            return top <= y && left <= x && bottom > y && right > x;
        }
        // Check overall bounding box first
        var rect = item.getBoundingClientRect();
        if (!rectContains(rect, x, y)) {
            return false;
        }
        // Then continue to check each child rect
        var rects = item.getClientRects();
        for (var i = 0, len = rects.length; i < len; i++) {
            if (rectContains(rects[i], x, y)) {
                return true;
            }
        }
        return false;
    }

    class Pane {
        constructor(target, container = document.body) {
            this.target = target;
            this.element = svg.createElement("svg");
            this.marks = [];
            // Match the coordinates of the target element
            this.element.style.position = "absolute";
            // Disable pointer events
            this.element.setAttribute("pointer-events", "none");
            // Set up mouse event proxying between the target element and the marks
            events.proxyMouse(this.target, this.marks);
            this.container = container;
            this.container.appendChild(this.element);
            this.render();
        }
        addMark(mark) {
            var g = svg.createElement("g");
            this.element.appendChild(g);
            mark.bind(g, this.container);
            this.marks.push(mark);
            mark.render();
            return mark;
        }
        removeMark(mark) {
            var idx = this.marks.indexOf(mark);
            if (idx === -1) {
                return;
            }
            var el = mark.unbind();
            if (el) {
                this.element.removeChild(el);
            }
            this.marks.splice(idx, 1);
        }
        render() {
            setCoords(this.element, coords(this.target, this.container));
            for (var m of this.marks) {
                m.render();
            }
        }
    }
    class Mark {
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
            var el = this.element;
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
            var rects = [];
            var el = (_a = this.element) === null || _a === void 0 ? void 0 : _a.firstChild;
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
    class Highlight extends Mark {
        constructor(range, className, data, attributes) {
            super();
            this.range = range;
            this.className = className;
            this.data = data || {};
            this.attributes = attributes || {};
        }
        bind(element, container) {
            super.bind(element, container);
            for (var attr in this.data) {
                if (this.data.hasOwnProperty(attr)) {
                    if (this.element instanceof HTMLElement) {
                        this.element.dataset[attr] = this.data[attr];
                    }
                }
            }
            for (var attr in this.attributes) {
                if (this.attributes.hasOwnProperty(attr)) {
                    if (this.element instanceof HTMLElement || this.element instanceof SVGElement) {
                        this.element.setAttribute(attr, this.attributes[attr]);
                    }
                }
            }
            if (this.className) {
                if (this.element instanceof HTMLElement || this.element instanceof SVGElement) {
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
            var docFrag = this.element.ownerDocument.createDocumentFragment();
            var filtered = this.filteredRanges();
            var offset = this.element.getBoundingClientRect();
            var container = this.container.getBoundingClientRect();
            for (var i = 0, len = filtered.length; i < len; i++) {
                var r = filtered[i];
                var el = svg.createElement("rect");
                el.setAttribute("x", String(r.left - offset.left + container.left));
                el.setAttribute("y", String(r.top - offset.top + container.top));
                el.setAttribute("height", String(r.height));
                el.setAttribute("width", String(r.width));
                docFrag.appendChild(el);
            }
            this.element.appendChild(docFrag);
        }
    }
    class Underline extends Highlight {
        constructor(range, className, data, attributes) {
            super(range, className, data, attributes);
        }
        render() {
            if (!this.element || !this.container)
                return;
            while (this.element.firstChild) {
                this.element.removeChild(this.element.firstChild);
            }
            var docFrag = this.element.ownerDocument.createDocumentFragment();
            var filtered = this.filteredRanges();
            var offset = this.element.getBoundingClientRect();
            var container = this.container.getBoundingClientRect();
            for (var i = 0, len = filtered.length; i < len; i++) {
                var r = filtered[i];
                var rect = svg.createElement("rect");
                rect.setAttribute("x", String(r.left - offset.left + container.left));
                rect.setAttribute("y", String(r.top - offset.top + container.top));
                rect.setAttribute("height", String(r.height));
                rect.setAttribute("width", String(r.width));
                rect.setAttribute("fill", "none");
                var line = svg.createElement("line");
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
        var offset = container.getBoundingClientRect();
        var rect = el.getBoundingClientRect();
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

    exports.Highlight = Highlight;
    exports.Mark = Mark;
    exports.Pane = Pane;
    exports.Underline = Underline;

}));
//# sourceMappingURL=marks-pane.umd.js.map
