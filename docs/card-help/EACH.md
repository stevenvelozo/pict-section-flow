# Each (Loop Iterator)

The **Each** node iterates over a collection, executing connected downstream nodes once for each item. When iteration completes, the **Done** output fires.

## Ports

- **Collection** (input) — an array or iterable to loop over
- **Item** (output) — fires once per element with the current item
- **Done** (output) — fires after all items have been processed

## Behavior

When a collection arrives at the input port, the Each node processes items sequentially. For every element in the collection, the **Item** output is activated with the current element as the payload. After the final element is processed, the **Done** output fires to signal completion.

## Tips

- Connect **Item** to a processing chain and **Done** to continuation logic
- Nested loops are supported by chaining multiple Each nodes
- Empty collections skip directly to the **Done** output
