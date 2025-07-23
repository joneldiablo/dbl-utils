import { flatten, unflatten } from "../src/flat";

describe("flatten", () => {
  it("should flatten a simple object", () => {
    const input = { a: 1, b: { c: 2, d: 3 } };
    const expected = { a: 1, "b.c": 2, "b.d": 3 };
    const result = flatten(input);
    expect(result).toEqual(expected);
  });

  it("should flatten an object with arrays", () => {
    const input = { a: [1, 2, { b: 3 }] };
    const expected = { "a.0": 1, "a.1": 2, "a.2.b": 3 };
    const result = flatten(input);
    expect(result).toEqual(expected);
  });

  it("should omit specified keys", () => {
    const input = { a: [1, 4, 5], b: { c: 2, d: 3 } };
    const expected = { "a.0": 1, "a.1": 4, "a.2": 5, b: { c: 2, d: 3 } };
    const result = flatten(input, { ommit: ["b"] });
    expect(result).toEqual(expected);
  });

  it("should use custom delimiter", () => {
    const input = { a: 1, b: { c: 2, d: 3 } };
    const expected = { a: 1, "b-c": 2, "b-d": 3 };
    const result = flatten(input, { delimiter: "-" });
    expect(result).toEqual(expected);
  });

  it("should omit arrays if specified", () => {
    const input = { a: [1, 2, { b: 3 }] };
    const expected = { a: [1, 2, { b: 3 }] };
    const result = flatten(input, { ommitArrays: true });
    expect(result).toEqual(expected);
  });

  it("should apply custom omit function", () => {
    const input = { a: 1, b: { c: { e: 2 }, d: 3 } };
    const expected = { a: 1, "b.c": { e: 2 }, "b.d": 3 };
    const result = flatten(input, { ommitFn: (key) => key === "c" });
    expect(result).toEqual(expected);
  });
});

describe("unflatten", () => {
  it("should unflatten a simple object", () => {
    const input = { a: 1, "b.c": 2, "b.d": 3 };
    const expected = { a: 1, b: { c: 2, d: 3 } };
    const result = unflatten(input);
    expect(result).toEqual(expected);
  });

  it("should unflatten an object with arrays", () => {
    const input = { "a.0": 1, "a.1.0": 2, "a.2.b": [3] };
    const expected = { a: [1, [2], { b: [3] }] };
    const result = unflatten(input);
    expect(result).toEqual(expected);
  });

  it("should unflatten an object with arrays at the end", () => {
    const input = {
      "note/to/0": "John",
      "note/from/0": "Jane",
      "note/heading/0/$": { attr: "value" },
      "note/uuid/0": "1234-5678-91011",
    };
    const expected = {
      note: {
        to: ["John"],
        from: ["Jane"],
        heading: [{ $: { attr: "value" } }],
        uuid: ["1234-5678-91011"],
      },
    };

    const result = unflatten(input, "/");
    expect(result).toEqual(expected);
  });

  it("should use custom delimiter", () => {
    const input = { a: 1, "b-c": 2, "b-d": 3 };
    const expected = { a: 1, b: { c: 2, d: 3 } };
    const result = unflatten(input, "-");
    expect(result).toEqual(expected);
  });
  
  it("should return exactly the same object readed", () => {
    const obj = require("./unflatten-obj.json");
    const flattenValue = flatten(obj, { delimiter: "/" });
    console.log(flattenValue);
    const unflattenValue = unflatten(flattenValue, "/");
    console.log(unflattenValue);
    expect(JSON.stringify(flattenValue)).toEqual(
      JSON.stringify(unflattenValue)
    );
  });
});
