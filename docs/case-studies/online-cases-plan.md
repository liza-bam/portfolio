# Online case studies plan — BP and EY (agreed November 25, 2026)

Base: the live pages as rendered in the browser (https://sandy.tayts.com/bigoil.html and https://sandy.tayts.com/dh.html) for visuals. New content: the printed case studies (site/printed-portfolio). BP online text = docs/case-studies/bp-case-study-full-text.md. EY online text = the final printed text in site/printed-portfolio/source/ey-case.html. Old page texts are not reused.

## Rules from Sandy
- Change only content and organization; the site design stays. Use the existing site styles only, no local formatting, no new styles.
- Headings, subheadings, body text and captions follow the styles; spacing between objects consistent; all pictures formatted the same way.
- Desktop: live interactive visuals; smaller screens: images.
- Dividers only where they deliberately separate sections.
- Every piece of text serves one goal: show clearly and in detail what Sandy can do. No vague wording, no errors.
- Extra visuals are not removed but hidden behind a link under the main visual, named by its content (one diagram shown, "see more diagrams").
- Check everything several times before showing; then show before publishing. Push to GitHub only after all work is done and Sandy says so.

## Common structure
Title, subtitle, Team / Timeline, TL;DR (Problem, My role, Result + numbers), Before (+ numbers), stages (Problem / What I did / Challenge + bridge), Result, Lessons learned. Menu: Before, stages, Result. Role pills from docs/case-studies/bp-case-roles-by-step.md. Link to download the printed case.

## BP
| Block | Main visual | Extra visuals behind a link |
|---|---|---|
| Top | Video "Watch the 1-minute story" | — |
| Before | Interactive as-is map with pain points | East Coast workshop results; sales and lost-hours charts; Existing Benchmarks |
| 1. Discovery | Interactive to-be blueprint, East Coast | Delivery plan |
| 2. Three platforms | Ecosystem | User profiles; Objects and Actors (cross-team alignment) |
| 3. Contracts | DocuSign alignment map | Salesforce & DocuSign schema |
| 4. Launch | Center of Excellence home | Guides and cheat sheets (3 images); Proof of concept and Credit check videos |
| Result | Project deliverables | Product measures table |
| Lessons learned | Four illustrations | — |

Removed: "My role in the project" block, Task section, four metric cards at the top.

## EY
| Block | Main visual | Extra visuals behind a link |
|---|---|---|
| Top | Video "A day in the life", Wireflow explorer button | — |
| Before | Ticket charts (issues, requests) | Other discovery findings: main use cases, siloed channels, dropped cases, dead ends, repeated checks |
| 1. Teams | Solution and teams | — |
| 2. Ten journeys | Vertical support-tiers diagram | Customer segments and Full persona analysis; Work sequence |
| 3. Modules | Application map | Wireframes; Wireflow explorer; laptop refresh (feasibility, data-driven refresh) |
| 4. Proactive support | Sentiment data flow (new) | — |
| Result | Wireframes | Proposed targets (40% lower support cost, 40%+ higher productivity, employee NPS 50, 1 hour saved per employee per month), hidden behind a link |
| Lessons learned | Four lessons (rewritten) | — |

Removed: Role / Scope / Timeline, projected metric cards at the top, "implementation went ahead without me", Task section.

## Lessons learned (agreed)

### BP
**Agree on success before the build** — The Salesforce and DocuSign teams brought different skills and different views of success. Before any build started, both needed the same picture of the process, who owns what, and what done looks like.

**Unify documents before development** — Agile delivery breaks down when the documents behind a process keep changing. Turning 60,000 pages of contracts into one template structure first gave the team a stable base to build the flows on.

**Finish one market before starting the next** — Building similar processes in parallel led to duplicated work and different ways of handling data. Launching and testing one market first, then reusing it for the next, was faster and more consistent.

**Write handoffs for teams across time zones** — With teams spread across nine time zones, work could not depend on everyone being online at once. Written handoffs kept every team clear on what was decided, where the work stood and what came next.

### EY
**Tell the service as a story** — A day in the life of one employee showed how ten journeys fit together. It kept the client focused on the service as a whole, not on single features, and carried the bid through each demo.

**Design the support people never see** — The best IT support solves a problem before an employee has to report it. Proactive scenarios and self-service mattered as much as the help desk itself.

**Check every step against a real system** — Each step of every journey was mapped to the platform that would deliver it before anyone drew a screen. That turned the design into a plan the platform teams could actually build.

**Build from modules** — Ten journeys shared most of their steps. Designing shared modules once meant fewer screens to build and an app employees learn once.
