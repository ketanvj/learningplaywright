import { Header } from '../components/Header.js';
import { Sidebar } from '../components/Sidebar.js';

export class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // -----------------------------------------------------------------------
    // COMPOSED COMPONENTS
    // -----------------------------------------------------------------------
    // The Header and Sidebar appear on multiple pages (Dashboard, Appointments,
    // Health Records, etc.). By extracting them into separate component objects,
    // we avoid duplicating their locators and methods in every page object.
    // -----------------------------------------------------------------------

    /** @readonly */ this.header = new Header(page);
    /** @readonly */ this.sidebar = new Sidebar(page);

    // -----------------------------------------------------------------------
    // PAGE-SPECIFIC LOCATORS
    // -----------------------------------------------------------------------
    // These elements only exist on the Dashboard page.
    // -----------------------------------------------------------------------

    /** @readonly */ this.welcomeHeading = page.getByTestId('dashboard-welcome');
    /** @readonly */ this.dateDisplay = page.getByTestId('dashboard-date');
    /** @readonly */ this.healthScore = page.getByTestId('dashboard-health-score');
    /** @readonly */ this.notificationCount = page.getByTestId('dashboard-notification-count');
    /** @readonly */ this.appointmentsList = page.getByTestId('dashboard-appointments-list');
    /** @readonly */ this.appointmentItems = page.getByTestId('dashboard-appointment-item');
    /** @readonly */ this.logActivityButton = page.getByTestId('dashboard-log-activity-btn');
    /** @readonly */ this.viewRecordsButton = page.getByTestId('dashboard-view-records-btn');
  }

  // =========================================================================
  // NAVIGATION
  // =========================================================================

  async goto() {
    await this.page.goto('/dashboard');
  }

  // =========================================================================
  // DATA RETRIEVAL METHODS
  // =========================================================================
  //
  // These methods RETURN data so tests can assert on it.
  //
  // GOOD:  const text = await dashboardPage.getWelcomeText();
  //        expect(text).toContain('John');
  //
  // BAD:   await dashboardPage.assertWelcomeTextContains('John');
  //        ❌ Don't put assertions inside page objects!
  //
  // WHY? Because the page object shouldn't decide what's "correct."
  // Different tests might assert different things about the same data.
  // =========================================================================

  /**
   * Get the welcome heading text (e.g., "Good morning, John!")
   * @returns {Promise<string>}
   */
  async getWelcomeText() {
    return await this.welcomeHeading.textContent();
  }

  /**
   * Get the health score value as a number.
   * The UI displays it as "78/100" — we extract just the number.
   * @returns {Promise<string>}
   */
  async getHealthScore() {
    return await this.healthScore.textContent();
  }

  /**
   * Get the count of upcoming appointment items shown on the dashboard.
   * @returns {Promise<number>}
   */
  async getAppointmentCount() {
    return await this.appointmentItems.count();
  }

  // =========================================================================
  // ACTION METHODS
  // =========================================================================

  /**
   * Click the "New Appointment" quick action button.
   * This navigates to the appointments page.
   */
  async clickNewAppointment() {
    await this.logActivityButton.click();
  }

  /**
   * Click the "View Records" quick action button.
   */
  async clickViewRecords() {
    await this.viewRecordsButton.click();
  }

  /**
   * Navigate to appointments via the sidebar.
   *
   * This is a convenience method that delegates to the Sidebar component.
   * It demonstrates how page objects can provide shortcut methods that
   * use composed components internally.
   */
  async navigateToAppointments() {
    await this.sidebar.navigateTo('appointments');
  }
}
