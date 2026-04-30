# Debate Room Application

## Problem Statement
In the digital age, online discourse is often characterized by unstructured arguments, lack of moderation, and a "shouting match" culture. Popular social platforms and chat applications do not support formal debate protocols, making it difficult for educational institutions, debate clubs, and intellectual communities to host structured, timed, and moderated discussions. Without a system-enforced flow, speakers are frequently interrupted, time limits are ignored, and there is no objective mechanism for audience-driven evaluation or historical record-keeping.

## Proposed Solution
The **Debate Room Application** provides a structured, state-driven environment that mirrors formal parliamentary debating rules. By moving away from a simple message-passing chat architecture and adopting a **server-side Finite State Machine (FSM)**, the system strictly enforces participation protocols. It ensures that only one speaker has the floor during their timed slot, allows moderators to manage the debate lifecycle, and provides the audience with tools for real-time, objective evaluation. This creates a high-integrity platform for formal discourse and critical thinking.

## Key Features
- **JWT-Based Authentication**: Secure user identity management with encrypted token-based sessions for stateless scalability.
- **Role-Based Access Control (RBAC)**: A strict permission system where users are assigned roles such as **Moderator** (orchestrator), **Speaker** (proposition/opposition), or **Audience** (observers/voters).
- **State-Driven Debate rounds**: A backend-managed lifecycle (Opening Statements -> Rebuttals -> Closing Arguments) that ensures logical flow and data integrity.
- **Real-Time Synchronized Timers**: High-precision timers managed via WebSockets (Socket.io) to ensure all participants are perfectly synchronized with the server's authoritative clock.
- **Dynamic Voting System**: An interactive mechanism for the audience to cast votes. The system supports multiple strategies (e.g., simple majority or weighted by reputation).
- **Debate History & Analytics**: Persistent storage of past debates, including transcripts and outcomes, allowing users to review their performance and track progress.
- **Competitive Leaderboard**: A data-driven ranking system that calculates standings based on win rates, participation, and moderator feedback.

## System Architecture
The application follows a **Clean Architecture** pattern to ensure a high degree of decoupling and testability:

- **Controller Layer**: Handles the orchestration of incoming requests. It is responsible for parsing inputs, calling the appropriate use cases, and returning standardized HTTP/WebSocket responses.
- **Service Layer (Business Logic)**: The heart of the application. It contains the "Domain Logic," such as the debate state machine, round timing logic, and voting calculations. It is independent of frameworks and databases.
- **Repository Layer (Persistence)**: Implements the **Data Mapper** pattern to interact with the database. This layer ensures that switching from a relational to a NoSQL database would not require changes to the business logic.
- **Domain Models**: TypeScript classes that represent core entities like `Room`, `User`, and `Vote`. These models encapsulate state and validity rules (e.g., a room cannot transition to "Voting" until all speeches are finished).

## Design Principles Used
- **OOP (Object-Oriented Programming)**: Heavy use of encapsulation, inheritance (for base entities), and polymorphism (for different state behaviors).
- **SOLID Principles**:
    - **S**: Each class has one clear responsibility (e.g., `TimerService` only handles time).
    - **O**: The system is open for extension (e.g., adding a new voting strategy) but closed for modification.
    - **L/I**: Proper use of interfaces ensures that any service implementation can be swapped without breaking the system.
    - **D**: Dependency Injection is used to inject repositories into services, ensuring high-level modules don't depend on low-level ones.
- **Design Patterns**:
    - **State Pattern**: To manage the transition between different phases of a debate room.
    - **Strategy Pattern**: To allow different voting algorithms to be swapped at runtime.
    - **Singleton**: For managing global resources like database connections or WebSocket servers.

## Future Enhancements
- **AI-Driven Transcription**: Integrating Whisper or similar models to provide automated, real-time transcripts of voice-based debates.
- **Video Integration**: Moving from a text/audio-based system to a full-screen video conferencing debate platform.
- **Advanced Sentiment Analysis**: Using NLP to analyze the "tone" and "sentiment" of arguments to provide moderators with automated "incivility" alerts.
- **Elasticsearch Support**: Implementing advanced search capabilities for searching through years of debate history and transcripts.
