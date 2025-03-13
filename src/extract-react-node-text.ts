import React from "react";

export const extractNodeString = (obj: any): string => {
  if (typeof obj === 'string') return obj;
  else if (Array.isArray(obj)) {
    return obj.map(e => extractNodeString(e)).filter(n => !!n).flat().join(' ');
  } else if (React.isValidElement(obj)) {
    obj = obj as React.ReactNode;
    return extractNodeString(obj.props.children);
  } else if (!obj) return '';
  return obj.toString();
}