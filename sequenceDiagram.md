# Sequence Diagram: Full Debate Session Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant AuthCtrl as AuthController
    participant AuthSvc as AuthService
    participant RoomCtrl as RoomController
    participant RoomSvc as RoomService
    participant DebSvc as DebateService
    participant Timer as TimerManager
    participant VoteSvc as VotingService
    participant DB as Database

    Note over User, DB: 1. Authentication Phase
    User->>AuthCtrl: POST /login (credentials)
    AuthCtrl->>AuthSvc: authenticate(credentials)
    AuthSvc->>DB: findUserByEmail()
    DB-->>AuthSvc: userData
    AuthSvc-->>AuthCtrl: JWT Token
    AuthCtrl-->>User: 200 OK (Token)

    Note over User, DB: 2. Room Creation Phase
    User->>RoomCtrl: POST /rooms (topic, rules, JWT)
    RoomCtrl->>RoomSvc: createRoom(userId, roomData)
    RoomSvc->>DB: saveRoom(roomData)
    DB-->>RoomSvc: roomEntity
    RoomSvc-->>RoomCtrl: success(roomId)
    RoomCtrl-->>User: 201 Created

    Note over User, DB: 3. Debate Initialization & Round Management
    User->>RoomCtrl: POST /rooms/{id}/start
    RoomCtrl->>DebSvc: startDebate(roomId)
    DebSvc->>DB: updateStatus("IN_PROGRESS")
    
    loop Debate Rounds (Opening -> Rebuttal -> Closing)
        DebSvc->>Timer: startRoundTimer(duration)
        loop Per Second
            Timer->>User: Event: TIMER_TICK
        end
        User->>DebSvc: Submit Expression/Argument
        DebSvc->>DB: persistTranscript(content)
        Timer-->>DebSvc: roundExpired()
    end

    Note over User, DB: 4. Voting & Conclusion
    DebSvc->>VoteSvc: initializeVoting(roomId)
    User->>VoteSvc: Cast Vote (candidateId)
    VoteSvc->>DB: recordVote(voterId, roomId)
    
    VoteSvc->>VoteSvc: calculateWinner()
    VoteSvc->>DB: saveFinalResults(winnerData)
    VoteSvc-->>DebSvc: votingConcluded(results)
    
    DebSvc->>User: Event: DEBATE_CONCLUDED (Results)
```

## Architectural Interaction Breakdown
1. **Authentication**: Handled by dedicated `AuthController` and `AuthService` to ensure security is abstracted from business logic.
2. **Room Management**: `RoomController` orchestrates the setup phase, ensuring only authorized users can create structured rooms.
3. **Domain Orchestration**: `DebateService` acts as the primary coordinator, delegating time-keeping to `TimerManager` and voting logic to `VotingService`.
4. **Data Integrity**: All state transitions and transcripts are synchronized with the `Database` through the service layer, maintaining a strict audit trail.
5. **Separation of Concerns**: Each service is responsible for a single domain (Auth, Room, Timing, Voting), adhering to SOLID principles.
