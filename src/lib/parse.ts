export function parseParams(input: string): unknown[] | Record<string, unknown> {
  const t = input.trim();
  if (!t) return [];

  if (t.startsWith('[') || t.startsWith('{')) {
    return JSON.parse(t);
  }

  if (t.includes(',')) {
    return t.split(',').map(s => {
      const v = s.trim();
      if (!v || v === 'null') return null;
      if (v === 'true') return true;
      if (v === 'false') return false;
      if (!isNaN(Number(v)) && v.length > 0) return Number(v);
      if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) return v.slice(1, -1);
      return v;
    });
  }

  const v = t;
  if (v === 'null') return [null];
  if (v === 'true') return [true];
  if (v === 'false') return [false];
  if (!isNaN(Number(v))) return [Number(v)];
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) return [v.slice(1, -1)];
  return [v];
}
