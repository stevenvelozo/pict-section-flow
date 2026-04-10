# Sparkline

The **Sparkline** node renders a live sparkline chart visualizing numeric throughput data directly in the node body.

## Ports

- **Values** (input) -- a numeric array or stream of values to plot
- **Stats** (output) -- emits computed statistics (min, max, mean) for the data set

## Behavior

The node draws a compact line chart inside the node body using a canvas renderer. As new numeric data arrives at the input, the chart updates to reflect the latest values. The filled area under the line and an endpoint dot provide visual emphasis on the current value.

## Appearance

The chart uses the node's theme color for the line and fill area. The last data point is highlighted with a dot. The sparkline scales automatically to fit the available body area.

## Tips

- Connect to any node that produces a numeric array for instant visualization
- Use alongside a Data Preview node for combined visual and tabular inspection
- The Stats output is useful for feeding threshold values into an If-Then-Else node
