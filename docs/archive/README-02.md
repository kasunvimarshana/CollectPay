# Data Collection and Payment Management System

**Project Overview**

Design and implement a fully functional, production-ready, end-to-end data collection and payment management application using a **React Native (Expo) frontend** and a **Laravel backend**. The backend must serve as the **single source of truth**, providing authoritative validation, persistence, and conflict resolution. The system must ensure **data integrity, prevent duplication or corruption, and support multi-user and multi-device access** reliably.

**Core Functional Requirements**

- Full **CRUD operations** for users, suppliers, products, collections, and payments.
- Detailed **supplier profiles** with **multi-unit quantity tracking**.
- Support for **time-based and versioned product rates**, including historical preservation of applied rates.
- Management of **advance and partial payments** with automated, auditable calculations derived from historical collections, rate versions, and prior transactions.
- Automatic calculation of total payments based on **supplier, product, quantity, rate, and prior payments**, ensuring transparent financial oversight.
- **Multi-user, multi-device concurrency** with deterministic conflict detection and resolution using versioning, timestamps, and server-side validation.
- Centralized database architecture ensuring consistent data across all devices and users.
- Support for **multi-unit operations** and real-time updates without data loss or inconsistency.

**Security Requirements**

- End-to-end encryption for **data in transit and at rest**.
- Secure backend transactions with **tamper-resistant operations**.
- Comprehensive authentication and authorization using **Role-Based Access Control (RBAC)** and **Attribute-Based Access Control (ABAC)**.
- Secure handling of sensitive financial and user data to ensure integrity and privacy.

**Architecture and Best Practices**

- Strict adherence to **Clean Architecture**, **SOLID principles**, **DRY**, and **KISS** practices.
- Clear separation of concerns across **domain logic, application services, infrastructure, state management, UI components, and event orchestration**.
- Modular, scalable, and maintainable design optimized for **high performance and long-term testability**.
- Minimized external dependencies, favoring **native platform capabilities** and only essential **open-source, free, LTS-supported libraries**.
- Deterministic, predictable behavior to reduce technical debt and ensure reliable data operations.

**Example Use Case: Agricultural Collection Workflow**

- Users (e.g., tea leaf collectors) visit multiple suppliers across regions daily.
- Quantities collected are recorded in multiple units (kg, g, etc.), and payments (including advance or partial) are tracked.
- Periodic rate adjustments are applied, with historical rates preserved for all prior collections.
- The system calculates total payments owed per supplier automatically, based on quantities collected, rate, and prior payments.
- Multi-user and multi-device access ensures concurrent data entry without conflicts or data corruption.

**Key Capabilities**

- **Multi-user support**: Multiple users can operate simultaneously without data loss or corruption.
- **Multi-device support**: Data is consistently accurate across devices.
- **Data integrity**: All operations preserve accurate records; no duplication or corruption occurs.
- **Multi-unit handling**: Quantities and rates can be managed in multiple units.
- **Auditable financial management**: Complete traceability of collections, payments, and rate history.
- **High maintainability and scalability**: Modular architecture reduces technical debt and simplifies future enhancements.
