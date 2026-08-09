# FluentStack — PRD / MVP

**Product Requirements Document**
Lipiec 2026 | Przemysław Lewtak | Kanban

---

## Kontekst projektu

FluentStack to platforma do nauki angielskiego dla polskich uczniów (maturzyści, programiści, Business English). Dokument opisuje wymagania MVP dla trzech funkcjonalności: Chatbot AI, Booking & Kalendarz oraz Strefa Nauki. Projekt prowadzony w Kanban.

---

## Stack techniczny

| Technologia                    | Zastosowanie                               |
| ------------------------------ | ------------------------------------------ |
| Next.js 16 + App Router        | Frontend i backend                         |
| NeonDB (PostgreSQL) + pgvector | Baza danych + embeddingi RAG               |
| Drizzle ORM                    | Zapytania do bazy                          |
| Vercel AI SDK + OpenAI         | Chatbot, Corrector, generowanie pytań quiz |
| Clerk                          | Autentykacja (już zintegrowana)            |
| Resend                         | Emaile (już zintegrowany)                  |
| Vercel Cron Jobs               | Przypomnienia email                        |

---

## Model dostępu — globalny

| Użytkownik          | Dostęp                                | Limit AI                         |
| ------------------- | ------------------------------------- | -------------------------------- |
| Niezalogowany       | FAQ w chacie, podgląd Strefy Nauki    | 0 tokenów                        |
| Zalogowany (free)   | Pełny chat + Strefa Nauki + Corrector | 20 pytań / miesiąc (shared pool) |
| Płatny (przyszłość) | Wszystko bez limitu                   | Unlimited                        |

> **Uwaga:** limit 20 pytań/miesiąc obejmuje łącznie Chatbot AI, Corrector i quiz w Strefie Nauki. Jeden shared pool — nie oddzielne limity per funkcja. Uczeń widzi ile pytań mu zostało.

---

## Feature 1 — Chatbot AI

### Opis

Chatbot widoczny na stronie głównej. Dla niezalogowanych odpowiada wyłącznie na FAQ (zero tokenów AI — statyczne odpowiedzi z bazy). Dla zalogowanych dodatkowo przeszukuje materiały PDF przez RAG i obsługuje Corrector.

### Tryby chatbota

#### FAQ — niezalogowani (0 tokenów)

- Uczeń pyta o ceny, ofertę, jak się zapisać, jak działają lekcje
- System dopasowuje pytanie do gotowych odpowiedzi z tabeli `faq` w bazie
- Zero wywołań AI — odpowiedź zwracana bezpośrednio z bazy
- Placeholder w chacie: "Zapytaj o ceny, ofertę lub jak się zapisać..."
- Komunikat zachęcający: "Zaloguj się aby korzystać z pełnego chatbota"

#### RAG z materiałów — zalogowani

- Przeszukuje PDFy wgrane przez nauczyciela (pgvector similarity search)
- Odpowiedź generowana przez OpenAI na podstawie znalezionych fragmentów
- Używa shared pool 20 pytań/miesiąc
- Obecne materiały: phrasal verbs — docelowo więcej PDFów

#### Corrector — zalogowani

- Uczeń wpisuje zdanie po angielsku
- AI poprawia błędy i wyjaśnia dlaczego (np. "I goed → I went — Past Simple nieregularny")
- Używa shared pool 20 pytań/miesiąc

### Zarządzanie FAQ — panel admina

- Nauczyciel dodaje/edytuje/usuwa pary pytanie-odpowiedź w `/uploads` (nowa zakładka)
- Nowa tabela w bazie: `faq` (id, question, answer, created_at)
- Drizzle ORM do operacji CRUD

### User Stories — Chatbot

- Jako niezalogowany chcę zapytać o ceny lekcji, aby zdecydować czy chcę się zapisać
- Jako niezalogowany chcę widzieć że pełny dostęp wymaga logowania, aby wiedzieć co zyskam
- Jako zalogowany chcę poprawić swoje zdanie angielskie, aby uczyć się na błędach
- Jako zalogowany chcę zapytać o materiały z kursu, aby ćwiczyć między lekcjami
- Jako zalogowany chcę widzieć ile pytań zostało mi w tym miesiącu
- Jako nauczyciel chcę zarządzać FAQ w panelu admina, aby aktualizować odpowiedzi bez kodu

