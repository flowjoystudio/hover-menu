# fj-hover-menu

A lightweight safe triangle dropdown script for hover menus with nested submenus. Prevents submenus from closing when moving the cursor diagonally from a parent item to a submenu — a common and frustrating UX issue in hover-based navigation.

Built for Webflow but works on any HTML page. No dependencies, no frameworks.

---

## The problem it solves

When you hover over a menu item that reveals a submenu, moving your cursor diagonally toward the submenu can cause it to close unexpectedly — because the cursor briefly leaves the parent item's hover area. This script solves that by drawing an invisible safe triangle between your cursor and the submenu, keeping the submenu open while you move toward it.

---

## Installation

Add the following `<script>` tag to your page's `<head>` or before `</body>`. Replace `@1.0.0` with the latest release version.

```html
<script defer src="https://cdn.jsdelivr.net/gh/flowjoystudio/fj-hover-menu@1.0.0/fj-hover-menu.js"></script>
```

---

## Attributes

### Required

| Attribute | Value | Element |
|---|---|---|
| `fj-hover-menu` | `parent` | The menu item wrapper containing both the trigger and submenu |
| `fj-hover-menu` | `submenu` | The nested submenu element |
| `fj-hover-menu-direction` | `right` or `down` | On the parent — controls which direction the submenu opens |

### Transition controls (optional)

| Attribute | Value | Default | Description |
|---|---|---|---|
| `fj-hover-menu-duration` | Number in ms e.g. `300` | `150` | Transition speed |
| `fj-hover-menu-easing` | Any CSS easing e.g. `ease-in-out` | `ease` | Transition curve |
| `fj-hover-menu-transition` | `fade`, `slide`, or `fade-slide` | `fade` | Transition style |

**Transition styles:**
- `fade` — submenu fades in and out
- `slide` — submenu slides in from the direction it opens (right menus slide from left, down menus slide from above)
- `fade-slide` — combination of both fade and slide

### CSS hook

When a submenu is open, the script adds a `fj-hover-menu-open` attribute to the parent element. Use this in CSS to style the active state of the trigger — for example rotating an arrow icon or changing text colour.

```css
[fj-hover-menu="parent"][fj-hover-menu-open] .arrow-icon {
  transform: rotate(180deg);
}

[fj-hover-menu="parent"][fj-hover-menu-open] > span {
  color: blue;
}
```

---

## Webflow setup

### Step 1 — Add the script

Paste the `<script>` tag into **Project Settings → Custom Code → Head Code** for site-wide use, or into **Page Settings → Custom Code → Before </body> tag** for page-specific use.

### Step 2 — Structure your dropdown in Webflow

The script takes full control of showing and hiding submenus. Do not add Webflow Interactions or CSS hover states to show or hide the submenu — these will conflict with the script.

Style your submenu exactly as you want it to appear when open. The script will handle visibility on the live site.

A typical structure in the Navigator for a **navbar dropdown**:

```
Navbar Menu (or Div Block)
└── Div Block  (fj-hover-menu = parent, fj-hover-menu-direction = down)
    ├── Link Block or Text Block  ← the visible trigger
    └── Div Block  (fj-hover-menu = submenu)  ← the dropdown panel
        ├── Link Block  ← nested item
        ├── Link Block  ← nested item
        └── Link Block  ← nested item
```

A typical structure for a **sidebar or context menu**:

```
Div Block  (fj-hover-menu = parent, fj-hover-menu-direction = right)
├── Link Block or Text Block  ← the visible trigger
└── Div Block  (fj-hover-menu = submenu)  ← the submenu panel
    ├── Link Block  ← nested item
    ├── Link Block  ← nested item
    └── Link Block  ← nested item
```

### Step 3 — Add attributes

In the Webflow Designer, open the **Navigator** panel (Cmd/Ctrl + U) to locate the correct elements. Select each element, open the **Element Settings** panel (D key), scroll down to **Custom Attributes**, and add the attribute name and value.

**On the parent wrapper** (the Div Block containing both the trigger and the submenu):

| Attribute | Value |
|---|---|
| `fj-hover-menu` | `parent` |
| `fj-hover-menu-direction` | `right` or `down` |
| `fj-hover-menu-duration` | e.g. `250` (optional) |
| `fj-hover-menu-easing` | e.g. `ease-in-out` (optional) |
| `fj-hover-menu-transition` | `fade`, `slide`, or `fade-slide` (optional) |

**On the submenu panel** (the Div Block that contains the nested items):

| Attribute | Value |
|---|---|
| `fj-hover-menu` | `submenu` |

> **Important:** The submenu must be a direct or nested child of the parent element. The script uses `querySelector` to find it inside the parent.

---

## Examples

### Basic right-opening submenu

```html
<div fj-hover-menu="parent" fj-hover-menu-direction="right">
  <span>Products</span>
  <div fj-hover-menu="submenu">
    <a href="/product-1">Product One</a>
    <a href="/product-2">Product Two</a>
    <a href="/product-3">Product Three</a>
  </div>
</div>
```

### Downward dropdown with fade-slide transition

```html
<div fj-hover-menu="parent"
  fj-hover-menu-direction="down"
  fj-hover-menu-transition="fade-slide"
  fj-hover-menu-duration="250"
  fj-hover-menu-easing="ease-in-out">
  <span>Solutions</span>
  <div fj-hover-menu="submenu">
    <a href="/solution-1">Solution One</a>
    <a href="/solution-2">Solution Two</a>
  </div>
</div>
```

### Styling the active trigger state

```css
/* Rotate arrow when submenu is open */
[fj-hover-menu="parent"][fj-hover-menu-open] .arrow {
  transform: rotate(180deg);
  transition: transform 200ms ease;
}
```

---

## How it works

1. On page load the script finds all `fj-hover-menu="parent"` elements and hides their submenus
2. When the cursor enters a parent element the submenu opens with the configured transition
3. An invisible SVG safe triangle is drawn between the cursor position and the submenu
4. As the cursor moves, the triangle redraws to always point from the current cursor position toward the submenu
5. The submenu stays open as long as the cursor is over the parent, the submenu, or anywhere inside the safe triangle
6. When the cursor leaves all three areas the submenu closes
7. Only one submenu can be open at a time — opening a new one closes the previous

---

## Known limitations

- Touch devices are detected automatically and the script does nothing — submenus will need a separate click/tap solution for mobile
- Only one submenu can be open at a time — deeply nested multi-level menus are not currently supported
- The submenu must be inside the parent element in the DOM
- Do not use Webflow Interactions or CSS `:hover` to show/hide the submenu — use `fj-hover-menu-open` for active state styling instead
- If `fj-hover-menu-direction` is missing or has an invalid value, the script will skip that dropdown and log a warning in the browser console

---

## License

MIT
