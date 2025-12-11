/**
 * @module
 * A custom element for selecting musical note collections (scales, chords, etc.).
 *
 * @fires {CustomEvent<NoteCollectionSelectedEventDetail>} note-collection-selected - Dispatched when a note collection is selected.
 *
 * @example
 * ```html
 * <note-collection-selector
 *   id="my-selector"
 *   selected-note-collection-key="ionian"
 * ></note-collection-selector>
 * ```
 *
 * ```javascript
 * const selector = document.getElementById('my-selector');
 * selector.addEventListener('note-collection-selected', (event) => {
 *   console.log('Selected key:', event.detail.noteCollectionKey);
 *   console.log('Selected collection:', event.detail.noteCollection);
 * });
 *
 * // Programmatically change the selection
 * selector.selectedNoteCollectionKey = 'dorian';
 * ```
 */
import {
  groupedNoteCollections,
  noteCollectionGroupsMetadata,
  noteCollections,
} from "@musodojo/music-theory-data";
import type {
  NoteCollection,
  NoteCollectionGroupKey,
  NoteCollectionKey,
} from "@musodojo/music-theory-data";

const noteCollectionSelectorTemplate = document.createElement("template");
noteCollectionSelectorTemplate.innerHTML = /* HTML */ `
  <style>
    :host {
      --_main-icon-size: var(--main-icon-size, 2.5ch);
      --_close-dialog-icon-size: var(--close-dialog-icon-size, 2ch);

      --_dialog-backdrop-background: var(
        --dialog-backdrop-background,
        light-dark(rgb(255 255 255 / 50%), rgb(0 0 0 / 50%))
      );

      --_default-spacing: var(--default-spacing, 0.5em);

      display: inline-block;
      font-size: inherit;
    }

    button {
      font: inherit;
      margin: 0;
      padding: 0;
      cursor: pointer;
      background: none;
      border: none;
    }

    svg {
      fill: currentColor;
    }

    [part="main-button"] {
      display: grid;
      place-items: center;

      min-width: var(--_main-icon-size);

      & > #main-button-text-span {
        grid-area: 1 / 1;
      }

      & > slot {
        height: var(--_main-icon-size);
      }

      /* Size icons, but let text content flow naturally */
      & > ::slotted(svg),
      & > ::slotted(img),
      & > slot > svg {
        width: var(--_main-icon-size);
        height: var(--_main-icon-size);
        /* Ensure icons are on the same grid cell if multiple are slotted */
        grid-area: 1 / 1;
      }
    }

    [part="dialog"] {
      padding: var(--_default-spacing);

      & > [part="close-dialog-button"] {
        display: grid;
        place-items: center;
        padding: var(--_default-spacing);
        border: none;
        margin-inline-start: auto;
        margin-block-end: var(--_default-spacing);

        /* Size icons, but let text content flow naturally */
        & > ::slotted(svg),
        & > ::slotted(img),
        & > slot[name="close-dialog-icon"] > svg {
          width: var(--_close-dialog-icon-size);
          height: var(--_close-dialog-icon-size);
          /* Ensure icons are on the same grid cell if multiple are slotted */
          grid-area: 1 / 1;
        }
      }

      & > #toggle-more-info-label {
        padding: 0.5em;
        border: 0.1em solid currentColor;
        border-radius: 0.5em;
        cursor: pointer;
      }

      & > #note-collections-div {
        display: flex;
        flex-direction: column;
        gap: var(--_default-spacing);
        margin-block-start: 2em;

        & > #note-collection-group-wrapper {
          & > #note-collection-group-div {
            margin-block: 0.5em;
            display: flex;
            flex-wrap: wrap;
            gap: 1em;
          }

          & > h3 {
            margin: 0em;
          }
        }
      }
    }

    [part="dialog"]::backdrop {
      background: var(--_dialog-backdrop-background);
    }

    .note-collection-option {
      padding: 0.5em;
      min-width: 4ch;
      max-width: 80ch;
      border: 0.1em solid currentColor;
      border-radius: 0.5em;
      cursor: pointer;
      text-align: left;
      text-wrap: pretty; /* Enable smart text wrapping if supported */

      & > .note-collection-name {
        font-weight: bold;
        font-size: 1.1em;
      }

      /* Style for the currently selected option */
      &[data-selected="true"] {
        border-color: var(--accent-color, blue);
        outline: 0.1em solid var(--accent-color, blue);
      }

      /* When the "more info" div is hidden, center the text */
      &:has(> .more-info-div.hidden) {
        text-align: center;
      }

      & > .more-info-div {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
      }

      & > .more-info-div.hidden {
        display: none;
      }
    }

    .hidden {
      display: none;
    }

    .visually-hidden {
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      height: 1px;
      overflow: hidden;
      position: absolute;
      white-space: nowrap;
      width: 1px;
    }
  </style>

  <button part="main-button">
    <span id="main-button-text-span" style="display: none;"></span>
    <slot>
      <!-- Default icon when no note is selected. Can be overridden by the user. This
      SVG is part of the project and is licensed under CC0 1.0 Universal. -->
      <svg viewBox="0 -960 960 960">
        <path
          d="M 705 -793.04688 A 158.9 237.09 59.29 0 0 564.0625 -748.82812 A 158.9 237.09 59.29 0 0 423.51562 -551.09375 A 158.9 237.09 59.29 0 0 423.51562 -546.71875 L 423.51562 -530.3125 A 158.9 237.09 59.29 0 0 239.0625 -487.96875 A 158.9 237.09 59.29 0 0 113.125 -230.46875 A 158.9 237.09 59.29 0 0 255.78125 -167.73438 A 158.9 237.09 59.29 0 0 396.71875 -211.95312 A 158.9 237.09 59.29 0 0 537.26562 -409.6875 A 158.9 237.09 59.29 0 0 537.26562 -414.0625 L 537.26562 -430.46875 A 158.9 237.09 59.29 0 0 721.71875 -472.8125 A 158.9 237.09 59.29 0 0 847.65625 -730.3125 A 158.9 237.09 59.29 0 0 705 -793.04688 z M 642.89062 -610.78125 L 476.32812 -513.51562 A 158.9 237.09 59.29 0 0 476.25 -513.59375 L 642.89062 -610.78125 z M 484.45312 -447.26562 A 158.9 237.09 59.29 0 0 484.53125 -447.1875 L 317.89062 -350 L 484.45312 -447.26562 z"
        />
      </svg>
    </slot>
  </button>

  <dialog part="dialog" aria-labelledby="dialog-heading">
    <button part="close-dialog-button" aria-label="Close Dialog">
      <slot name="close-dialog-icon">
        <!-- Default icon when no note is selected. Can be overridden by the user. 
         This SVG is part of the project and is licensed under CC0 1.0 Universal. -->
        <svg viewBox="0 -960 960 960">
          <path
            transform="rotate(-45)"
            d="m638.82-400h80v800h-80zm-360 360h800v80h-800z"
          />
        </svg>
      </slot>
    </button>

    <h2 id="dialog-heading" class="visually-hidden">
      Select a Note Collection
    </h2>

    <label id="toggle-more-info-label">
      <input type="checkbox" id="toggle-more-info-checkbox" />
      more info
    </label>

    <div id="note-collections-div">
      <!-- the buttons in here are dynamically generated 
       each with an attribute of part="note-collection-button" -->
    </div>
  </dialog>
`;

