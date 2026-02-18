# Use Case Diagram

```mermaid
useCaseDiagram
    actor "User" as U
    actor "Moderator" as M
    actor "Speaker" as S
    actor "Audience" as A
    actor "System Admin" as Admin

    package "Debate Room Architecture" {
        usecase "Register / Login" as UC1
        usecase "View Leaderboard" as UC2
        usecase "Join Room" as UC3
        usecase "Create Debate Room" as UC4
        usecase "Assign Roles" as UC5
        usecase "Start / Stop Debate" as UC6
        usecase "Manage Round Timers" as UC7
        usecase "Submit Argument / Speech" as UC8
        usecase "Cast Vote" as UC9
        usecase "View Debate Results" as UC10
        usecase "System Maintenance" as UC11
    }

    %% User Base Actions
    U --> UC1
    U --> UC2
    U --> UC3

    %% Moderator Inheritance & Actions
    M --|> U
    M --> UC4
    M --> UC5
    M --> UC6
    M --> UC7

    %% Speaker Inheritance & Actions
    S --|> U
    S --> UC8

    %% Audience Inheritance & Actions
    A --|> U
    A --> UC9
    A --> UC10

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
