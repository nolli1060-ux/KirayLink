# KirayLink — Future Architecture & Deferred Enhancements

This document catalogs features and architectural expansions deliberately postponed beyond the student capstone evaluation scope. These items define the product roadmap for transforming KirayLink into a full-scale commercial venture.

---

## 1. Production Relational Database (PostgreSQL + Prisma ORM)

While the structured JSON file repository fulfills capstone evaluation requirements with zero friction, commercial deployment will migrate to:
- **Database Engine**: Managed PostgreSQL (e.g. Supabase, Neon, or AWS RDS).
- **ORM**: [Prisma ORM](https://www.prisma.io/) or [Drizzle ORM](https://orm.drizzle.team/) for type-safe relational schemas.
- **Connection Pooling**: PgBouncer or serverless connection pooling to handle high-concurrency rental spikes during peak diplomatic relocation seasons (August & January).
- **Automated Database Migrations**: CI/CD migration pipelines ensuring schema safety.

---

## 2. Integrated Digital Payments & Escrow (Telebirr, CBE Birr, Chapa)

In the current version, pricing is displayed transparently in ETB, and financial terms are negotiated directly between tenants and property managers.

Future release goals:
- **Local Payment Gateways**: Integration with Chapa, Telebirr, and CBE Birr APIs.
- **Deposit Escrow**: Holding security deposits in a neutral escrow account until physical inspection and key handover are digitally verified.
- **Automated Rent Receipts**: Automatic generation of compliant Ethiopian tax invoices and digital receipts upon transaction completion.

---

## 3. Real-Time Direct Messaging (WebSockets)

Currently, inquiry lifecycles are tracked via status badges (`pending`, `reviewed`, `responded`) with contact details provided for direct phone and email follow-up.

Future release goals:
- **In-App Messaging**: Real-time WebSocket or Server-Sent Events (SSE) chat room instantiated upon inquiry dispatch.
- **File & Lease Attachment**: Secure exchange of tenant identification (passports, diplomatic credentials) and landlord lease agreements.
- **Read Receipts & Typing Indicators**: Instant feedback on message delivery status.

---

## 4. Multi-Channel Notification Engine (SMS & Email)

In the current version, landlords check their dashboard to review incoming leads.

Future release goals:
- **SMS Gateway**: Integration with Ethio Telecom SMS API for instantaneous alerts: `"New inquiry received for The Grand Diplomatic Villa from Sara Hailu."`
- **Transactional Email**: Resend or AWS SES dispatching formatted lease itineraries and private viewing confirmation calendars.

---

## 5. Geospatial Mapping & Commute Analytics

In the current version, properties are organized by districts (Bole, Old Airport, Kazanchis, Sarbet, CMC, Ayat, Summit).

Future release goals:
- **Interactive Mapbox / MapLibre**: Vector map visualization allowing tenants to draw custom bounding boxes across Addis Ababa sub-cities.
- **Embassy & International School Proximity Radiuses**: Distance calculation to key diplomatic hubs (e.g., African Union Headquarters, UNECA, US Embassy, European Union Delegation).
- **Traffic & Commute Estimates**: Integration with local transit routing to estimate travel times during peak morning hours.

---

## 6. Multi-Lingual Localization (Amharic & English)

In the current version, the platform is implemented in English to align with diplomatic and international corporate clientele.

Future release goals:
- **Amharic (Fidel Script) Translation**: Complete bi-directional localization using `next-intl` or `@formatjs`.
- **Locale Switcher**: Seamless language toggle in the navigation bar persisting user preference in cookies.