/**
 * The detail object for the `note-collection-selected` custom event.
 */
export interface NoteCollectionSelectedEventDetail {
  /** The unique key of the selected note collection (e.g., "ionian"), or `null` if cleared. */
  noteCollectionKey: NoteCollectionKey | null;
  /** The full data object for the selected note collection, or `null` if cleared. */
  noteCollection: NoteCollection | null;
}

/**
 * A web component that allows users to select a musical note collection.
 * It displays a button which, when clicked, opens a dialog with a list of options.
 */
export class NoteCollectionSelector extends HTMLElement {
  #shadowRoot: ShadowRoot;

  // cache these critical elements in the constructor with #cacheDomElements()
  // and throw an error if they are not found
  #mainButton!: HTMLButtonElement;
  #mainButtonTextSpan!: HTMLSpanElement;
  #mainButtonSlot!: HTMLSlotElement;
  #dialog!: HTMLDialogElement;
  #closeDialogButton!: HTMLButtonElement;
  #toggleMoreInfoCheckbox!: HTMLInputElement;
  #noteCollectionsDiv!: HTMLDivElement;

  #abortController: AbortController | null = null;
  #selectedNoteCollectionKey: NoteCollectionKey | null = null;
  #selectedNoteCollection: NoteCollection | null = null;

  static get observedAttributes(): string[] {
    return ["selected-note-collection-key"];
  }

