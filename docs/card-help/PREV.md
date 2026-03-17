# Data Preview

The **Data Preview** node displays a tabular summary of the data flowing through it. Use it as an inline debugger to inspect field names, types, and current values without interrupting the flow.

## Ports

- **Data** (input) — the data object to inspect
- **Pass** (output) — passes the data through unchanged

## Behavior

The preview renders a compact table inside the node body showing each field's name, inferred data type, and current value. The node is pass-through: data enters on the left and exits on the right without modification.

## Tips

- Insert a Data Preview between two nodes to inspect intermediate state
- The preview updates whenever new data arrives at the input port
- Useful during development for verifying data transformations
