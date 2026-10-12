---
title: BikeHub
tagline: Shop management for a motorcycle parts and engine-oil shop.
summary: A phone-first shop system for a motorcycle spare-parts and engine-oil shop in Bangladesh, covering stock, purchasing, point of sale, dues and daily closing.
order: 3
tier: major
visibility: private
status: active
stack: [Java 21, Spring Boot, PostgreSQL, Flyway, Angular, PWA, Docker]
facts:
  - { label: Domain, value: Motorcycle spare-parts and engine-oil shop, Bangladesh }
  - { label: Client, value: Angular PWA, phone first, English and Bengali }
  - { label: Backend, value: Spring Boot 3.5 on Java 21 }
  - { label: Database, value: PostgreSQL 16 with Flyway migrations }
  - { label: Access, value: Two roles, Owner and Salesperson }
  - { label: Source, value: Private repository }
highlights:
  - { title: Stock and purchasing, text: 'Products with motorcycle compatibility, stock at weighted-average cost, purchasing and supplier payables.' }
  - { title: Selling, text: 'Point of sale with invoices, returns and cancellations.' }
  - { title: Money, text: 'Customer dues, expenses, day closing with a cash check, and profit reports.' }
  - { title: Safe by design, text: 'Stock alerts, an audit trail, backup and restore. Retries are idempotent, so a lost connection never creates a duplicate or half-saved record.' }
verifiedFrom: BikeHub README in the owner's local repository (the GitHub repository is private), and the frontend and backend build files, checked 2026-10-12. No figures are quoted.
---

BikeHub runs the daily work of a motorcycle spare-parts and engine-oil shop: what is in stock and what it cost, what was bought and sold, who owes the shop and whom the shop owes, and how the day ended.

## What it covers

Products and motorcycle compatibility, stock with weighted-average cost, purchasing, point of sale with invoices, customer dues and supplier payables, returns and cancellations, expenses, day closing and cash check, profit reports, stock alerts, an audit trail, and backup and restore.

## How it is built

An Angular progressive web app designed for phones, in English and Bengali, talks to a Spring Boot 3.5 API on Java 21. Data lives in PostgreSQL 16, with Flyway managing schema changes and JWT for sign-in. There are two roles, Owner and Salesperson. It is built for one shop, with no tax features and no offline selling. The production stack runs with Docker Compose.

## Source code

The repository is private, so there is no source link. A privacy policy for the app is published separately.
