# Switch

The **Switch** node routes execution to one of multiple outputs based on a matching value, similar to a switch/case statement in programming.

## Ports

- **In** (input) -- the value to match against cases
- **Case A** (output) -- fires when the input matches case A
- **Case B** (output) -- fires when the input matches case B
- **Default** (output) -- fires when the input does not match any defined case

## Behavior

When a value arrives at the input, the node compares it against each configured case. The first matching case's output is activated. If no case matches, the **Default** output fires. Only one output is activated per evaluation.

## Configuration

Define case match values in the node's data properties. Each case corresponds to one of the named outputs.

## Tips

- Add more output ports by extending the card definition for additional cases
- Use the **Default** output as a catch-all for unexpected values
- Chain a Switch after an If-Then-Else for multi-level routing logic
- Case matching is based on strict equality
