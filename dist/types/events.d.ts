declare const _default: {
    proxyMouse: typeof proxyMouse;
};
export default _default;
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
export declare function proxyMouse(target: Element, tracked: MarkLike[]): void;
/**
 * Clone a mouse event object.
 */
export declare function clone(e: MouseEvent | TouchEvent): MouseEvent | TouchEvent;
