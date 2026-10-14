---
title: Tanabana
tagline: An ERP for the Bangladesh garment industry.
summary: A modular-monolith ERP for ready-made-garment groups, built with Java, Spring Boot, PostgreSQL and Angular, and packaged with Docker.
order: 2
tier: flagship
visibility: private
status: active
stack: [Java, Spring Boot, PostgreSQL, Angular, TypeScript, Docker, GitHub Actions]
facts:
  - { label: Domain, value: Bangladesh ready-made-garment industry }
  - { label: Architecture, value: Modular monolith, one database per customer }
  - { label: Backend, value: Java and Spring Boot }
  - { label: Frontend, value: Angular with TypeScript }
  - { label: Delivery, value: Docker and GitHub Actions checks }
  - { label: Source, value: Private repository }
stats:
  - { value: '14', label: Roadmap modules, from Merchandising to Asset and Facility Management }
  - { value: '1,266', label: 'Tests at the release gate' }
  - { value: '273', label: 'REST API controllers' }
  - { value: '261', label: 'Database migrations' }
verifiedFrom: The tanabana README while the repository was public (now private, checked 2026-10-12) (status of 1 October 2026), language statistics, Dockerfile and docker-compose files, and .github/workflows/checks.yml, checked 2026-10-09. Module and test counts quoted from the README. Controller and migration counts measured from the repository source on 2026-10-14.
---

Tanabana is an ERP for the Bangladesh ready-made-garment industry. It is designed to be installed in a real garment group without redesign.

## Shape of the system

It is a modular monolith: one database and one deployment per customer. The README sets a scale target of 5 to 20 factories per customer and about 2,000 concurrent users.

## How it is built

Java and Spring Boot on PostgreSQL for the backend, Angular with TypeScript for the frontend. The repository includes Docker files for running and packaging it, and a GitHub Actions workflow that runs automated checks on every push.

## Status

The README reports 14 roadmap modules, from Merchandising to Asset and Facility Management, a release gate of 1,266 tests, and database migrations V1 to V262, as of 1 October 2026.
