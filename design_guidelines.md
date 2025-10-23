# Financial Assistance App Design Guidelines

## Design Approach

**Selected Approach:** Design System (Material Design-inspired)
**Justification:** Financial management apps are utility-focused with information-dense displays where clarity, consistency, and data visualization take precedence over visual flair. Users need reliable, learnable interfaces for daily financial tracking.

**Key Design Principles:**
- Data clarity over decoration
- Trust through professional aesthetics
- Efficient information hierarchy
- Scannable financial metrics

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: 222 15% 12% (deep slate)
- Surface: 222 15% 16% (elevated cards)
- Primary: 210 80% 55% (trustworthy blue)
- Success: 142 70% 45% (income/positive)
- Danger: 0 70% 55% (expense/negative)
- Warning: 38 90% 60% (budget alerts)
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 65%

**Light Mode:**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary: 210 80% 50%
- Text Primary: 222 15% 15%
- Text Secondary: 222 10% 45%

### B. Typography

**Font Family:** Inter (Google Fonts) for UI, JetBrains Mono for financial numbers
**Hierarchy:**
- Display (Dashboard Headers): 36px/40px, font-bold
- Page Titles: 24px/32px, font-semibold
- Section Headers: 18px/24px, font-semibold
- Body Text: 15px/22px, font-normal
- Financial Values: 20px/28px, JetBrains Mono, font-medium
- Caption/Labels: 13px/18px, font-normal, text-secondary

### C. Layout System

**Spacing Primitives:** Tailwind units of 4, 6, 8, 12 for consistent rhythm
- Component padding: p-6 or p-8
- Section spacing: space-y-8 or space-y-12
- Card gaps: gap-6
- Form field spacing: space-y-4

**Grid System:**
- Dashboard: 12-column grid, gap-6
- Mobile: Single column, space-y-6

### D. Component Library

**Navigation:**
- Side navigation (desktop) with icons and labels
- Bottom tab bar (mobile) with 4 primary sections: Dashboard, Tracking, Budget, Goals
- Active state: primary color with subtle left border indicator

**Dashboard Cards:**
- Elevated surface background (surface color)
- Rounded corners: rounded-xl
- Shadow: subtle shadow-lg in light mode, border in dark mode
- Padding: p-6
- Header with icon, title, and optional action button

**Financial Metric Cards:**
- Large numerical display (JetBrains Mono)
- Color-coded based on type (income=success, expense=danger)
- Percentage change indicator with up/down arrows
- Trend sparkline (optional mini chart)

**Data Tables:**
- Striped rows for readability
- Sticky header
- Right-aligned numerical columns
- Category color badges
- Sort indicators on headers

**Forms (Transaction Entry):**
- Floating labels for inputs
- Amount input with currency symbol prefix
- Category dropdown with color-coded icons
- Date picker with calendar popup
- Split input for income/expense toggle
- Clear visual feedback for validation

**Charts & Visualizations:**
- Donut chart for expense breakdown by category
- Line chart for income vs expense trends
- Bar chart for budget comparison
- Area chart for net worth over time
- Color palette from design system
- Interactive tooltips on hover
- Legend with colored dots

**AI Assistant Section:**
- Chat-style interface with message bubbles
- User messages: right-aligned, primary color background
- AI responses: left-aligned, surface color background
- Typing indicator animation
- Quick action chips for common queries
- Insight cards highlighting key recommendations

**Budget & Goals:**
- Progress bars with percentage fill
- Goal cards showing target, current, and remaining amounts
- Timeline visualization for goal milestones
- Budget alert badges when limits exceeded

### E. Interactions & Animations

**Minimal Animation Approach:**
- Smooth page transitions: 200ms ease
- Card hover: subtle lift with shadow increase
- Button states: 150ms color transition
- Chart animations: 400ms ease-in-out on load only
- No continuous/distracting animations

## Images

**Dashboard Hero (Optional):**
- Abstract financial growth illustration or data visualization pattern
- Placement: Top of dashboard as banner, max-h-48, gradient overlay for text contrast
- Style: Subtle, non-distracting, reinforces trust and growth themes

**Empty States:**
- Simple illustrations for when no data exists
- Friendly but professional tone
- Include clear call-to-action

## Mobile Considerations

- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly targets: minimum 44px height for interactive elements
- Simplified charts on mobile (focus on key metrics)
- Collapsible sections for information density
- Swipe gestures for transaction history

## Accessibility

- WCAG AA contrast ratios maintained across color palette
- Consistent dark mode throughout (including all inputs, modals, dropdowns)
- Clear focus indicators (2px ring in primary color)
- Screen reader labels for all interactive elements
- Keyboard navigation support for all features