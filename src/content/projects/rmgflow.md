---
title: RMGFlow
tagline: Buying house operations, from inquiry to payment.
summary: A management platform for garments buying houses, covering buyer inquiry, sampling, costing, orders, shipment and payment tracking.
order: 1
tier: flagship
visibility: public
status: active
stack: [Java 21, Spring Boot, PostgreSQL, Flyway, Flutter]
repo: https://github.com/atiqurrahmansojib/RMGFLOW
facts:
  - { label: Domain, value: Garments buying house operations }
  - { label: Backend, value: Spring Boot on Java 21 }
  - { label: Database, value: PostgreSQL with Flyway migrations }
  - { label: Mobile, value: Flutter }
  - { label: Source, value: Public on GitHub }
stats:
  - { value: '12', label: Connected modules, from buyers to finance }
flow: [Buyers, Styles, Sampling, Costing, Quotations, Orders, T&A, Production, Quality, Shipment, Documents, Finance]
highlights:
  - { title: Merchandising, text: 'Buyers, styles, sampling, costing and quotations in one workflow.' }
  - { title: Order execution, text: 'Orders, time and action (T&A) calendars, production follow-up and quality.' }
  - { title: Shipping and money, text: 'Shipment, commercial documents and financial tracking.' }
  - { title: Everyday work, text: 'Approvals, tasks and notifications that keep the team moving.' }
verifiedFrom: Public RMGFLOW repository description, backend/pom.xml, backend/README.md and docs/ file names, checked 2026-10-09. Stats are quoted from the backend README.
---

RMGFlow helps a buying house keep the work of a garment order in one place. It follows an order from the first buyer inquiry to the final payment.

## What it covers

Buyers, styles, sampling, costing, quotations, orders, time and action (T&A) calendars, production follow-up, quality, shipment, commercial documents, financial tracking, approvals, tasks and notifications.

## How it is built

The backend is a Spring Boot application on Java 21 that stores its data in PostgreSQL and manages schema changes with Flyway. A Flutter app provides the mobile client.

## Status and documentation

The repository's backend README reports 13 implementation phases complete and 48 integration tests passing at its last recorded full run. The repository also holds a numbered set of design documents covering workflow, requirements, roles, API design, testing and deployment.
