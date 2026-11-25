# Portfolio template

Authoritative stylesheet: `portfolio-template.css`, loaded last on the homepage and Big Oil page. Use its tokens and component classes for future work. Keep approved copy unchanged. Do not add page-specific font, padding or heading overrides.

## Typography

Google Fonts: Inter Tight (headings, 600), Inter (body and UI, including true italic). Abel remains only for recreated diagram labels via `--font-diagram`.

Palette (quiet, after the Looped In explorer): slate ink `#223640` text, secondary text in the page's own colour (`--text-secondary`: 90% of `--accent-text` mixed with the ink, contrast 4.5:1 or more; never grey), panel `#f7fafb`, hairline `#dce4e7`, one accent slate teal `#2c6e7e` (markers, chart primary series, play badge, pressed pills), tint `#e3eef1`. No black, no pastels, no beige, no blue. Red `#bb3446` is reserved for pain-point markers.


Heading tokens: `--heading-weight: 600`, `--heading-tracking: -0.02em`; H1 uses -0.035em, H2 -0.025em. Headings use `text-wrap: balance`.

| Role | Desktop / tablet (≤1100px) / mobile (≤700px) | Weight | Line height |
| --- | --- | --- | --- |
| H1 — page title | 72 / 48 px | Inter Tight 600 | 1.02 |
| H2 — section title | 40 / 34 px | Inter Tight 600 | 1.15 |
| H3 — subsection title | 24 / 22 / 20 px | Inter Tight 600 | 1.25 |
| H4 | 22 / 21 px | Inter Tight 600 | 1.35 |
| H5 | 18 / 18 px | Inter Tight 600 | 1.4 |
| Body and lists | 17 / 17 / 16 px | Public Sans 400 | 1.65 |
| Subtitle | 20 / 19 / 18 px | Public Sans 400 | 1.5 |
| Strong emphasis | Inherited | Public Sans 600 | Inherited |
| Italic emphasis | Inherited | Public Sans italic 400 | Inherited |
| Quote | 20 px | Public Sans italic 400 | 1.6 |
| Caption / supporting text | 15 / 15 / 14 px (body − 2) | Public Sans 400 | 1.5 |
| Label | 13 / 13 / 12 px | Public Sans 600 | 1.5 |
| Card heading | 19 px | Public Sans 500 | 1.4 |
| Metric | 56 px (48 on narrow desktop) | Public Sans 600 | 1.1 |
| Metric qualifier | 21 px (18 on narrow desktop) | Public Sans 500 | 1.4 |
| Card detail | 15 px | Public Sans 400 | 1.6 |

UI card headings are a named component style, independent of their semantic heading level. Use semantic H1–H5 in order; `.type-h1` through `.type-h5` are available for explicit visual roles.

## Areas and components

- Case-study header (`.case-header`): two columns from 1000px, one column below. Left: H1 (case title token, no width limit), subtitle and optional context with the section-header rhythm (16 px under the title, 24 px between paragraphs, 32 px under the group), then `.case-facts` as a list of "Label: value" lines (label semibold, value body text, one color) with the shared list rhythm (`--list-item-gap`, `--list-line-height`); no card, band, dividers or logos. Right: `.case-media` with the video story button (`.video-open`, standard 426 × 240 poster plus label) and `.case-links` under it (small pills in the page accent). On phones the video fills the width.
- Video story: `.video-dialog` reuses the blueprint dialog shell; `<video controls>` pauses on close. Assets live in `assets/bigoil/bp-case-study.mp4` and `-poster.jpg`.
- Section header: `.portfolio-section-header`; title and subtitle stacked, 16 px gap, 32 px below.
- Subheader: `.portfolio-subheader`; 40 px above, 16 px below.
- Content section: `.portfolio-section`; 64 px vertical spacing, 48 px on mobile.
- Reading content: `.portfolio-reading`; maximum 78 characters, 24 px paragraph spacing; lists use 1.5 line height, 4 px between items, and no trailing gap.
- Cards: `.portfolio-card-grid` and `.portfolio-card`; 24 px padding, 24 px gutters, 8 px corner radius. Mobile: 16 px padding, 16 px gutters.
- Results: `.concise-results` / `.result-card`; aligned heading, metric and detail rows. No added or repeated copy.
- Evidence: `.portfolio-evidence`; 32 px vertical spacing, original images without color filters.
- Captions: `figcaption` or `.type-caption`; subordinate to the visual, never a substitute for body copy.
- Quotes: `blockquote` or `.type-quote`; 3 px blue rule, 24 px inset. Only actual supplied quotations.
- Controls: Public Sans; visible 3 px focus outline with 4 px offset.

