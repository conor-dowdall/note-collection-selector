# Note Collection Selector Web Component

`note-collection-selector` is a custom HTML element that allows users to select
a musical note collection (e.g., "Major", "Dorian", ... "Major Pentatonic", ...)
from a dialog and dispatch a custom event.

- displays a button which opens a dialog containing grouped note collections.
- includes a "more info" toggle to show details about each collection.
- dispatches an event with the collection key and full collection object in the
  details.

## Bundle

Create the `dist/bundle.js` file for the example

### Deno

```bash
deno task bundle
```

### Node

```bash
npm run bundle
```

**See examples/example1.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Note Collection Selector Example</title>
    <script type="module" src="../dist/bundle.js"></script>
  </head>
  <body>
    <h1>Note Collection Selector</h1>
    <note-collection-selector
      selected-note-collection-key="ionian"
    ></note-collection-selector>

    <script type="module">
      const selector = document.querySelector(
        "note-collection-selector",
      );

      selector.addEventListener("note-collection-selected", (e) => {
        console.log("Key:", e.detail.noteCollectionKey);
        console.log("Collection:", e.detail.noteCollection);
      });
    </script>
  </body>
</html>
```

## Features

- **Note Collection Selection:** Provides a user-friendly interface for choosing
  scales, chords, and other note collections.
- **Event Handling:** Dispatches a `note-collection-selected` event when the
  user makes a selection, providing the selected key and data object.
- **Attributes and Properties:**
  - `selected-note-collection-key` / `selectedNoteCollectionKey`: Gets or sets
    the selected note collection key (e.g., "ionian").
  - `selectedNoteCollection` (read-only): Gets the full data object for the
    selected note collection.
- **Methods:**
  - `setRandomNoteCollection()`: Programmatically selects a new, random note
    collection.

## Styling and Customization

The component's appearance can be customized in several ways.

### Slots (for Icons)

You can replace the default icons for the main button and the close button using
HTML slots.

- **Main Button Icon:** Provide an element (e.g., `<img>`, `<svg>`,
  `<p>Select Scale</p>`) directly inside the `<note-collection-selector>` tag.
  This will replace the default icon that appears when no collection is
  selected.

- **Close Button Icon:** To replace the 'X' icon in the dialog, add an element
  with the attribute `slot="close-dialog-icon"`.

```html
<note-collection-selector>
  <!-- This SVG replaces the default main button icon -->
  <svg><!-- your custom svg --></svg>

  <!-- This SVG replaces the default close icon in the dialog -->
  <svg slot="close-dialog-icon"><!-- your custom svg --></svg>
</note-collection-selector>
```

### Styling using `::part()`

The internal elements are exposed via shadow parts. This allows you to directly
style them from your global stylesheet.

**Main Button** (`main-button`)

```css
note-collection-selector::part(main-button) {
  border: 1px solid currentColor;
  border-radius: 0.6em;
  padding: 0.3em 1em;
}

note-collection-selector::part(main-button):hover {
  background-color: color-mix(in srgb, currentColor 20%, transparent 80%);
}
```

**Dialog** (`dialog`)

```css
note-collection-selector::part(dialog) {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 0.5em;
  padding: 1em;
}

note-collection-selector::part(dialog)::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}
```

**Note Collection Buttons** (`note-collection-button`)

```css
note-collection-selector::part(note-collection-button) {
  border-radius: 0.5em;
  border: 0.1em solid currentColor;
  padding: 0.5em;
  text-align: left;
}
```

**Close Dialog Button** (`close-dialog-button`)

```css
note-collection-selector::part(close-dialog-button) {
  background: transparent;
  border: 1px solid currentColor;
  border-radius: 50%;
  padding: 0.2em;
}
```

**Clear Selection Button** (`clear-selection-button`)

```css
note-collection-selector::part(clear-selection-button) {
  border-radius: 0.5em;
  border: 0.1em solid currentColor;
  padding: 0.5em;
}
```

### CSS Custom Properties

The following CSS custom properties are available for quick customization:

- `--main-icon-size`: Size of the icon in the main button (default: `2.5ch`).
- `--close-dialog-icon-size`: Size of the close icon in the dialog (default:
  `2ch`).
- `--dialog-backdrop-background`: Background of the dialog backdrop (default:
  `light-dark(rgb(255 255 255 / 50%), rgb(0 0 0 / 50%))`).
