import { describe, expect, it } from 'vitest';
import { createSnapshot, deserializeSnapshot, serializeSnapshot } from '../snapshot.js';
import type { LayoutSnapshot } from '../types.js';

describe('LayoutSnapshot serialization', () => {
  it('creates and rounds snapshot data accurately', () => {
    const snapshot = createSnapshot(320.4, 240.8, [
      { type: 'rect', x: 10.2, y: 15.7, width: 100.4, height: 50.1, borderRadius: 8.4 },
      { type: 'text', x: 10.1, y: 80.2, width: 200.3, height: 18.2 },
      { type: 'circle', x: 250.3, y: 10.4, width: 40.1, height: 40.2, borderRadius: 20.1 },
    ]);

    expect(snapshot.width).toBe(320);
    expect(snapshot.height).toBe(241);
    expect(snapshot.bones).toHaveLength(3);
    expect(snapshot.bones[0]).toEqual({
      type: 'rect',
      x: 10,
      y: 16,
      width: 100,
      height: 50,
      borderRadius: 8,
    });
    expect(snapshot.bones[1]).toEqual({
      type: 'text',
      x: 10,
      y: 80,
      width: 200,
      height: 18,
    });
    expect(snapshot.bones[2]).toEqual({
      type: 'circle',
      x: 250,
      y: 10,
      width: 40,
      height: 40,
      borderRadius: 20,
    });
  });

  it('serializes and deserializes correctly', () => {
    const original: LayoutSnapshot = {
      width: 400,
      height: 300,
      bones: [
        { type: 'rect', x: 0, y: 0, width: 400, height: 200 },
        { type: 'text', x: 16, y: 216, width: 250, height: 24 },
        { type: 'circle', x: 16, y: 250, width: 32, height: 32, borderRadius: 16 },
      ],
    };

    const serialized = serializeSnapshot(original);
    expect(typeof serialized).toBe('string');

    const deserialized = deserializeSnapshot(serialized);
    expect(deserialized).toEqual(original);
  });

  it('throws on invalid JSON deserialization', () => {
    expect(() => deserializeSnapshot('invalid json')).toThrow();
    expect(() => deserializeSnapshot('{"invalid":"data"}')).toThrow();
  });
});
