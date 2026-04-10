# Status Monitor

The **Status Monitor** node monitors the health status of upstream services and reports availability.

## Ports

- **Check** (input, multi) -- accepts connections from one or more services to monitor
- **Healthy** (output) -- fires when all monitored services report healthy
- **Degraded** (output) -- fires when one or more services report degraded status

## Behavior

The node body displays a visual health grid showing the status of each monitored service with colored indicators. Green indicates a healthy service; yellow indicates degraded performance. When all services are healthy, the **Healthy** output is activated. If any service reports degraded status, the **Degraded** output fires instead.

## Appearance

The node body renders SVG status circles labeled with service names (e.g. API, DB, Cache, Queue). Port labels appear on hover for a cleaner default appearance.

## Tips

- Connect multiple services to the **Check** input to build a comprehensive health dashboard
- Route the **Degraded** output to notification or alerting nodes
- Combine with an Each node to check a dynamic list of service endpoints
