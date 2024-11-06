import React from "react";

/**
 * Extracts text content from a React node, array of nodes, or text string.
 * @param obj - The React node, array, or string to extract text from.
 * @returns The extracted text content as a string.
 */
function extractNodeString(obj: React.ReactNode): string {
  if (typeof obj === 'string') {
    return obj;
  } else if (Array.isArray(obj)) {
    return obj
      .map(e => extractNodeString(e))
      .filter(n => !!n) // Filter out any falsy values
      .flat() // Flatten the array of strings
      .join(' '); // Join array elements into a single string
  } else if (React.isValidElement(obj)) {
    return extractNodeString(obj.props.children);
  } else if (!obj) {
    return '';
  }

  return obj.toString();
}

export default extractNodeString;
