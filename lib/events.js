export default {
    proxyMouse: proxyMouse
};
export function proxyMouse(target, tracked) {
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
export function clone(e) {
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
