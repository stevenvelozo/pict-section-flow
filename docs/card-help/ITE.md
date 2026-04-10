# If-Then-Else

The **If-Then-Else** node evaluates a boolean condition expression and routes the flow to one of two outputs.

## Ports

- **In** (input) -- trigger that starts the evaluation
- **Then** (output) -- activated when the condition is **true**
- **Else** (output) -- activated when the condition is **false**

## Behavior

When the input fires, the node evaluates the configured condition expression against the current flow context. If the expression resolves to a truthy value, the **Then** output is activated. Otherwise, the **Else** output is activated. Exactly one output fires per evaluation.

## Configuration

Set the condition expression in the node's data properties. The expression is evaluated in the flow context, giving it access to any variables set by upstream Set Value nodes.

## Tips

- Chain multiple If-Then-Else nodes for complex branching logic
- Connect the **Else** output to another If-Then-Else to build else-if chains
- Use descriptive condition expressions to keep the flow self-documenting