  constructor() {
    super();
    this.#shadowRoot = this.attachShadow({ mode: "open" });
    this.#shadowRoot.appendChild(
      noteCollectionSelectorTemplate.content.cloneNode(true)
    );
    this.#cacheDomElements();
  }

  connectedCallback() {
    this.#populateNoteCollectionsDiv();
    this.#addEventListeners();
    this.#updateMainButton();
    this.#syncSelectedNoteCollectionKeyAttribute();
  }

  disconnectedCallback() {
    this.#abortController?.abort();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    // Only proceed if the attribute's value has actually changed
    if (oldValue === newValue) return;

    if (name === "selected-note-collection-key") {
      // Update the internal state with the new key
      this.selectedNoteCollectionKey = newValue as NoteCollectionKey | null;
      // Dispatch the selection event to notify consumers of the change
      this.#dispatchNoteCollectionSelectedEvent();
    }
  }

  #cacheDomElements() {
    const mainButton = this.#shadowRoot.querySelector<HTMLButtonElement>(
      '[part="main-button"]'
    );

    const mainButtonTextSpan = this.#shadowRoot.querySelector<HTMLSpanElement>(
      "#main-button-text-span"
    );

    const mainButtonSlot = mainButton?.querySelector<HTMLSlotElement>("slot");

    const dialog =
      this.#shadowRoot.querySelector<HTMLDialogElement>('[part="dialog"]');

    const closeDialogButton = this.#shadowRoot.querySelector<HTMLButtonElement>(
      '[part="close-dialog-button"]'
    );

    const toggleMoreInfoCheckbox =
      this.#shadowRoot.querySelector<HTMLInputElement>(
        "#toggle-more-info-checkbox"
      );

    const noteCollectionsDiv = this.#shadowRoot.querySelector<HTMLDivElement>(
      "#note-collections-div"
    );

    if (
      !mainButton ||
      !mainButtonTextSpan ||
      !mainButtonSlot ||
      !dialog ||
      !closeDialogButton ||
      !noteCollectionsDiv ||
      !toggleMoreInfoCheckbox
    ) {
      throw new Error(
        "NoteCollectionSelector: Critical elements not found in shadow DOM."
      );
    }

    this.#mainButton = mainButton;
    this.#mainButtonTextSpan = mainButtonTextSpan;
    this.#mainButtonSlot = mainButtonSlot;
    this.#dialog = dialog;
    this.#closeDialogButton = closeDialogButton;
    this.#toggleMoreInfoCheckbox = toggleMoreInfoCheckbox;
    this.#noteCollectionsDiv = noteCollectionsDiv;
  }

  #addEventListeners() {
    // abort any previous controllers before creating a new one
    this.#abortController?.abort();
    this.#abortController = new AbortController();
    const { signal } = this.#abortController;

    this.#mainButton.addEventListener(
      "click",
      () => {
        this.#dialog.showModal();
      },
      { signal }
    );

    this.#closeDialogButton.addEventListener(
      "click",
      () => {
        this.#dialog.close();
      },
      { signal }
    );

    this.#toggleMoreInfoCheckbox.addEventListener(
      "change",
      () => {
        this.#updateMoreInfoVisibility();
      },
      { signal }
    );
  }

  #populateNoteCollectionsDiv() {
    const frag = document.createDocumentFragment();

    // for each note collection group, add a wrapper div, which contains
    // a heading and a note collection group div
    Object.entries(noteCollectionGroupsMetadata).forEach(
      ([groupKey, groupMetadata]) => {
        const noteCollectionGroupKey = groupKey as NoteCollectionGroupKey;
        // wrapper for heading and note-collection
        const groupWrapper = document.createElement("div");
        groupWrapper.id = "note-collection-group-wrapper";
        groupWrapper.innerHTML = /* HTML */ `<h3>
          ${groupMetadata.displayName}
        </h3>`;

        // more info on the group (can hide)
        const groupMoreInfoDiv = document.createElement("div");
        groupMoreInfoDiv.classList.add("more-info-div", "hidden");
        groupMoreInfoDiv.textContent = `${groupMetadata.description}`;
        groupWrapper.appendChild(groupMoreInfoDiv);

        // div to group the current group of note collections
        const noteCollectionGroupDiv = document.createElement("div");
        noteCollectionGroupDiv.id = "note-collection-group-div";
        groupWrapper.appendChild(noteCollectionGroupDiv);

        const currentNoteCollectionGroup =
          groupedNoteCollections[groupKey as NoteCollectionGroupKey];
        groupedNoteCollections[noteCollectionGroupKey];

        Object.entries(currentNoteCollectionGroup).forEach(
          ([key, collection]) => {
            const noteCollectionBtn = document.createElement("button");
            noteCollectionBtn.classList.add("note-collection-option");
            // Set a data attribute to easily find this button later
            noteCollectionBtn.dataset.noteCollectionKey = key;
            noteCollectionBtn.innerHTML = /* HTML */ `<span
              class="note-collection-name"
            >
              ${collection.primaryName}
            </span>`;

            const collectionMoreInfoDiv = document.createElement("div");
            collectionMoreInfoDiv.classList.add("more-info-div", "hidden");
            collectionMoreInfoDiv.innerHTML =
              this.#getMoreInfoHTMLString(collection);
            noteCollectionBtn.appendChild(collectionMoreInfoDiv);

            noteCollectionBtn.addEventListener("click", () => {
              this.#selectedNoteCollectionKey = key as NoteCollectionKey;
              this.#selectedNoteCollection = collection;
              this.#updateMainButton();
              this.#syncSelectedNoteCollectionKeyAttribute();
              this.#handleSelectionChange(key as NoteCollectionKey, collection);
              this.#dialog.close();
            });

            noteCollectionGroupDiv.appendChild(noteCollectionBtn);
          }
        );

        frag.appendChild(groupWrapper);
      }
    );

    this.#noteCollectionsDiv.replaceChildren(frag);
    this.#updateSelectionInDialog();
  }

  /**
   * Handles the logic for when a new note collection is selected,
   * including updating state and UI.
   * @private
   */
  #handleSelectionChange(
    key: NoteCollectionKey | null,
    collection: NoteCollection | null
  ) {
    // Prevent redundant updates if the selection hasn't changed
    if (key === this.#selectedNoteCollectionKey) return;

    this.#selectedNoteCollectionKey = key;
    this.#selectedNoteCollection = collection;

    // Update all UI parts
    this.#updateMainButton();
    this.#syncSelectedNoteCollectionKeyAttribute();
    this.#updateSelectionInDialog();
  }

  /**
   * Renders the detailed "more info" content for a given note collection.
   * @private
   * @param {NoteCollection} noteCollection - The note collection data object.
   * @returns {string} A HTML string containing the detailed information.
   */
  #getMoreInfoHTMLString(noteCollection: NoteCollection): string {
    // TODO: replace this with updated code
    // <div>${noteCollection.exampleNotes.join(", ")}</div>
    return /* HTML */ `
      <div>${noteCollection.names.join(", ")}</div>
      <div>${noteCollection.intervals.join(", ")}</div>
      <div>${noteCollection.type.join(", ")}</div>
      <div>${noteCollection.characteristics.join(", ")}</div>
      <div>${noteCollection.patternShort.join("-")}</div>
      <div>${noteCollection.pattern.join(", ")}</div>
    `;
  }

  /**
   * Toggles the visibility of all "more info" sections within the element
   * based on the state of the `toggleMoreInfoCheckbox`.
   * @private
   */
  #updateMoreInfoVisibility() {
    const moreInfoElements = this.#shadowRoot?.querySelectorAll(
      ".more-info-div"
    ) as NodeListOf<HTMLDivElement>;
    moreInfoElements.forEach((el) => {
      el.classList.toggle("hidden", !this.#toggleMoreInfoCheckbox!.checked);
    });
  }

  /**
   * Updates the visual state of the buttons in the dialog to reflect the current selection.
   * It adds a 'selected' class to the currently selected button and removes it from any others.
   * @private
   */
  #updateSelectionInDialog() {
    const allOptionButtons = this.#noteCollectionsDiv.querySelectorAll(
      ".note-collection-option"
    );

    allOptionButtons.forEach((button) => {
      const btn = button as HTMLButtonElement;
      const isSelected =
        btn.dataset.noteCollectionKey === this.#selectedNoteCollectionKey;
      btn.dataset.selected = isSelected ? "true" : "false";
    });
  }

  #scrollToSelected() {
    const selectedButton = this.#noteCollectionsDiv.querySelector(
      '.note-collection-option[data-selected="true"]'
    ) as HTMLButtonElement | null;
    selectedButton?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  /**
   * Updates the text content of the main note selector button to reflect
   * the `primaryName` of the currently selected note collection, or a default text.
   * @private
   */
  #updateMainButton() {
    if (
      this.#selectedNoteCollectionKey !== null &&
      this.#selectedNoteCollection !== null
    ) {
      // State when a note is selected
      this.#mainButtonTextSpan.textContent =
        this.#selectedNoteCollection.primaryName;
      this.#mainButtonTextSpan.style.display = "initial";
      this.#mainButtonSlot.style.display = "none";
      this.#mainButton.ariaLabel = `${
        this.#selectedNoteCollection.primaryName
      } selected`;
    } else {
      // Default state when no note is selected
      this.#mainButtonTextSpan.style.display = "none";
      this.#mainButtonSlot.style.display = "initial";
      this.#mainButton.ariaLabel = "Select Note Collection";
    }
  }

  /**
   * Synchronizes the `selected-note-collection-key` attribute on the host element
   * with the component's internal state.
   * - syncSelectedNoteCollectionKeyAttribute sets the attribute,
   * - which calls attributeChangedCallback
   * - which dispatches an event
   * - if it is different to current value
   * @private
   */
  #syncSelectedNoteCollectionKeyAttribute() {
    if (this.#selectedNoteCollectionKey !== null) {
      this.setAttribute(
        "selected-note-collection-key",
        this.#selectedNoteCollectionKey
      );
    } else {
      this.removeAttribute("selected-note-collection-key");
    }
  }

  /**
   * Dispatches a custom event named 'note-collection-selected' when a note collection is chosen.
   * The event bubbles and composes, carrying the key and the full data object of the selected note collection.
   * @private
   * @fires NoteSequenceSelectedEvent
   */
  #dispatchNoteCollectionSelectedEvent() {
    this.dispatchEvent(
      new CustomEvent<NoteCollectionSelectedEventDetail>(
        "note-collection-selected",
        {
          detail: {
            noteCollectionKey: this.#selectedNoteCollectionKey,
            noteCollection: this.#selectedNoteCollection,
          },
          bubbles: true,
          composed: true, // Allows the event to cross the Shadow DOM boundary
        }
      )
    );
  }

  /**
   * Selects a random note collection from all available and updates
   * the component's state and display.
   * This method programmatically sets the `selectedNoteCollectionKey` property.
   * Ensures the newly selected note is different from the current one.
   * @public
   */
  setRandomNoteCollection() {
    const noteCollectionKeys = Object.keys(
      noteCollections
    ) as NoteCollectionKey[];

    let randomNoteCollectionKey: NoteCollectionKey;

    // Keep selecting at random until it's different from the current one.
    do {
      const randomIndex = Math.floor(Math.random() * noteCollectionKeys.length);
      randomNoteCollectionKey = noteCollectionKeys[randomIndex];
    } while (randomNoteCollectionKey === this.selectedNoteCollectionKey);

    this.selectedNoteCollectionKey = randomNoteCollectionKey;
  }

  /**
   * Gets the unique key of the currently selected note collection.
   * Setting this property updates the component's selection and dispatches a `note-collection-selected` event.
   *
   * @attr {NoteCollectionKey | null} selected-note-collection-key - Reflects the selected note collection key.
   * @returns {NoteCollectionKey | null} The note collection key (e.g., "ionian") or `null` if no collection is selected.
   */
  get selectedNoteCollectionKey(): NoteCollectionKey | null {
    return this.#selectedNoteCollectionKey;
  }

  /**
   * Sets the currently selected note collection by its unique key.
   * This will update the component's display and internal state. If a valid key
   * is provided, the corresponding `NoteCollection` object will be looked up
   * and stored internally. Setting to `null` clears the selection.
   * @param {NoteCollectionKey | null} newNoteCollectionKey - The unique key of the note collection to select.
   */
  set selectedNoteCollectionKey(
    newNoteCollectionKey: NoteCollectionKey | null
  ) {
    // Look up the full note collection object based on the key,
    // set values to null if key is null or invalid
    if (
      newNoteCollectionKey !== null &&
      noteCollections[newNoteCollectionKey] !== undefined
    ) {
      this.#selectedNoteCollectionKey = newNoteCollectionKey;
      this.#selectedNoteCollection = noteCollections[newNoteCollectionKey];
      this.#handleSelectionChange(
        newNoteCollectionKey,
        noteCollections[newNoteCollectionKey]
      );
    } else {
      this.#selectedNoteCollectionKey = null;
      this.#selectedNoteCollection = null;
      this.#handleSelectionChange(null, null);
    }

    this.#updateMainButton();
    this.#syncSelectedNoteCollectionKeyAttribute();
  }

  /**
   * Gets the full data object for the currently selected note collection.
   * This property is read-only and is derived from the `selectedNoteCollectionKey`.
   *
   * @returns {NoteCollection | null} The full note collection object or `null` if no collection is selected.
   * @readonly
   */
  get selectedNoteCollection(): NoteCollection | null {
    return this.#selectedNoteCollection;
  }
}

/**
 * Defines the custom element 'note-collection-selector' in the browser's CustomElementRegistry.
 * This makes the element available for use in HTML documents.
 */
customElements.define("note-collection-selector", NoteCollectionSelector);