### Kryteria akceptacji — Chatbot

- [ ] Niezalogowany widzi chat i może pytać tylko o FAQ (0 tokenów)
- [ ] Zalogowany ma dostęp do RAG i Correctora
- [ ] Shared pool 20 pytań/miesiąc działa i jest widoczny w UI
- [ ] FAQ zarządzane przez panel admina (CRUD)
- [ ] Chatbot nie odpowiada poza zakresem materiałów (brak halucynacji)

---

## Feature 2 — Booking & Kalendarz

### Opis

System rezerwacji konsultacji i lekcji. Nauczyciel zarządza slotami w panelu admina. Emaile automatyczne przez Resend (już zintegrowany). Zero tokenów AI.

### Flow rezerwacji

#### Konsultacja — niezalogowani

- Odwiedzający wchodzi na `/umow-konsultacje`
- Widzi kalendarz z dostępnymi slotami
- Klika slot → modal: imię, email, wiadomość (opcja)
- Po zatwierdzeniu: email do odwiedzającego + powiadomienie do nauczyciela
- Slot znika z kalendarza

#### Lekcja — zalogowani

- Zalogowany uczeń widzi sloty lekcji
- Wybiera termin + typ lekcji (Ogólny / Business / Matura)
- Po zatwierdzeniu: email z potwierdzeniem + powiadomienie do nauczyciela

### Emaile automatyczne (Resend)

- Potwierdzenie — natychmiast po rezerwacji
- Przypomnienie — 24h przed lekcją (Vercel Cron)
- Przypomnienie — 1h przed lekcją (Vercel Cron)
- Anulowanie — gdy nauczyciel anuluje, uczeń powiadamiany emailem

### Panel admina — nauczyciel

- Dodawanie slotów: data, godzina, typ (konsultacja / lekcja)
- Blokowanie czasu (urlop, przerwa)
- Widok wszystkich rezerwacji
- Anulowanie rezerwacji

### Model danych — nowe tabele (Drizzle)

| Tabela     | Kluczowe kolumny                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------- |
| `slots`    | id, date, start_time, end_time, type, is_booked, is_blocked, created_at                         |
| `bookings` | id, slot_id, user_id (null dla konsultacji), first_name, email, lesson_type, status, created_at |

### User Stories — Kalendarz

- Jako odwiedzający chcę widzieć dostępne terminy i zarezerwować konsultację bez konta
- Jako odwiedzający chcę dostać email z potwierdzeniem natychmiast po rezerwacji
- Jako odwiedzający chcę dostać przypomnienie 24h i 1h przed, aby nie zapomnieć
- Jako zalogowany uczeń chcę zarezerwować lekcję z wyborem jej typu
- Jako nauczyciel chcę dodawać i blokować sloty w panelu admina
- Jako nauczyciel chcę widzieć wszystkie rezerwacje i móc je anulować

### Kryteria akceptacji — Kalendarz

- [ ] Nauczyciel może tworzyć, blokować i usuwać sloty
- [ ] Odwiedzający może zarezerwować konsultację bez konta
- [ ] Zalogowany uczeń może zarezerwować lekcję z wyborem typu
- [ ] Emaile wysyłane natychmiast przez Resend
- [ ] Przypomnienia 24h i 1h działają przez Vercel Cron
- [ ] Podwójna rezerwacja niemożliwa

---

## Feature 3 — Strefa Nauki

### Opis

Sekcja z ćwiczeniami dla uczniów. Podgląd dostępny dla niezalogowanych (zachęta do rejestracji). Pełna funkcjonalność po zalogowaniu. Dwa typy ćwiczeń na MVP: Multiple Choice Quiz i Corrector (Corrector współdzielony z chatbotem).

### Model dostępu

- **Niezalogowany** — widzi UI Strefy Nauki ale nie może ćwiczyć, komunikat: "Zaloguj się aby ćwiczyć"
- **Zalogowany (free)** — pełny dostęp, limit 20 pytań/miesiąc (shared pool z chatbotem)
- Uczeń widzi licznik: "Zostało Ci X z 20 pytań w tym miesiącu"

### Ćwiczenie 1 — Multiple Choice Quiz

