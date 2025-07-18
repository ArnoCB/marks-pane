export default {
    proxyMouse: proxyMouse
};

/**
 * Start proxying all mouse events that occur on the target node to each node in
 * a set of tracked nodes.
 *
 * The items in tracked do not strictly have to be DOM Nodes, but they do have
 * to have dispatchEvent, getBoundingClientRect, and getClientRects methods.
 *
 * @param target The node on which to listen for mouse events.
 * @param tracked A (possibly mutable) array of nodes to which to proxy
 *                         events.
 */
export interface MarkLike {
  dispatchEvent: (e: Event) => void;
  getBoundingClientRect: () => DOMRect;
  getClientRects: () => DOMRectList | DOMRect[];
}

export function proxyMouse(target: Element, tracked: MarkLike[]) {
  let eventTarget: Node | Document = target;

  if (target.nodeName === "iframe" || target.nodeName === "IFRAME") {
    try {
      eventTarget = (target as HTMLIFrameElement).contentDocument || target;
    } catch (err) {
      eventTarget = target;
    }
  }

  function dispatch(e: MouseEvent | TouchEvent) {
    // We walk through the set of tracked elements in reverse order so that
    // events are sent to those most recently added first.
    //
    // This is the least surprising behaviour as it simulates the way the
    // browser would work if items added later were drawn "on top of"
    // earlier ones.
    for (var i = tracked.length - 1; i >= 0; i--) {
      var t = tracked[i];
      let x: number, y: number;

      if ("touches" in e && (e as TouchEvent).touches.length) {
        x = (e as TouchEvent).touches[0].clientX;
        y = (e as TouchEvent).touches[0].clientY;
      } else {
        x = (e as MouseEvent).clientX;
        y = (e as MouseEvent).clientY;
      }

      if (!contains(t, target, x, y)) continue;
      t.dispatchEvent(clone(e));
      break;
    }
  }

  for (const ev of ["mouseup", "mousedown", "click"]) {
    eventTarget.addEventListener(ev, (e) => dispatch(e as MouseEvent), false);
  }

  eventTarget.addEventListener(
    "touchstart",
    (e) => dispatch(e as TouchEvent),
    false
  );
}


/**
 * Clone a mouse event object.
 */
export function clone(e: MouseEvent | TouchEvent): MouseEvent | TouchEvent {
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
function contains(
  item: MarkLike,
  target: Element,
  x: number,
  y: number
): boolean {
  var offset = target.getBoundingClientRect();

  function rectContains(r: DOMRect, x: number, y: number): boolean {
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
