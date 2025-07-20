export declare class Pane {
    private target;
    private element;
    private marks;
    private container;
    constructor(target: Element, container?: HTMLElement);
    addMark(mark: Mark): Mark;
    removeMark(mark: Mark): void;
    render(): void;
}
export declare class Mark {
    protected element: Element | null;
    protected container: HTMLElement | null;
    protected range: Range | null;
    constructor();
    bind(element: Element, container: HTMLElement): void;
    unbind(): Element | null;
    render(): void;
    dispatchEvent(e: Event): void;
    getBoundingClientRect(): DOMRect;
    getClientRects(): DOMRect[];
    filteredRanges(): DOMRect[];
}
export declare class Highlight extends Mark {
    private className;
    private data;
    private attributes;
    constructor(range: Range | null, className: string, data?: Record<string, string>, attributes?: Record<string, string>);
    bind(element: Element, container: HTMLElement): void;
    render(): void;
}
export declare class Underline extends Highlight {
    constructor(range: Range | null, className: string, data?: Record<string, string>, attributes?: Record<string, string>);
    render(): void;
}
