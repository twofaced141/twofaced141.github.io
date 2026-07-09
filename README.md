# format my sql

Inject parameters into raw SQL and format the result — CLI & web tool.

```bash
# one query
sqlformat "SELECT * FROM t WHERE id = ?" "[42]"

# batch from file (pairs: SQL line, params line)
cat queries.txt | sqlformat > formatted.sql
```

## Install

```bash
sudo npm install -g format-my-sql
```

or via `npx`:

```bash
npx -p format-my-sql sqlformat "SELECT * FROM t WHERE id = ?" "[42]"
```

## Placeholder styles

| Style | Example | Params |
|-------|---------|--------|
| `?` | `WHERE id = ?` | `[1]` |
| `$1` | `WHERE id = $1` | `[1]` |
| `:name` | `WHERE id = :id` | `{"id":1}` |

## Web

Client-side only, no backend → [formatmysql.vercel.app](https://formatmysql.vercel.app)

## License

MIT
