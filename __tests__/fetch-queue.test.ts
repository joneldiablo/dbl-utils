import FetchQueue from '../src/fetch-queue';

describe('FetchQueue', () => {
  it('deduplicates identical requests', async () => {
    const fetchMock = jest.fn().mockResolvedValue('ok');
    const queue = new FetchQueue(fetchMock);

    const p1 = queue.addRequest('http://example.com');
    const p2 = queue.addRequest('http://example.com');

    const [r1, r2] = await Promise.all([p1, p2]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(r1).toBe('ok');
    expect(r2).toBe('ok');
  });

  it('handles different requests separately', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce('one')
      .mockResolvedValueOnce('two');
    const queue = new FetchQueue(fetchMock);

    const r1 = queue.addRequest('u1');
    const r2 = queue.addRequest('u2');
    const [res1, res2] = await Promise.all([r1, r2]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res1).toBe('one');
    expect(res2).toBe('two');
  });
});

