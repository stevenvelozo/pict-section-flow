# Set Value

The **Set Value** node assigns a value to a named variable in the flow context.

## Ports

- **In** (input) -- trigger to perform the assignment
- **Out** (output) -- fires after the value has been set

## Properties

- **Variable Name** -- the key under which the value will be stored
- **Value Expression** -- the expression to evaluate and assign

## Behavior

When triggered, the node evaluates the **Value Expression** and stores the result under the configured **Variable Name** in the flow context. Downstream nodes can read this value using a **Get Value** node with the same variable name.

## Configuration

Open the properties panel to configure the variable name and value expression using the built-in form editor.

## Tips

- Variable names are case-sensitive -- use consistent naming conventions
- Value expressions have access to the current flow context
- Use Set Value at the beginning of a flow to initialize default variables
