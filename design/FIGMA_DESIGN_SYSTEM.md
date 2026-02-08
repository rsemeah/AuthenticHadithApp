# Authentic Hadith — Figma Design System & Component Map

> Complete design specification for rebuilding in Figma.
> Target: iPhone 15 Pro (393 x 852 dp), Android Pixel 8 (412 x 892 dp)

---

## 1. DESIGN TOKENS

### 1.1 Color Palette

| Token              | Hex       | Usage                                    |
|---------------------|-----------|------------------------------------------|
| `primary`           | `#1a5e3a` | Tab bar active, headers, buttons, links  |
| `primaryLight`      | `#2d8a5e` | Narrator text, secondary links           |
| `primaryDark`       | `#0f3d25` | Filter bar text                          |
| `background`        | `#f5f5f0` | Screen backgrounds (warm off-white)      |
| `surface`           | `#ffffff` | Cards, tab bar, input bar, sheets        |
| `text`              | `#1a1a1a` | Primary body text                        |
| `textSecondary`     | `#666666` | Subtitles, meta, inactive tab icons      |
| `textArabic`        | `#2c2c2c` | Arabic hadith text                       |
| `border`            | `#e0e0e0` | Card borders, dividers, input borders    |
| `accent`            | `#c9a84c` | Bismillah text, premium badge, gold accents |
| `error`             | `#d32f2f` | Error messages, error buttons, sign out  |
| `cardShadow`        | `rgba(0,0,0,0.08)` | Card elevation shadow             |

#### Semantic Colors (derived)

| Usage               | Value                | Description                        |
|----------------------|----------------------|------------------------------------|
| Grade: Sahih         | `#2e7d32`            | Green badge for authentic          |
| Grade: Hasan         | `#f9a825`            | Amber badge for good               |
| Grade: Da'if         | `#d32f2f`            | Red badge for weak                 |
| Difficulty: Beginner | `#2e7d32`            | Green                              |
| Difficulty: Intermediate | `#f9a825`        | Amber                              |
| Difficulty: Advanced | `#e65100`            | Orange                             |
| Difficulty: Scholar  | `#6a1b9a`            | Purple                             |
| Error bg             | `#fdecea`            | Light red background               |
| Topic badge bg       | `#1a5e3a14` (8% opacity) | Primary at 8% opacity         |
| Premium badge bg     | `#c9a84c20` (12% opacity) | Accent at 12% opacity        |
| Sheet backdrop       | `rgba(0,0,0,0.35)`  | Modal overlay                      |

### 1.2 Typography

All fonts use system default (San Francisco on iOS, Roboto on Android).

| Style                  | Size | Weight    | Line Height | Letter Spacing | Usage                          |
|------------------------|------|-----------|-------------|----------------|--------------------------------|
| `heading-xl`           | 28   | Bold (700)| auto        | 0              | Login title                    |
| `heading-lg`           | 26   | Bold (700)| auto        | 0              | Home "Authentic Hadith"        |
| `heading-md`           | 22   | Bold (700)| auto        | 0              | Section headers, bismillah     |
| `heading-sm`           | 20   | Bold (700)| auto        | 0              | Profile name                   |
| `section-title`        | 18   | Bold (700)| auto        | 0              | "Hadith of the Moment"         |
| `card-title`           | 17   | Bold (700)| auto        | 0              | Learning path card title       |
| `body-lg`              | 16   | Regular   | 26          | 0              | Teaching text, inputs          |
| `body`                 | 15   | Regular   | 24          | 0              | English hadith, chat messages  |
| `body-sm`              | 14   | Regular   | 22          | 0              | About text, subtitles          |
| `arabic`               | 18   | Regular   | 32          | 0              | Arabic hadith text (RTL)       |
| `arabic-sm`            | 16   | Regular   | 28          | 0              | Arabic in share preview        |
| `meta-label`           | 13   | Bold (700)| auto        | 0.5            | Collection name (uppercase)    |
| `meta`                 | 13   | Regular   | auto        | 0              | Reference numbers, durations   |
| `caption`              | 12   | Regular   | auto        | 0              | Grade badges, counts, footer   |
| `badge`                | 12   | Bold (700)| auto        | 0.5            | Difficulty badge (uppercase)   |
| `chip-text`            | 13   | Medium(500)| auto       | 0              | Topic chip labels              |
| `tiny`                 | 11   | Regular   | auto        | 0              | Source ref in assistant         |
| `topic-badge`          | 10   | SemiBold  | auto        | 0              | Topic badge in chat (uppercase)|

