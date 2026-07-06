import { Header } from "../components/Header.js";
import { Sidebar } from "../components/Sidebar.js";

export class AppointmentsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Composed components (shared across pages)
    /** @readonly */ this.header = new Header(page);
    /** @readonly */ this.sidebar = new Sidebar(page);

    // -----------------------------------------------------------------------
    // TABLE LOCATORS — the main appointments list
    // -----------------------------------------------------------------------

    /** @readonly */ this.table = page.getByTestId("appointments-table");
    /** @readonly */ this.searchInput = page.getByTestId("appointments-search");
    /** @readonly */ this.statusFilter = page.getByTestId(
      "appointments-status-filter",
    );
    /** @readonly */ this.typeFilter = page.getByTestId(
      "appointments-type-filter",
    );
    /** @readonly */ this.sortSelect = page.getByTestId("appointments-sort");
    /** @readonly */ this.newAppointmentButton = page.getByTestId(
      "appointments-new-btn",
    );
    /** @readonly */ this.pagination = page.getByTestId(
      "appointments-pagination",
    );
    /** @readonly */ this.emptyState = page.getByTestId("appointments-empty");

    // -----------------------------------------------------------------------
    // FORM LOCATORS — the create/edit appointment modal
    // -----------------------------------------------------------------------
    // These locators target elements inside the modal form.
    // They become visible only when the modal is open.
    // -----------------------------------------------------------------------

    /** @readonly */ this.form = page.getByTestId("appointment-form");
    /** @readonly */ this.titleInput = page.getByTestId(
      "appointment-title-input",
    );
    /** @readonly */ this.typeSelect = page.getByTestId(
      "appointment-type-select",
    );
    /** @readonly */ this.dateInput = page.getByTestId(
      "appointment-date-input",
    );
    /** @readonly */ this.timeInput = page.getByTestId(
      "appointment-time-input",
    );
    /** @readonly */ this.durationSelect = page.getByTestId(
      "appointment-duration-select",
    );
    /** @readonly */ this.providerInput = page.getByTestId(
      "appointment-provider-input",
    );
    /** @readonly */ this.locationInput = page.getByTestId(
      "appointment-location-input",
    );
    /** @readonly */ this.descriptionInput = page.getByTestId(
      "appointment-description-input",
    );
    /** @readonly */ this.notesInput = page.getByTestId(
      "appointment-notes-input",
    );
    /** @readonly */ this.saveButton = page.getByTestId("appointment-save-btn");
    /** @readonly */ this.cancelButton = page.getByTestId(
      "appointment-cancel-btn",
    );

    // Modal container
    /** @readonly */ this.modal = page.getByTestId("modal-container");
  }

  // =========================================================================
  // NAVIGATION
  // =========================================================================

  async goto() {
    await this.page.goto("/appointments");
  }

  // =========================================================================
  // TABLE INTERACTIONS
  // =========================================================================

  /**
   * Search for appointments by typing into the search box.
   * @param {string} query - Search text
   */
  async searchAppointments(query) {
    await this.searchInput.fill(query);
  }

  /**
   * Filter appointments by status using the status dropdown.
   * @param {string} status - e.g., 'scheduled', 'completed', 'cancelled', or '' for all
   */
  async filterByStatus(status) {
    await this.statusFilter.selectOption(status);
  }

  /**
   * Filter appointments by type.
   * @param {string} type - e.g., 'general', 'physical', 'mental_health', 'followup'
   */
  async filterByType(type) {
    await this.typeFilter.selectOption(type);
  }

  /**
   * Get the number of appointment rows currently visible in the table.
   *
   * NOTE: We use a CSS selector scoped to the table to count rows.
   * This is fine inside a page object — the locator strategy is encapsulated.
   *
   * @returns {Promise<number>}
   */
  async getRowCount() {
    // Each appointment row has a test ID like "appointments-row-123"
    const rows = this.page.locator('[data-testid^="appointments-row-"]');
    return await rows.count();
  }

  /**
   * Get a specific appointment row by its ID.
   * @param {string} id - Appointment ID
   */
  getRow(id) {
    return this.page.getByTestId(`appointments-row-${id}`);
  }

  // =========================================================================
  // CRUD OPERATIONS
  // =========================================================================

  /**
   * Create a new appointment by filling out the modal form.
   *
   * @param {Object} data - Appointment data
   * @param {string} data.title - Appointment title (required)
   * @param {string} [data.type] - Appointment type (general, physical, etc.)
   * @param {string} data.date - Date in YYYY-MM-DD format (required)
   * @param {string} data.time - Time in HH:MM format (required)
   * @param {string} [data.duration] - Duration (15, 30, 45, 60, 90)
   * @param {string} [data.provider] - Provider name
   * @param {string} [data.location] - Location
   * @param {string} [data.description] - Description text
   *
   * DESIGN NOTE: We accept a data object instead of individual parameters.
   * This is cleaner when there are many fields, and callers only need to
   * specify the fields they care about.
   */
  async createAppointment(data) {
    // Open the form modal
    await this.newAppointmentButton.click();
    await this.modal.waitFor({ state: "visible" });

    // Fill required fields
    await this.titleInput.fill(data.title);
    await this.dateInput.fill(data.date);
    await this.timeInput.fill(data.time);

    // Fill optional fields only if provided
    if (data.type) {
      await this.typeSelect.selectOption(data.type);
    }
    if (data.duration) {
      await this.durationSelect.selectOption(data.duration);
    }
    if (data.provider) {
      await this.providerInput.fill(data.provider);
    }
    if (data.location) {
      await this.locationInput.fill(data.location);
    }
    if (data.description) {
      await this.descriptionInput.fill(data.description);
    }

    // Submit the form and wait for the API response.
    // We start listening for the response BEFORE clicking,
    // so we don't miss a fast response.
    const responsePromise = this.page.waitForResponse(
      (resp) =>
        resp.url().includes("/api") &&
        resp.url().includes("/appointments") &&
        resp.request().method() === "POST",
    );
    await this.saveButton.click();
    await responsePromise;

    // Wait for the modal to close (synchronization)
    await this.modal.waitFor({ state: "hidden" });
  }

  /**
   * Delete an appointment by clicking its delete button.
   * @param {string} id - Appointment ID
   */
  async deleteAppointment(id) {
    const deleteButton = this.page.getByTestId(`appointments-delete-${id}`);
    await deleteButton.click();

    // Handle the confirmation dialog if one appears
    // The app may use a browser confirm() or a custom modal
    this.page.once("dialog", (dialog) => dialog.accept());
  }

  /**
   * Click the edit button for a specific appointment.
   * @param {string} id - Appointment ID
   */
  async editAppointment(id) {
    const editButton = this.page.getByTestId(`appointments-edit-${id}`);
    await editButton.click();
    await this.modal.waitFor({ state: "visible" });
  }
}
