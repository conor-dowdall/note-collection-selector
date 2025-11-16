import {
  groupedNoteCollections,
  type NoteCollection,
  type NoteCollectionGroupKey,
  noteCollectionGroupsMetadata,
  type NoteCollectionKey,
  noteCollections,
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

      > #selected-note-name-span {
        grid-area: 1 / 1;
      }

      > slot {
        height: var(--_main-icon-size);
      }

      ::slotted(svg),
      ::slotted(img),
      > slot > svg {
        grid-area: 1 / 1;
        width: var(--_main-icon-size);
        height: var(--_main-icon-size);
      }
    }

    [part="dialog"] {
      padding: var(--_default-spacing);

      > [part="close-dialog-button"] {
        display: grid;
        place-items: center;
        padding: var(--_default-spacing);
        border: none;
        margin-inline-start: auto;
        margin-block-end: var(--_default-spacing);

        /* Size icons, but let text content flow naturally */
        ::slotted(svg),
        ::slotted(img),
        > slot[name="close-dialog-icon"] > svg {
          width: var(--_close-dialog-icon-size);
          height: var(--_close-dialog-icon-size);
          /* Ensure icons are on the same grid cell if multiple are slotted */
          grid-area: 1 / 1;
        }
      }
    }

    [part="dialog"]::backdrop {
      background: var(--_dialog-backdrop-background);
    }

    #note-collections-div {
      display: flex;
      flex-direction: column;
      gap: 1em;
      margin-block-start: 2em;
    }

    #group-wrapper {
      > h3 {
        margin: 0em;
      }
    }

    #note-collection-group-div {
      margin-block: 0.5em;
      display: flex;
      flex-wrap: wrap;
      gap: 1em;
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

      > h4 {
        margin-block: 0.2em;
      }

      /* When the "more info" div is hidden, center the text */
      &:has(> .more-info-div.hidden) {
        text-align: center;
      }

      > .more-info-div {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
      }

      > .more-info-div.hidden {
        display: none;
      }
    }

    #toggle-more-info-label {
      padding: 0.5em;
      border: 0.1em solid currentColor;
      border-radius: 0.5em;
      cursor: pointer;
    }

    .hidden {
      display: none;
    }
  </style>

  <button part="main-button">
    <span id="selected-note-collection-span" style="display: none;"></span>
    <slot>
      <!-- Default icon when no note is selected. Can be overridden by the user. This
      SVG is part of the project and is licensed under CC0 1.0 Universal. -->
      <svg viewBox="0 -960 960 960">
        <path
          style="display:inline;stroke-width:0.520841"
          d="m 573.75,-880.70312 v 192.34374 51.64063 a 82.761503,123.486 59.29 0 0 -134.84375,5.70313 82.761503,123.486 59.29 0 0 -65.54687,134.14062 82.761503,123.486 59.29 0 0 147.65624,9.60938 82.761503,123.486 59.29 0 0 52.73438,-47.1875 v 90.07812 a 82.761503,123.486 59.29 0 0 -134.84375,5.78125 82.761503,123.486 59.29 0 0 -65.54687,134.0625 82.761503,123.486 59.29 0 0 147.65624,9.6875 82.761503,123.486 59.29 0 0 52.73438,-47.1875 v 89.29687 a 82.761503,123.486 59.29 0 0 -134.84375,5.78126 82.761503,123.486 59.29 0 0 -65.54687,134.14062 82.761503,123.486 59.29 0 0 147.65624,9.60938 82.761503,123.486 59.29 0 0 73.28126,-102.96876 82.761503,123.486 59.29 0 0 0,-2.26562 v -189.45312 a 82.761503,123.486 59.29 0 0 0,-2.26563 v -190.07813 a 82.761503,123.486 59.29 0 0 0,-2.26562 v -95.85938 -192.34374 z"
        />
      </svg>
    </slot>
  </button>

  <dialog part="dialog" aria-labelledby="dialog-heading">
    <button part="close-dialog-button">
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

export interface NoteSequenceSelectedEventDetail {
  noteCollectionKey: NoteCollectionKey;
  noteCollection: NoteCollection;
}

