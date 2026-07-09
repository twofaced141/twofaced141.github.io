import { escapeSQLValue } from './escape';

export function injectParams(sql: string, params: unknown[] | Record<string, unknown>): string {
  let result = sql;
  const hasQ = /\?/.test(result);
  const hasDollar = /\$\d+/.test(result);
  const hasNamed = /:\w+/.test(result);

  if (Array.isArray(params)) {
    if (hasQ) {
      let i = 0;
      result = result.replace(/\?/g, () => (i < params.length ? escapeSQLValue(params[i++]) : '?'));
    }
    if (hasDollar) {
      result = result.replace(/\$(\d+)/g, (_, n) => {
        const idx = parseInt(n, 10) - 1;
        return idx >= 0 && idx < params.length ? escapeSQLValue(params[idx]) : '$' + n;
      });
    }
  } else if (typeof params === 'object' && params !== null) {
    if (hasNamed) {
      result = result.replace(/:(\w+)/g, (_, name) =>
        name in params ? escapeSQLValue((params as Record<string, unknown>)[name]) : ':' + name
      );
    }
  }

  return result;
}
