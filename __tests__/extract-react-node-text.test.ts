import React from 'react';
import { extractNodeString } from '../src/extract-react-node-text';

describe('extractNodeString', () => {
  it('collects text from React elements', () => {
    const el = React.createElement('div', null,
      'Hello ',
      React.createElement('span', null, 'World')
    );
    const text = extractNodeString(el).replace(/\s+/g, ' ').trim();
    expect(text).toBe('Hello World');
  });
});