Use the 4/8/12/16/20/24/32/40/48/64 px spacing tokens. Preserve white backgrounds, dusty blue branding and approved project artwork colors. Template styles do not authorize new content or new sections.

### Subheader 1 (`.subheader-1`)
Primary subtitle beneath a page title. Public Sans, weight 400, 24px desktop / 21px mobile, line height 1.5, teal `#08778d`.

### Heading / subheader pairs
Subheader N belongs beneath Header N. Do not add subtitles where no copy exists. Headings use the existing H1–H5 styles; subheaders use Public Sans 400, teal `#08778d`, line-height 1.5.

| Pair | Subheader desktop | Subheader mobile |
|---|---:|---:|
| Header 1 / Subheader 1 | 24px | 21px |
| Header 2 / Subheader 2 | 20px | 18px |
| Header 3 / Subheader 3 | 18px | 17px |
| Header 4 / Subheader 4 | 16px | 16px |
| Header 5 / Subheader 5 | 14px | 14px |

Big Oil: the page subtitle is `.subheader-1`; Situation and stage subtitles are `.subheader-2`.

### Charts and benchmarks
- Chart panels use the shared card padding and content-sized rows, with 16px between the caption, plot and legend. No fixed empty caption or legend rows.
- SVG labels remain 14px in the chart coordinate system. Plots keep a 480px minimum width inside a keyboard-scrollable region on phones.
- When a stacked panel has at least 640px of inner width, the legend moves to the right.
- The six benchmarks use six columns, three columns below 1100px, and two below 600px. Metric height follows content; no forced aspect ratio.

### Page accordion
- `.portfolio-accordion` uses native details/summary. Sections start expanded and open independently.
- H2 summary titles use Inter Tight 600, 48px on desktop / 40px on mobile, with natural wrapping and the shared figure-button treatment on the right: Expand when closed, Wrap when open. The native summary is the single keyboard control.
- A full-page divider sits above each summary; there is no lower divider. Optional numbered subheaders sit under their matching H2 in `.portfolio-accordion-heading`. Insets and body gaps use the shared spacing tokens.
- Big Oil currently applies this through Delivery Plan and Architecture. L2 Functional Design and later content retain their existing structure.

### Global style changes
Style changes update the shared template globally unless Sandy explicitly requests an exception. All prose lists use `--list-item-gap` (4px) and `--list-line-height` (1.5). Page adapters consume these tokens rather than defining a separate list style. The unprocessed bottom of Big Oil explicitly preserves its prior 8px item spacing via `.portfolio-preserved-lists`, as requested.

### Full-view controls and popup titles
- Show all is visible only when the visual is clipped or scrolls inside its frame. Visibility updates on resize, image load and accordion toggles.
- Popup titles use the same `--figure-title-font` and text color as picture titles.

### Actors panel and profiles
Shared drawers span the full figure content height, including its caption. The actors panel is capped at 520px wide and grows with its content. It has no internal scrolling. All nine actors use compact rows with inline names and descriptions; device icons are omitted. The three primary actors have text View links, opening one popup with Sales, Customer and Operator tabs. Tabs support left/right arrows and Home/End.

### Labels
Use `.type-label` for contextual labels: body size minus 2px, regular weight, italic, sentence case, and secondary text color. Actor group titles use this shared style.

