# Comment

The **Comment** node is a floating annotation for documenting flow logic. It has no input or output ports and does not participate in data flow execution.

## Usage

Drop a Comment node anywhere on the canvas to add context, explain design decisions, or leave notes for collaborators. The note text is stored in the node's `Data.NoteText` property and displayed directly in the node body.

## Properties

- **NoteText** — the annotation content displayed in the node body

## Tips

- Use comments to explain complex branching logic or non-obvious configuration choices
- Comment nodes can be freely repositioned without affecting connections
- Group related comments near the nodes they describe
