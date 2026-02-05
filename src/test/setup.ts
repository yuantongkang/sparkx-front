import { JSDOM } from "jsdom";
import { afterEach } from "bun:test";
import { cleanup } from "@testing-library/react";

if (
  typeof window === "undefined" ||
  typeof document === "undefined" ||
  !document.body
) {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/",
  });

  const testGlobal = globalThis as typeof globalThis & {
    window: Window & typeof globalThis;
    document: Document;
    navigator: Navigator;
  };

  testGlobal.window = dom.window as unknown as Window & typeof globalThis;
  testGlobal.document = dom.window.document;
  testGlobal.navigator = dom.window.navigator;
}

afterEach(() => {
  cleanup();
});
