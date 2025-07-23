import { serialize, deserialize } from '../src/flat';

describe('serialize/deserialize', () => {
  it('round trips objects', async () => {
    const input = [{ a: 1, b: { c: 2 } }];
    const entries = await serialize(input);
    const output = await deserialize(entries as any) as any[];
    expect(output[0].a).toBe(1);
    expect(output[0].b).toEqual({ c: 2 });
  });
});
