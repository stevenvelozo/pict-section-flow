# File Write

The **File Write** node writes data to a file on the filesystem.

## Ports

- **Path** (input) -- the destination filesystem path
- **Data** (input) -- the content to write
- **Done** (output) -- fires after a successful write
- **Error** (output) -- fires if the write operation fails

## Behavior

When both inputs are satisfied, the node writes the provided data to the specified file path. On success the **Done** output fires. If the write fails (for example due to permissions or a missing directory), the **Error** output fires with a descriptive error message.

## Properties Panel

The properties panel shows a View-based info panel with details about the configured file path and write options.

## Tips

- Directories in the path are not created automatically -- ensure they exist before writing
- Combine with a Set Value node to format data before writing
- Connect the **Error** output to a Log Values node to capture write failures