- Pytanie wyświetlone na ekranie + 4 opcje odpowiedzi
- Uczeń wybiera odpowiedź → natychmiastowy feedback (poprawna/błędna)
- Przy błędnej odpowiedzi: wyjaśnienie dlaczego inna opcja jest poprawna
- Pytania z bazy (tabela `quiz_questions`) — bez generowania AI przy każdym pytaniu
- Zużywa 1 pytanie z poolu tylko przy sprawdzeniu odpowiedzi jeśli potrzebne wyjaśnienie AI

#### Skąd pytania do quizu (panel admina)

- **Opcja A:** Nauczyciel dodaje ręcznie (0 tokenów)
- **Opcja B:** Nauczyciel klika "Wygeneruj z PDF" → AI generuje pytania jednorazowo → zapisuje do bazy
  - Jednorazowy koszt tokenów przy generowaniu, nie przy każdym ćwiczeniu ucznia

### Ćwiczenie 2 — Corrector

- Uczeń wpisuje zdanie po angielsku
- AI poprawia i wyjaśnia błędy
- Ten sam komponent co w chacie — jeden shared pool
- Każde wywołanie zużywa 1 pytanie z miesięcznego poolu

### Panel admina — Strefa Nauki

- Nowa zakładka w `/uploads`: "Pytania Quiz"
- Dodaj pytanie ręcznie: pytanie, opcja A/B/C/D, poprawna odpowiedź, temat
- Przycisk "Wygeneruj z PDF" → wybierz plik → AI tworzy pytania → podgląd → zapisz
- Lista pytań z możliwością edycji i usunięcia

### Model danych — nowe tabele (Drizzle)

| Tabela           | Kluczowe kolumny                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| `quiz_questions` | id, question, option_a, option_b, option_c, option_d, correct_answer, topic, source_file_name, created_at |
| `faq`            | id, question, answer, created_at                                                                          |
| `usage_tracking` | id, user_id, month (YYYY-MM), questions_used, created_at                                                  |

### User Stories — Strefa Nauki

- Jako niezalogowany chcę zobaczyć Strefę Nauki, aby wiedzieć co zyskam po rejestracji
- Jako zalogowany chcę rozwiązywać quiz Multiple Choice z materiałów kursu
- Jako zalogowany chcę dostać wyjaśnienie przy błędnej odpowiedzi, aby zrozumieć błąd
- Jako zalogowany chcę używać Correctora, aby poprawiać własne zdania
- Jako zalogowany chcę widzieć ile pytań mi zostało w tym miesiącu
- Jako nauczyciel chcę dodawać pytania ręcznie lub generować z PDF w panelu admina

### Kryteria akceptacji — Strefa Nauki

- [ ] Niezalogowany widzi UI ale nie może ćwiczyć
- [ ] Zalogowany może rozwiązywać quiz i korzystać z Correctora
- [ ] Shared pool 20 pytań/miesiąc działa dla wszystkich 3 funkcji
- [ ] Licznik pytań widoczny w UI
- [ ] Panel admina: dodawanie ręczne i generowanie z PDF działa
- [ ] Po wygenerowaniu pytania zapisane w bazie, nie generowane przy każdym ćwiczeniu

---

## Panel admina — `/uploads` (rozbudowa)

Obecna strona `/uploads` ma tylko upload PDFów. Rozbudowujemy o 3 zakładki:

| Zakładka      | Co zawiera                                             | Nowe? |
| ------------- | ------------------------------------------------------ | ----- |
| Materiały PDF | Upload PDF → chunking → embeddingi (już działa)        | NIE   |
| FAQ           | CRUD: pytanie + odpowiedź dla chatbota niezalogowanych | TAK   |
| Pytania Quiz  | Dodaj ręcznie lub generuj z PDF, lista z edycją        | TAK   |

---

## Otwarte pytania

- Jak długo trwa lekcja? (45 min / 60 min) — potrzebne dla slotów w kalendarzu
- Jaka strefa czasowa dla kalendarza?
- Czy uczeń może sam anulować rezerwację i do kiedy?
- Czy 20 pytań/miesiąc to dobry limit? Można zmienić później w konfiguracji
- Kiedy wprowadzamy płatności? (Stripe — przyszłość)
- Model OpenAI dla Correctora i quizu — gpt-4o-mini (tańszy) czy gpt-4o?
