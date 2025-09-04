import { EventHandler } from '../src/event-handler';

describe('EventHandler', () => {

  let eventHandler: EventHandler;

  beforeEach(() => {
    eventHandler = new EventHandler();
  });

  it('should subscribe to and dispatch an event', async () => {
    const mockCallback = jest.fn().mockResolvedValue('callback response');
    eventHandler.subscribe('testEvent', mockCallback, 'testId');

    const responses = await eventHandler.dispatch('testEvent', 'data1', 'data2');

    expect(mockCallback).toHaveBeenCalledWith('data1', 'data2', 'testId');
    expect(responses).toEqual(['callback response']);
  });

  it('should unsubscribe from an event', async () => {
    const mockCallback = jest.fn();
    eventHandler.subscribe('testEvent', mockCallback, 'testId');

    // Dispatch before unsubscribe
    await eventHandler.dispatch('testEvent');
    expect(mockCallback).toHaveBeenCalledTimes(1);

    eventHandler.unsubscribe('testEvent', 'testId');

    // Dispatch after unsubscribe
    await eventHandler.dispatch('testEvent');
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should handle wildcards in subscriptions', async () => {
    const mockCallback = jest.fn().mockResolvedValue('wildcard response');
    eventHandler.subscribe('test*', mockCallback, 'wildcardId');

    const responses = await eventHandler.dispatch('testWildCard___', 'data1', 'data2');

    expect(mockCallback).toHaveBeenCalledWith('data1', 'data2', 'wildcardId');
    expect(responses).toEqual(['wildcard response']);
  });

  it('should update cache correctly when unsubscribing', async () => {
    const mockCallback = jest.fn();
    eventHandler.subscribe('testEvent', mockCallback, 'testId');
    await eventHandler.dispatch('testEvent');

    eventHandler.unsubscribe('testEvent', 'testId');

    // Manually checking cache should not have testEvent anymore
    const cacheKeyExist = () => 'testEvent' in (eventHandler as any).cache;
    expect(cacheKeyExist()).toBe(false);
  });

  it('supports multiple callbacks for the same wildcard pattern', async () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    eventHandler.subscribe('user.*', cb1, 'id1');
    eventHandler.subscribe('user.*', cb2, 'id2');
    await eventHandler.dispatch('user.login');
    expect(cb1).toHaveBeenCalled();
    expect(cb2).toHaveBeenCalled();
  });

  it('removes pattern subscriptions from cache', async () => {
    const cb = jest.fn();
    eventHandler.subscribe('test*', cb, 'id');
    await eventHandler.dispatch('testValue');
    expect((eventHandler as any).cache.testValue).toBeDefined();
    eventHandler.unsubscribe('test*', 'id');
    expect((eventHandler as any).cache.testValue).toBeUndefined();
  });

});

