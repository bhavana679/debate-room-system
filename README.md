# Debate Room System

## Overview
The **Debate Room System** is a structured, state-driven platform designed to facilitate formal debates through strictly enforced rules and protocols. Unlike generic real-time communication tools, this system acts as a digital parliament where the backend manages the debate lifecycle, ensuring logical flow, timed participation, and objective evaluation.

The system is architected with a **75% focus on backend reliability**, emphasizing a state-machine approach to manage room transitions, real-time synchronization, and persistence.

## Key Features
- **Statutory Authentication**: Secure session management using JWT-based identity verification.
- **Role-Based Room Execution**: Context-aware permissions for Moderators, Speakers (Proposition/Opposition), and Audience members.
- **State-Driven Lifecycle**: Managed transitions between debate phases (Opening Statements, Rebuttals, Closing Arguments).
- **Synchronized Timer Orchestration**: Server-authoritative high-precision timers synced via WebSockets to prevent client-side drift.
- **Calculated Voting & Results**: Strategy-based voting system with automated result finalization and archival.
- **Global Leaderboard**: Data-driven ranking system based on win rates, reputation, and participation history.

## System Architecture
The application adheres to **Clean Architecture** principles to ensure cross-layer decoupling and high testability:

- **Controller Layer**: Handles request orchestration, input validation, and standardized response mapping for HTTP and WebSocket events.
- **Service Layer**: The core domain engine. It hosts the business logic, including the room state machine, timer logic, and voting algorithms.
- **Repository Layer**: Implements the Data Mapper pattern to abstract persistence logic, ensuring the domain remains agnostic of the underlying database implementation.
- **Domain Models**: Rich TypeScript objects that encapsulate business rules and internal state, ensuring data validity across the system.
- **Separation of Concerns**: Each layer operates independently, communicating through predefined interfaces to maintain a modular and scalable codebase.

## Design Principles
The backend is built using objective-oriented principles and industry-standard patterns:
- **OOP (Object-Oriented Programming)**: Utilization of **Encapsulation** for service logic, **Abstraction** via interfaces, and **Inheritance** for user role specializations.
- **SOLID Principles**: Focused on high cohesion and low coupling (e.g., Dependency Inversion for repository injection).
- **Design Patterns**: 
    - **State Pattern**: To manage the complex transitions of a debate room's operational status.
    - **Strategy Pattern**: To allow interchangeable voting logic (e.g., Simple Majority vs. Weighted Reputation voting).

## Database Design
The system uses a **normalized relational schema (3NF)** to ensure data integrity and auditability:
- **Relational Structure**: Clearly defined entities for Users, Rooms, Participants, and History.
- **Referential Integrity**: Strict foreign key constraints and junction tables (e.g., `RoomParticipants`) to manage N:M relationships.
- **Performance**: Strategic indexing on frequently queried fields like `room_id`, `user_id`, and `created_at` for efficient history retrieval.

## API & Real-Time Communication
- **REST APIs**: Used for administrative actions, authentication, and historical data retrieval.
- **WebSockets (Socket.io)**: Powers the real-time core of the system, handling live event broadcasts, synchronized timers, and instantaneous speech submissions.

## Tech Stack
- **Backend**: Node.js, TypeScript, Express, Socket.io
- **Frontend**: React, TypeScript, (Tailwind CSS for layout)
- **Database**: PostgreSQL / MongoDB (depending on final persistence strategy)

## Project Structure
```text
debate-room-system/
├── src/
│   ├── api/
│   │   ├── controllers/      # Request handling
│   │   ├── middleware/       # Auth & Validation
│   │   └── routes/           # API Endpoints
│   ├── core/
│   │   ├── services/         # Business Logic (FSM & Timers)
│   │   ├── domain/           # Models & Types
│   │   └── interfaces/       # Abstractions
│   ├── infrastructure/
│   │   ├── repositories/     # Data Access
│   │   └── database/         # Connections & Schema
│   └── tests/                # Unit & Integration tests
├── docs/                     # System Design Documentation
└── public/                   # Static Assets
```

## Setup Instructions
1. **Clone & Install**: `npm install` in both root and client directories.
2. **Environment**: Configure `.env` with JWT secrets and Database URIs.
3. **Run Backend**: `npm run dev:server`
4. **Run Frontend**: `npm run dev:client`

## Future Improvements
- **Automated Transcriptions**: Integration of speech-to-text models for real-time round history.
- **Video Stream Integration**: Native WebRTC support for high-fidelity debating.
- **Elasticsearch Support**: Enhanced indexing for searching thousands of historical debate transcripts.
