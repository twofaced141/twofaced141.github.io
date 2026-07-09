const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
  'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON', 'AND', 'OR', 'NOT', 'IN',
  'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'AS', 'DISTINCT',
  'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
  'UNION', 'ALL', 'INTERSECT', 'EXCEPT',
  'ASC', 'DESC',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW',
  'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'DEFAULT', 'CHECK', 'UNIQUE', 'CONSTRAINT',
  'INNER', 'OUTER', 'FULL', 'CROSS', 'LEFT', 'RIGHT',
  'TRUE', 'FALSE',
];

const CLAUSE_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE',
  'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN',
  'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
  'UNION', 'INTERSECT', 'EXCEPT',
  'AND', 'OR', 'ON',
];

const CLAUSE_SORTED = [...CLAUSE_KEYWORDS].sort((a, b) => b.length - a.length);
const KW_SORTED = [...SQL_KEYWORDS].sort((a, b) => b.length - a.length);

export function formatSQL(sql: string): string {
  let s = sql.replace(/\s+/g, ' ').trim();
  if (!s) return s;

  for (const kw of KW_SORTED) {
    const pat = kw.replace(/\s+/g, '\\s+');
    s = s.replace(new RegExp('\\b' + pat + '\\b', 'gi'), kw);
  }

  let out = '';
  let inStr = false;
  let quote = '';

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (!inStr && (ch === "'" || ch === '"')) {
      inStr = true;
      quote = ch;
      out += ch;
      continue;
    }
    if (inStr && ch === quote && (i === 0 || s[i - 1] !== '\\')) {
      inStr = false;
      out += ch;
      continue;
    }

    if (!inStr) {
      let hit = false;
      for (const kw of CLAUSE_SORTED) {
        if (i + kw.length <= s.length && s.substring(i, i + kw.length) === kw) {
          const prev = i > 0 ? s[i - 1] : ' ';
          const next = i + kw.length < s.length ? s[i + kw.length] : ' ';
          if (!/\w/.test(prev) && !/\w/.test(next)) {
            if (i > 0 && out[out.length - 1] !== '\n') out += '\n';
            out += kw;
            i += kw.length - 1;
            hit = true;
            break;
          }
        }
      }
      if (hit) continue;
      out += ch;
    } else {
      out += ch;
    }
  }

  const lines = out.split('\n').map(l => l.trim()).filter(Boolean);
  const indented = lines.map((line, idx) => {
    if (idx === 0) return line;
    const fw = line.split(/\s+/)[0].toUpperCase();
    if (fw === 'AND' || fw === 'OR') return '        ' + line;
    if (fw === 'ON') return '        ' + line;
    if (['FROM', 'WHERE', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'JOIN',
         'GROUP', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET',
         'VALUES', 'SET', 'UNION', 'INTERSECT', 'EXCEPT',
         'INSERT', 'UPDATE', 'DELETE'].includes(fw)) {
      return '    ' + line;
    }
    return '    ' + line;
  });

  return indented.join('\n').trim();
}
