# Use Case Diagram

```mermaid
flowchart TD
    %% Actors
    User((User))
    Moderator((Moderator))
    Speaker((Speaker))
    Audience((Audience))
    Admin((System Admin))

    subgraph "Debate Room Architecture"
        UC1([Register / Login])
        UC2([View Leaderboard])
        UC3([Join Room])
        UC4([Create Debate Room])
        UC5([Assign Roles])
        UC6([Start / Stop Debate])
        UC7([Manage Round Timers])
        UC8([Submit Argument / Speech])
        UC9([Cast Vote])
        UC10([View Debate Results])
        UC11([System Maintenance])
    end

    %% User Base Actions
    User --> UC1
    User --> UC2
    User --> UC3

    %% Inheritance (Logical representation)
    Moderator --|> User
    Speaker --|> User
    Audience --|> User

    %% Moderator Actions
    Moderator --> UC4
    Moderator --> UC5
    Moderator --> UC6
    Moderator --> UC7

    %% Speaker Actions
    Speaker --> UC8

    %% Audience Actions
    Audience --> UC9
    Audience --> UC10

    %% Admin Actions
    Admin --> UC11
    Admin --> UC1
```

## Functional Scope
- **User (Base)**: Handles identity management, global leaderboard viewing, and room discovery.
- **Moderator**: Orchestrates the technical lifecycle of a debate, from room creation to round transition control.
- **Speaker**: The primary content provider; constrained by the system-enforced timers and speech slots.
- **Audience**: Passive participants who influence the room outcome via the voting system.
- **Admin**: Oversees system-wide performance, maintenance, and user accounts.
