---
id: frontend-framework
created: 2026-07-29
---

# ADR: Wybór frameworka frontendowego

## Status

Zaakceptowane

## Kontekst

Potrzebujemy frameworka do budowy aplikacji webowej. Zespół ma doświadczenie w Reactcie. Chcemy unikać osobnego backendu na start i trzymać frontend oraz API w jednym miejscu.

## Decyzja

Wybieramy **Next.js** (App Router) jako framework aplikacji.

Powody:

- to full-stackowy framework - frontend i backend (Route Handlers, Server Actions) w jednym projekcie
- oparty o React, który zespół już zna
- natywne wsparcie SSR/SSG i dobry DX w ekosystemie React

## Konsekwencje

**Pozytywne**

- jeden codebase na UI i logikę serwerową
- krótszy onboarding dzięki znajomości Reacta
- mniej glue code między oddzielnym frontendem a API

**Negatywne / ryzyka**

- silniejsze sprzężenie frontendu z backendem
- część decyzji (routing, caching, Server Components) jest specyficzna dla Next.js
