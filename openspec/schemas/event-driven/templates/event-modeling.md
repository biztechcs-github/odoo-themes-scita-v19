## Overview

<!-- Brief description of the flow being modeled, derived from event-storming -->

## Swim Lane Flows

<!-- One section per flow: Trigger -> Command -> Event -> Read Model -->

### Flow: <!-- flow name -->

| Lane | Detail |
|---|---|
| **Trigger** | <!-- human action or system signal --> |
| **Command** | <!-- operation name, domain context, business rules --> |
| **Event** | <!-- what occurred, data payload, ordering/dedup notes --> |
| **Read Model** | <!-- resulting projection, queries supported --> |

## Timeline Diagram (Mermaid)

```mermaid
flowchart LR
    style Actor fill:#FFD700
    style Cmd fill:#4169E1,color:#fff
    style Evt fill:#FF8C00,color:#fff
    style Policy fill:#800080,color:#fff
    style RM fill:#228B22,color:#fff

    Actor([Actor])-->Cmd[Command]
    Cmd-->Evt([Event])
    Evt-->Policy{Policy}
    Policy-->Cmd2[FollowUpCommand]
    Evt-->RM[(ReadModel)]
```

## Downstream Handoff

- **Specs**: user stories to derive from these flows
- **Design**: broker, subject naming, payload formats to decide
- **AsyncAPI**: channels and message schemas to formalise
