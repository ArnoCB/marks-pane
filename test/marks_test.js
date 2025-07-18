import { expect } from "referee";
import sinon from "sinon";
import svg from "../src/svg";
import events from "../src/events";
import { Pane, Mark, Highlight, Underline } from "../src/marks";

describe("Pane", function() {
  let target, container, pane;
  beforeEach(function() {
    container = document.createElement("div");
    document.body.appendChild(container);
    target = document.createElement("div");
    container.appendChild(target);
    pane = new Pane(target, container);
  });
  
  afterEach(function() {
    document.body.removeChild(container);
  });

  it("should create an SVG element", function() {
    expect(pane.element.nodeName).toEqual("svg");
  });

  it("should add and remove marks", function() {
    const mark = new Mark();
    pane.addMark(mark);
    expect(pane.marks.length).toEqual(1);
    pane.removeMark(mark);
    expect(pane.marks.length).toEqual(0);
  });
});

describe("Mark", function() {
  it("should bind and unbind elements", function() {
    const mark = new Mark();
    const el = document.createElement("g");
    mark.bind(el, document.body);
    expect(mark.element).toBe(el);
    expect(mark.unbind()).toBe(el);
    expect(mark.element).toBe(null);
  });
});

describe("Highlight", function() {
  it("should set data and attributes on bind", function() {
    const range = { getClientRects: () => [], getBoundingClientRect: () => ({}) };
    const el = document.createElement("g");
    const highlight = new Highlight(range, "test-class", { foo: "bar" }, { baz: "qux" });
    highlight.bind(el, document.body);
    expect(el.dataset.foo).toEqual("bar");
    expect(el.getAttribute("baz")).toEqual("qux");
    expect(el.classList.contains("test-class")).toBe(true);
  });
});

describe("Underline", function() {
  it("should inherit from Highlight", function() {
    const range = { getClientRects: () => [], getBoundingClientRect: () => ({}) };
    const underline = new Underline(range, "underline-class");
    expect(underline instanceof Highlight).toBe(true);
  });
});