export class NoteCollectionSelector extends HTMLElement {
  #shadowRoot: ShadowRoot;

  #mainButton: HTMLButtonElement;
  #closeDialogButton: HTMLButtonElement;

  #noteCollectionSelectorButton: HTMLButtonElement | null = null;
  #noteCollectionSelectorDialog: HTMLDialogElement | null = null;
  #noteSequencesContainer: HTMLDivElement | null = null;
  #toggleMoreInfoCheckbox: HTMLInputElement | null = null;
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

    const mainButton = this.#shadowRoot.querySelector<HTMLButtonElement>(
      '[part="main-button"]'
    );

    const closeDialogButton = this.#shadowRoot.querySelector<HTMLButtonElement>(
      '[part="close-dialog-button"]'
    );

    if (!mainButton || !closeDialogButton) {
      throw new Error(
        "NoteCollectionSelector: Critical elements not found in shadow DOM."
      );
    }

    this.#mainButton = mainButton;
    this.#closeDialogButton = closeDialogButton;

    this.#noteCollectionSelectorButton =
      this.#shadowRoot.querySelector<HTMLButtonElement>(
        "#note-collection-selector-button"
      );

    this.#noteCollectionSelectorDialog =
      this.#shadowRoot.querySelector<HTMLDialogElement>(
        "#note-collection-selector-dialog"
      );
    this.#noteSequencesContainer =
      this.#shadowRoot.querySelector<HTMLDivElement>(
        "#note-collections-container"
      );
    this.#toggleMoreInfoCheckbox =
      this.#shadowRoot.querySelector<HTMLInputElement>(
        "#toggle-more-info-checkbox"
      );
  }

  connectedCallback() {
    this.#abortController = new AbortController();
    const { signal } = this.#abortController;

    if (
      this.#noteCollectionSelectorButton &&
      this.#noteCollectionSelectorDialog &&
      this.#noteSequencesContainer &&
      this.#toggleMoreInfoCheckbox
    ) {
      this.#noteCollectionSelectorButton.addEventListener(
        "click",
        () => {
          this.#noteCollectionSelectorDialog!.showModal();
        },
        { signal }
      );

      const closeDialogButton = this.#shadowRoot.getElementById(
        "close-dialog-button"
      ) as HTMLButtonElement;
      closeDialogButton.addEventListener(
        "click",
        () => {
          this.#noteCollectionSelectorDialog!.close();
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

      this.#populateNoteSequences();
      this.#updateNoteCollectionSelectorButtonText();
      this.#updateSelectedNoteSequenceAttribute();
    } else {
      console.error("Failed to find necessary elements in the shadow DOM");
    }
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
      this.#dispatchNoteSequenceSelectedEvent();
    }
  }

  #populateNoteSequences() {
    if (!this.#noteSequencesContainer) return;

    this.#noteSequencesContainer.replaceChildren();

    Object.entries(noteCollectionGroupsMetadata).forEach(
      ([groupKey, groupMetadata]) => {
        const groupDiv = document.createElement("div");
        groupDiv.id = "group-wrapper";
        groupDiv.innerHTML = /* HTML */ `<h3>${groupMetadata.displayName}</h3>`;

        const groupMoreInfoDiv = document.createElement("div");
        groupMoreInfoDiv.classList.add("more-info-div", "hidden");
        groupMoreInfoDiv.textContent = `${groupMetadata.description}`;
        groupDiv.appendChild(groupMoreInfoDiv);

        const groupNoteSequencesWrapper = document.createElement("div");
        groupNoteSequencesWrapper.id = "note-collection-group-div";
        groupDiv.appendChild(groupNoteSequencesWrapper);

        const currentGroup =
          groupedNoteCollections[groupKey as NoteCollectionGroupKey];

        Object.entries(currentGroup).forEach(([key, collection]) => {
          const noteSequenceDiv = document.createElement("div");
          noteSequenceDiv.classList.add("note-collection-option");
          noteSequenceDiv.innerHTML = /* HTML */ `<h4>
            ${collection.primaryName}
          </h4>`;

          const collectionMoreInfoDiv = document.createElement("div");
          collectionMoreInfoDiv.classList.add("more-info-div", "hidden");
          collectionMoreInfoDiv.innerHTML = this.#renderMoreInfo(collection);
          noteSequenceDiv.appendChild(collectionMoreInfoDiv);

          noteSequenceDiv.addEventListener("click", () => {
            this.#selectedNoteCollectionKey = key as NoteCollectionKey;
            this.#selectedNoteCollection = collection;
            this.#updateNoteCollectionSelectorButtonText();
            this.#updateSelectedNoteSequenceAttribute();
            this.#noteCollectionSelectorDialog!.close();
          });

          groupNoteSequencesWrapper.appendChild(noteSequenceDiv);
        });

        this.#noteSequencesContainer!.appendChild(groupDiv);
      }
    );
  }

  /**
   * Renders the detailed "more info" content for a given note collection.
   * @private
   * @param {NoteCollection} noteCollection - The note collection data object.
   * @returns {string} An HTML string containing the detailed information.
   */
  #renderMoreInfo(noteCollection: NoteCollection): string {
    // TODO: replace this with updated code
    // <div>${noteCollection.exampleNotes.join(", ")}</div>
    return /* HTML */ `
      <div>${noteCollection.names.join(", ")}</div>
      <div>${noteCollection.intervals.join(", ")}</div>
      <div>${noteCollection.type.join(", ")}</div>
      <div>${noteCollection.characteristics.join(", ")}</div>
      <div>${noteCollection.patternShort.join("-")}</div>
      <div>${noteCollection.pattern.join("-")}</div>
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
   * Updates the text content of the main note selector button to reflect
   * the `primaryName` of the currently selected note collection, or a default text.
   * @private
   */
  #updateNoteCollectionSelectorButtonText() {
    this.#noteCollectionSelectorButton!.textContent = this
      .#selectedNoteCollection
      ? this.#selectedNoteCollection.primaryName
      : "Select Sequence";
  }

  /**
   * Synchronizes the `selected-note-collection-key` attribute on the host element
   * with the component's internal state.
   * @private
   */
  #updateSelectedNoteSequenceAttribute() {
    if (this.#selectedNoteCollectionKey) {
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
  #dispatchNoteSequenceSelectedEvent() {
    if (
      this.#selectedNoteCollectionKey !== null &&
      this.#selectedNoteCollection !== null
    ) {
      this.dispatchEvent(
        new CustomEvent<NoteSequenceSelectedEventDetail>(
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
    } else {
      console.warn(
        "attempted to dispatch note-collection-selected event with null data"
      );
    }
  }

  /**
   * Selects a random note collection from all available and updates
   * the component's state and display.
   * This method programmatically sets the `selectedNoteCollectionKey` property.
   * @public
   */
  setRandomNoteSequence() {
    const noteCollectionsKeys = Object.keys(noteCollections);
    const randomIndex = Math.floor(Math.random() * noteCollectionsKeys.length);
    this.selectedNoteCollectionKey = noteCollectionsKeys[
      randomIndex
    ] as NoteCollectionKey;
  }

  /**
   * Gets the unique key of the currently selected note collection.
   * @prop {NoteCollectionKey | null} selectedNoteCollectionKey
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
   * @prop {NoteCollectionKey | null} selectedNoteCollectionKey
   */
  set selectedNoteCollectionKey(
    newNoteCollectionKey: NoteCollectionKey | null
  ) {
    this.#selectedNoteCollectionKey = newNoteCollectionKey;
    // Look up the full note collection object based on the key, or set to null if key is null
    this.#selectedNoteCollection = newNoteCollectionKey
      ? noteCollections[newNoteCollectionKey]
      : null;
    this.#updateNoteCollectionSelectorButtonText();
    this.#updateSelectedNoteSequenceAttribute();
    // No need to dispatch event here, as attributeChangedCallback will do it
  }

  /**
   * Gets the full data object for the currently selected note collection.
   * This property is read-only and is derived from `selectedNoteCollectionKey`.
   * @prop {NoteCollection | null} selectedNoteCollection
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
