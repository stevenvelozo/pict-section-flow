# Get Value

The **Get Value** node retrieves a named variable from the flow context and emits its current value.

## Ports

- **In** (input) -- trigger to read the value
- **Value** (output) -- the retrieved value

## Behavior

When triggered, the node looks up a named key in the flow context and emits the stored value from the **Value** output. If the key does not exist, the output value is `undefined`.

## Usage

Pair with a **Set Value** node to establish a read/write variable pattern. The Set Value node stores a value under a named key; the Get Value node retrieves it downstream.

## Tips

- Variable names are case-sensitive
- Use descriptive variable names to keep flows readable
- Get Value is especially useful for accessing values set in a different branch of the flow