Picture controls place the colored action last, at the far right; neutral controls precede it in both visual and keyboard order. Solved Painpoints uses the shared teal primary button.

Picture controls use shared `.figure-icon-button`: 44px square targets with 20px icons, accessible names and title tooltips. Keep all controls in one compact row and the colored action last.

References to visual evidence open that figure in the shared popup rather than navigating to its chapter. Keep the reader in place and return focus to the link on close.

### Original diagrams at smaller breakpoints
At viewport widths up to 1100px, show the complete original diagrams as fitted still images. Preserve all original steps, actors, branches, labels, and relationships. Do not replace diagrams with stage summaries or new diagrams. Retain the shared side drawers. Hide replay and full-view controls when the complete fitted image is visible. The future-process drawer uses the original solution titles and notes. Above 1100px, retain the original interactive diagrams and their animation.

All colored picture list controls, including Show all actors, use the same list icon; their accessible labels retain their specific actions.

### Static sliding maps
Use `.figure-panel.figure-panorama` with a shared picture title and `.figure-panorama-scroll`. Preserve the original artwork and colors. The complete map fits the viewport height, `min(32.5svh,320px)` on larger screens and `25svh` on phones. Preserve its aspect ratio and slide horizontally only; there is no vertical map scrolling or animation. Use the clear source at its original resolution for the full-view popup. Support touch, trackpad, scrollbar, keyboard arrows and mouse drag. Full-view uses the shared picture popup.

Fitted ecosystem artwork retains the same seven profile info controls, coordinates, tooltip content, and shared icon styles as its desktop view. Tooltips stay inside the fitted image and close with Escape or on resize.

### Artwork contribution highlights
Use `.figure-highlight` for quiet emphasis over original artwork: a 4% dusty-blue tint and a 1px, 40% opacity outline. Preserve the source content and keep the highlighted regions separate. Use the caption to distinguish individual involvement from the team’s complete delivery.

### Measures tables
Use `.portfolio-table` inside the shared figure panel with a figure title and supporting subtitle. Public Sans 14px, 16px cell insets, quiet horizontal rules, and teal emphasis on the after values. At 900px and below, each measure becomes a compact row group with Before/After side by side and the measured-change explanation below at full width. Preserve all table values and labels; no horizontal page overflow or fixed minimum table width.

### Screenshot galleries
Use `.portfolio-evidence-grid` with existing figure panels and captions: two columns, one below 700px, shared 24px gutter. Screenshots remain complete with `object-fit:contain` in a 320px viewing area (280px mobile). Image links open the existing full-view dialog; no additional buttons.

### Sticky header and contribution filters
The shared sticky header uses the approved subtle shadow and wider frame. Situation, Task, Action and Result open their matching sections. Full contribution filters and Reset remain in the introduction. STAR navigation clears the role filter before opening its complete section.

### Closed section overview
Preserve the original vertical order and typography: H2, subtitle, original description. The description stays visible while closed. Below it, shared pills name each existing H3 and open that subsection. Detailed content retains its established layout and starts expanded as before. The narrated demo uses a responsive native video player with controls and no autoplay.

### Animation start timing
Animated charts and the interactive blueprints/ecosystem wait until their drawing area enters the viewport below the sticky header. Play once per page visit, rather than persisting a played flag across visits. Replay controls start the same sequence manually. Preserve reduced-motion behavior and the fitted static diagrams on smaller screens.

## Case-study template (bigoil.html is the reference)
- Page sits as a white sheet on the dotted canvas; the masthead runs edge to edge with its contents aligned to the 1120px column.
- Header: H1 left, video tile right, then facts strip, "What exactly I did" pills, platform logos.
- STAR sections are `<details class="portfolio-accordion">` and load wrapped (no `open`): summary paragraph + pills visible, Expand on the right.
- Metric cards stack from the top so icons line up across cards.
- Charts: teal #2c6e7e / grey #9aa8ae / ink #223640; illustrations as teal duotone (`*-tint.png`).
- Bump the `?v=` param on css/js/video after every change.