### 1.3 Spacing Scale (points)

| Token | Value | Usage                                      |
|-------|-------|--------------------------------------------|
| `xs`  | 4     | Tab bar bottom padding, chip gap           |
| `sm`  | 8     | Badge gaps, chip padding-v, inner gaps     |
| `md`  | 12    | Card padding inner, horizontal gaps        |
| `lg`  | 16    | Screen padding, card padding, section gaps |
| `xl`  | 20    | Section margins, button margins            |
| `2xl` | 24    | Login padding, header padding-h            |
| `3xl` | 32    | Profile avatar area padding-v              |
| `4xl` | 40    | Loading spinner padding-v                  |

### 1.4 Border Radius

| Token         | Value | Usage                              |
|---------------|-------|------------------------------------|
| `card`        | 12    | HadithCard, sections, lesson cards |
| `card-lg`     | 14    | Learning path cards                |
| `button`      | 10    | Primary/secondary buttons          |
| `button-pill` | 20    | Input bar, topic chips, send button|
| `sheet`       | 20    | Bottom sheet top corners           |
| `avatar`      | 44    | Profile avatar circle              |
| `badge`       | 4     | Grade badges, topic badges         |

### 1.5 Shadows

| Name          | Offset       | Blur | Opacity | Usage          |
|---------------|-------------|------|---------|----------------|
| `card`        | (0, 2)      | 8    | 0.08    | HadithCard     |
| `card-light`  | (0, 2)      | 6    | 0.06    | Collection card |
| `card-subtle` | (0, 1)      | 4    | 0.04    | Lesson cards   |
| `elevation-3` | (0, 2)      | 8    | 0.08    | HadithCard (Android elevation: 3) |

### 1.6 Icon Set

Uses **Ionicons** throughout. Key icons:

| Icon Name                    | Usage                        |
|------------------------------|------------------------------|
| `home`                       | Home tab                     |
| `library`                    | Collections tab              |
| `search`                     | Search tab                   |
| `book`                       | Learn tab, collection cards  |
| `chatbubble-ellipses`        | Assistant tab                |
| `person`                     | Profile tab, avatar          |
| `sparkles`                   | TruthSerum avatar            |
| `send`                       | Chat send button             |
| `share-outline`              | Share button on cards        |
| `paper-plane-outline`        | Share Privately button       |
| `copy-outline`               | Copy Text button             |
| `ellipsis-horizontal`        | More... button               |
| `checkmark-circle`           | Completed lesson, verified   |
| `checkmark-circle-outline`   | Mark Complete button         |
| `ellipse-outline`            | Not started / in-progress    |
| `close-circle`               | Clear filter                 |
| `close`                      | Clear search                 |
| `chevron-forward`            | Menu item arrow              |
| `qr-code-outline`            | My Referral Code             |
| `gift-outline`               | Redeem Code                  |
| `people-outline`             | Invite Friends, Character path |
| `star`                       | Premium badge                |
| `heart-outline`              | Foundations path             |
| `sunny-outline`              | Daily Practice path          |
| `school-outline`             | Scholars path                |
| `search-outline`             | Empty search state           |
| `book-outline`               | Empty search, learn default  |
| `moon-outline`               | Prayer topic chip            |
| `hand-left-outline`          | Charity topic chip           |
| `leaf-outline`               | Patience topic chip          |
| `water-outline`              | Purification topic chip      |

