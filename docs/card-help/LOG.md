# Log Values

The **Log Values** node writes incoming data to the console or log output for debugging purposes.

## Ports

- **Values** (input, multi) — accepts one or more connections carrying values to log
- **Pass** (output) — passes the last received value through unchanged

## Properties

- **LogLevel** — the severity level for the log entry (e.g. `info`, `warn`, `error`, `trace`)
- **Format** — an optional format string controlling how values are serialized

## Behavior

When data arrives at any input connection, the node serializes the value and writes it to the configured log output at the specified log level. The data is then forwarded to the **Pass** output unchanged, so the Log Values node can be inserted inline without disrupting the flow.

## Tips

- Use multiple input connections to aggregate log output from parallel branches
- Set the log level to `trace` during development and `warn` in production flows
- Insert between any two nodes for quick inline debugging
