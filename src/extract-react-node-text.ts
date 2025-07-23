import React from "react";

/**
 * Extracts all text nodes from a React element tree.
 *
 * @param obj - React node or primitive value to extract text from.
 * @returns A string containing all text from the node tree.
 *
 * @example
 * ```tsx
 * const element = <div>Hello <span>World</span></div>;
 * const text = extractNodeString(element);
 * console.log(text); // "Hello World"
 * ```
 */
export const extractNodeString = (obj: any): string => {
  if (typeof obj === "string") return obj;
  if (Array.isArray(obj)) {
    return obj.map(e => extractNodeString(e)).filter(Boolean).flat().join(" ");
  }
  if (React.isValidElement(obj)) {
    const node = obj as React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - props may not exist for some nodes
    return extractNodeString(node.props.children);
  }
  if (!obj) return "";
  return obj.toString();
};