---

## 2. COMPONENT LIBRARY

### 2.1 Tab Bar
- **Height**: 56pt
- **Background**: `surface` (#fff)
- **Border top**: 1px `border`
- **Bottom padding**: 4pt
- **Active icon color**: `primary`
- **Inactive icon color**: `textSecondary`
- **Icon size**: 24 (default Ionicons tab size)
- **Tabs** (left to right):
  1. Home (home)
  2. Collections (library)
  3. Search (search)
  4. Learn (book)
  5. Assistant (chatbubble-ellipses)
  6. Profile (person)

### 2.2 Navigation Header
- **Background**: `primary` (#1a5e3a)
- **Text color**: #fff
- **Font**: Bold
- **Height**: System default (44pt iOS, 56pt Android)

### 2.3 HadithCard
- **Container**: `surface` bg, 12 radius, 16pt padding, 16pt horizontal margin, 8pt vertical margin
- **Shadow**: card shadow
- **Structure**:
  ```
  [Meta row]
    [Left: Collection label (uppercase, primary, 13px bold) | Reference (13px, secondary) | Grade badge (12px, colored bg #f0f0f0, 8px h-padding, 4 radius)]
    [Right: Share icon button (18px)]
  [Arabic text] (18px, line-height 32, RTL, right-aligned, max 4 lines unless showFull)
  [English text] (15px, line-height 24, max 4 lines unless showFull)
  [Narrator] (13px, primaryLight, italic)
  [Chapter] (12px, textSecondary)
  ```

### 2.4 Topic Chip
- **Layout**: Row, horizontal scrollable
- **Background**: `background`
- **Border**: 1px `border`
- **Border radius**: 20 (pill)
- **Padding**: 12h, 8v
- **Gap between icon and text**: 4pt
- **Icon**: 16px, `primary` color
- **Text**: 13px, medium weight, `text` color

### 2.5 Primary Button
- **Background**: `primary`
- **Text**: #fff, 16px, bold
- **Padding**: 14v
- **Radius**: 10
- **Pressed state**: opacity 0.85

### 2.6 Outline Button
- **Background**: transparent
- **Border**: 1.5px `primary`
- **Text**: `primary`, 16px, bold
- **Padding**: 14v
- **Radius**: 10

### 2.7 Search Bar
- **Container**: `surface` bg, 10 radius, 1px `border` border
- **Margin**: 16 all sides, 8 bottom
- **Padding**: 12h
- **Icon**: search, 20px, `textSecondary`, 8pt right margin
- **Input**: 16px, flex 1
- **Clear button**: close icon, 20px, `textSecondary`

### 2.8 Chat Bubble (User)
- **Background**: `primary`
- **Text**: #fff, 15px, line-height 22
- **Radius**: 16 all corners, 4 bottom-right
- **Padding**: 14
- **Max width**: 85%
- **Alignment**: flex-end

### 2.9 Chat Bubble (Assistant)
- **Background**: `surface`
- **Border**: 1px `border`
- **Radius**: 16 all corners, 4 bottom-left
- **Padding**: 14
- **Max width**: 85%
- **Alignment**: flex-start
- **Header row**: sparkles icon (16px, primary) + "TruthSerum" (12px, bold, primary) + optional topic badge

### 2.10 Source Card (in Assistant)
- **Background**: `background`
- **Border**: 1px `border`
- **Radius**: 8
- **Padding**: 10
- **Header**: collection (12px, bold, primary, uppercase) | reference (11px) | grade (11px, italic)
- **Preview**: 13px, 3 lines max, line-height 18
- **Link**: "Open ->" 12px, primaryLight, bold

### 2.11 Learning Path Card
- **Background**: `surface`
- **Radius**: 14
- **Padding**: 16
- **Shadow**: card shadow
- **Margin bottom**: 14
- **Structure**:
  ```
  [Header row]
    [Icon circle: 48x48, 24 radius, difficulty color at 8% opacity bg, 24px icon]
    [Meta: Title (17px bold) + Badge row (difficulty uppercase 12px + lesson count 12px)]
  [Description] (14px, secondary, line-height 20, max 2 lines)
  [Progress row]
    [Track: flex 1, 6pt height, 3 radius, border bg, filled portion in difficulty color]
    [Count: "X/Y" 12px, bold, secondary, 30pt min-width, right-aligned]
  ```

### 2.12 Lesson Card (in path)
- **Layout**: Row (number circle | body | status icon)
- **Background**: `surface`
- **Radius**: 12
- **Padding**: 14
- **Gap**: 12
- **Number circle**: 32x32, background bg, 1px border, centered text 14px bold secondary
- **Title**: 15px, semibold
- **Summary**: 13px, secondary, 2 lines max
- **Duration**: 12px, secondary, "X min read"
- **Status icons**: checkmark-circle (completed, primary), ellipse-outline (not started, border)

### 2.13 Share Sheet (Bottom Sheet)
- **Sheet bg**: `surface`
- **Top corners radius**: 20
- **Handle**: 40w x 4h, `border` color, centered, 16 bottom margin
- **Preview card**: `background` bg, 12 radius, 14 padding, 1px `border`
  - Arabic (16px, RTL, 2 lines)
  - English (14px, 2 lines)
  - Source line (12px, secondary)
  - Verified row: checkmark-circle (14px, primary) + "Verified" (12px, bold, primary) + "Authentic Hadith" (11px, secondary, right-aligned)
- **Primary CTA**: full-width, primary bg, row with paper-plane icon + "Share Privately"
- **Secondary row**: two icon buttons centered with 32pt gap
  - Copy Text: copy-outline 22px + label 12px
  - More...: ellipsis 22px + label 12px
- **Footer**: "Sharing knowledge is sadaqah." 12px, italic, secondary, centered

### 2.14 Profile Avatar Section
- **Background**: `surface`
- **Border bottom**: 1px `border`
- **Padding**: 32v
- **Avatar circle**: 88x88, 44 radius, `background` bg, 2px `primary` border, person icon 48px
- **Name**: 20px, bold, centered
- **Email/status**: 13px, secondary, centered
- **Premium badge**: row, accent bg at 12%, 10h 4v padding, 12 radius
  - star icon 14px accent + "Premium" 12px bold accent

### 2.15 Menu Item
- **Container**: `surface` bg, 12 radius, overflow hidden
- **Item**: row, 14v 16h padding, 12 gap
  - Icon: 20px, primary
  - Label: 15px, medium, flex 1
  - Chevron: 18px, secondary
- **Border bottom**: 1px `border` between items

---

## 3. SCREEN-BY-SCREEN SPECS

### 3.1 Home Screen (`/(tabs)/index`)
```
[Nav Header: "Home", primary bg, white text]

[Hero Section — primary bg, center-aligned]
  Bismillah (22px, accent, center)          ← "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"
  "Authentic Hadith" (26px, bold, white)
  Subtitle (14px, white 80% opacity)        ← "Verified narrations from the..."
  Padding: 24h, 16t, 24b

[Body — background bg]
  "Hadith of the Moment" (18px, bold, 20t 16h margin)

  [HadithCard component]                    ← Random hadith, tappable

  [Show Another button]                     ← Primary button, centered, 16t margin
    "Show Another" (15px, bold, white)
    24h 12v padding, 8 radius
```

### 3.2 Collections Screen (`/(tabs)/collections`)
```
[Nav Header: "Collections"]

[Grid — 2 columns, 12pt padding, space-between]
  [Collection Card] x N
    surface bg, 12 radius, 16 padding, 4 margin, center-aligned
    Min height: 120
    Shadow: card-light

    book icon (28px, primary)
    Collection name (14px, bold, center, max 2 lines)    ← e.g. "Sahih al-Bukhari"
    Count (12px, secondary)                              ← e.g. "7,275 hadith"

    Tap → Search filtered by collection
```

### 3.3 Search Screen (`/(tabs)/search`)
```
[Nav Header: "Search"]

[Filter bar — conditional]                   ← Only if collection filter active
  accent 13% bg, 16h 8v padding
  "Filtering: {name}" (13px, bold, primaryDark)
  close-circle icon (20px, error)

[Search bar component]                       ← 16 margin, 8 bottom margin
  Placeholder: "Search hadith — try 'washing', 'patience', 'wives'..."

[Search button]                              ← Full width, primary bg, 16h 8b margin
  "Search" (15px, bold, white), 12v padding, 8 radius

[States:]
  Loading: centered spinner
  Empty results: search-outline icon (48px, border) + hint text
  Results: count label (13px, secondary) + FlatList of HadithCards
  Initial: book-outline icon (48px) + "Search across all collections"
           + italic hint about smart search
```

### 3.4 Learn Screen (`/(tabs)/learn`)
```
[Nav Header: "Learning Paths", primary bg]

[Header hero — primary bg]
  "Learning Paths" (22px, bold, white)
  "Structured journeys through authentic hadith" (14px, white 80%)
  Padding: 20h, 12t, 16b

[Topics section — surface bg, border-bottom 1px]
  "Look up a topic" (15px, bold, 16h padding)
  [Horizontal ScrollView — 16h padding, 8 gap, 12 bottom padding]
    [Topic Chip] x 20                        ← See component 2.4
    Labels: Prayer, Fasting, Marriage, Patience, Eating Etiquette,
            Purification, Parents, Charity, Knowledge, Honesty,
            Death & Afterlife, Anger, Kindness, Children, Sleep,
            Modesty, Gratitude, Neighbors, Greeting, Repentance

[FlatList — 16 padding]
  "Learning Paths" (15px, bold, 12 bottom margin)

  [Learning Path Card] x 4                   ← See component 2.11
    1. Foundations of Faith — beginner (green) — heart icon — 12 lessons
    2. Daily Practice — intermediate (amber) — sunny icon — 15 lessons
    3. Character & Conduct — advanced (orange) — people icon — 18 lessons
    4. Scholars' Deep Dive — scholar (purple) — school icon — 20 lessons
```

### 3.5 Assistant Screen (`/(tabs)/assistant`)
```
[Nav Header: "Assistant"]

[Chat area — FlatList, 16 padding]
  [Welcome message — assistant bubble]
    sparkles + "TruthSerum" header
    "Assalamu Alaikum! I'm TruthSerum..." text

  [Popular topics grid — shown initially]
    "Popular topics" (13px, semibold, secondary)
    [Flex wrap grid, 8 gap]
      [Topic Chip] x 12                      ← First 12 from QUICK_TOPICS

  [User messages — right-aligned green bubbles]
  [Assistant responses — left-aligned white bubbles with sources]
    Each response may contain:
    - Topic badge (uppercase, primary, tiny)
    - Response text with bold topic name
    - Source cards (up to 5) — tappable

[Typing indicator — conditional]
  Row: spinner + "Searching across 36,000+ hadith..." (13px, italic)

[Input bar — surface bg, border-top 1px]
  8v 12h padding, 8 gap
  [Rounded input] background bg, 20 radius, 16h 10v padding, 15px font, max 100h
    Placeholder: "Ask about eating, prayer, washing, patience..."
  [Send button] primary bg, 40x40, 20 radius, send icon 20px white
    Disabled state: 50% opacity
```

### 3.6 Profile Screen (`/(tabs)/profile`)
```
[Nav Header: "Profile"]

[Avatar section — surface bg, border-bottom]   ← See component 2.14
  Avatar circle with person icon
  Display name or "Guest User"
  Email or "Not signed in"
  [Premium badge — conditional]

[Guest state:]
  [Sign In — primary button]                    ← 16h margin, 20t margin
  [Create Account — outline button]             ← 10 gap below

[Auth state:]
  [Menu section — surface bg, 12 radius]        ← 16h, 20t margin
    [My Referral Code — qr-code icon]
    [Redeem a Code — gift icon]

[About section — surface bg, 12 radius]         ← 20t, 16h margin, 16 padding
  "About" (16px, bold)
  About text (14px, secondary, line-height 22)

[Invite Friends button]                          ← primary bg, row, 12 radius
  people-outline icon + "Invite Friends"

[App Info section]
  Version: 1.0.0
  Hadith Database: ~36,246 narrations
  Languages: Arabic, English
  [Premium Until — conditional]

[Sign Out button — conditional]                  ← 1px error border, error text
```

### 3.7 Hadith Detail Screen (`/hadith/[id]`)
```
[Nav Header: "Hadith Detail", share icon in header right (white, 22px)]

[ScrollView — background bg, 16v padding]
  [HadithCard — showFull mode]                  ← No line truncation
    Full Arabic text
    Full English text
    All metadata

[ShareSheet — modal, triggered by header share button]
```

### 3.8 Login Screen (`/auth/login` — modal)
```
[Background: background bg]
[Content: 24h padding, 60t padding]

"بِسْمِ اللَّهِ" (24px, accent, center)
"Welcome Back" (28px, bold, center)
"Sign in to continue your learning" (15px, secondary, center)

[Error banner — conditional] (#fdecea bg, error text, 8 radius, 10 padding)

[Form: 4 gap]
  "Email" label (14px, bold, 12t margin)
  [Input: surface bg, 1px border, 10 radius, 14h 12v padding]

  "Password" label
  [Input: secure entry]

  [Sign In button] — primary, 20t margin
  "Forgot password?" link (primaryLight, center)

  [Divider: line — "or" — line]

  [Create Account] — outline button
  "Continue as Guest" (secondary text, center)
```

### 3.9 Path Lessons Screen (`/learn/[pathId]`)
```
[Nav Header: dynamic title e.g. "Foundations of Faith"]

[FlatList — background bg, 16 padding]
  Header: "12 LESSONS" (13px, bold, secondary, uppercase, 0.5 letter-spacing)

  [Lesson Card] x N                            ← See component 2.12
    Row: [Number circle] [Body: title + summary + duration] [Status icon]
```

### 3.10 Lesson Detail Screen (`/learn/lesson/[lessonId]`)
```
[Nav Header: dynamic lesson title]

[ScrollView — background bg]
  [Teaching section — surface bg, 12 radius, 16 margin+padding]
    Teaching text (16px, line-height 26)

  [Related Hadith section]
    "Related Hadith (N)" (16px, bold, 16h margin)
    [HadithCard] x N

  [Complete section — 16h margin, 20t margin]
    [Not completed: primary button]
      checkmark-circle-outline + "Mark as Complete"
    [Completed: banner]
      primary 8% bg, 1px primary 25% border, 12 radius
      checkmark-circle + "Lesson completed" (primary, bold)
```

### 3.11 Share Sheet (Modal overlay)
```
[Backdrop: rgba(0,0,0,0.35), tappable to dismiss]

[Sheet: surface bg, 20 top-radius]
  [Handle bar: 40x4, border color, centered]

  [Preview card]                                ← See component 2.13

  [Share Privately] — primary button with paper-plane icon

  [Secondary row: Copy Text | More...]

  "Sharing knowledge is sadaqah." — footer
```

---

## 4. FIGMA SETUP INSTRUCTIONS

### 4.1 Page Structure
Create these pages in your Figma file:
1. **Design Tokens** — Colors, typography, spacing, shadows
2. **Components** — All reusable components as Figma components with variants
3. **Screens — Tabs** — Home, Collections, Search, Learn, Assistant, Profile
4. **Screens — Detail** — Hadith Detail, Path Lessons, Lesson Detail
5. **Screens — Auth** — Login, Signup, Forgot Password
6. **Screens — Modals** — Share Sheet
7. **Screens — Misc** — Redeem Code, My Referral QR

### 4.2 Frame Sizes
- iPhone 15 Pro: 393 x 852 (primary target)
- iPhone SE: 375 x 667 (small screen test)
- Android Pixel: 412 x 892

### 4.3 Component Variants to Build

**Button**
- Variant: Primary / Outline / Danger
- State: Default / Pressed / Disabled / Loading

**HadithCard**
- Variant: Preview (4 lines) / Full
- Grade: Sahih / Hasan / Da'if / None

**Chat Bubble**
- Variant: User / Assistant
- Has sources: Yes / No
- Has topic badge: Yes / No

**Learning Path Card**
- Difficulty: Beginner / Intermediate / Advanced / Scholar

**Lesson Card**
- Status: Not Started / In Progress / Completed

**Topic Chip**
- State: Default / Pressed

**Input Field**
- State: Empty / Filled / Error
- Type: Text / Password / Email

### 4.4 Auto Layout Settings
- Most containers use **vertical auto layout** with specific gaps
- Card interiors typically 12-16pt gap
- Row layouts (meta, menu items) use **horizontal auto layout**
- Topic chips use horizontal scroll (in Figma, use horizontal auto layout with clip content)

### 4.5 Color Styles to Create
Create these as Figma color styles:
```
Primary/Default     #1a5e3a
Primary/Light       #2d8a5e
Primary/Dark        #0f3d25
Neutral/Background  #f5f5f0
Neutral/Surface     #ffffff
Neutral/Text        #1a1a1a
Neutral/Secondary   #666666
Neutral/Arabic      #2c2c2c
Neutral/Border      #e0e0e0
Accent/Gold         #c9a84c
Semantic/Error      #d32f2f
Semantic/Success    #2e7d32
Semantic/Warning    #f9a825
```

### 4.6 Text Styles to Create
Create these as Figma text styles matching the typography table in section 1.2.

---

## 5. FLOW MAP

```
App Launch
  └─> Tab Bar
       ├── Home
       │     └── HadithCard tap → Hadith Detail
       │                           └── Share button → Share Sheet
       ├── Collections
       │     └── Collection tap → Search (filtered)
       ├── Search
       │     └── HadithCard tap → Hadith Detail
       ├── Learn
       │     ├── Topic chip tap → Search (with query)
       │     └── Path card tap → Path Lessons
       │                          └── Lesson tap → Lesson Detail
       │                                            ├── HadithCard tap → Hadith Detail
       │                                            └── Mark Complete
       ├── Assistant
       │     ├── Topic chip tap → sends query
       │     └── Source card tap → Hadith Detail
       └── Profile
             ├── [Guest] Sign In → Login (modal)
             │            Create Account → Signup (modal)
             ├── [Auth] My Referral Code → QR Screen
             │          Redeem a Code → Redeem Screen
             ├── Invite Friends → System share
             └── Sign Out
```

---

## 6. ANIMATION & INTERACTION NOTES

| Interaction         | Behavior                                    |
|---------------------|---------------------------------------------|
| Card press          | Opacity drops to 0.7-0.85                   |
| Button press        | Opacity drops to 0.85                       |
| Share Sheet         | Slides up from bottom (`animationType="slide"`) |
| Auth modals         | Modal presentation (iOS: card slide up)     |
| Chat scroll         | Auto-scrolls to bottom on new message       |
| Loading states      | ActivityIndicator spinner, primary color     |
| Tab switching       | Instant (no transition)                      |
| Topic chips scroll  | Horizontal momentum scroll, no indicator     |

---

*Generated from AuthenticHadithApp codebase — February 2026*
