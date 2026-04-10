# File Read

The **File Read** node reads the contents of a file from the filesystem and outputs the data.

## Ports

- **Path** (input) -- the filesystem path to read
- **Data** (output) -- the file contents on success
- **Error** (output) -- fires if the read operation fails

## Properties

- **FilePath** -- the path to the file to read
- **Encoding** -- character encoding for text files (e.g. `utf8`, `ascii`)

## Behavior

When triggered, the node reads the file at the configured path. On success, the raw file contents are emitted from the **Data** output. If the file does not exist or cannot be read, the **Error** output fires with a descriptive error message.

## Tips

- Use a Get Value node upstream to dynamically set the file path
- Pair with a Data Preview node to inspect the file contents
- Connect the **Error** output to logging or notification nodes for robust error handling
