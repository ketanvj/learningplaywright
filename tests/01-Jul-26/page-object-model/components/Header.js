export class Header {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // -----------------------------------------------------------------------
    // LOCATORS
    // -----------------------------------------------------------------------

    /** The hamburger menu button (visible on mobile) */
    /** @readonly */ this.menuToggle = page.getByTestId('header-menu-toggle');

    /** The bell icon that opens the notifications dropdown */
    /** @readonly */ this.notificationsTrigger = page.getByTestId('notifications-trigger');

    /** The red badge showing unread notification count */
    /** @readonly */ this.notificationBadge = page.getByTestId('notification-badge');

    /** The avatar/name button that opens the user dropdown */
    /** @readonly */ this.userMenuTrigger = page.getByTestId('user-menu-trigger');

    /** The dropdown container (visible only when menu is open) */
    /** @readonly */ this.userMenuDropdown = page.getByTestId('user-menu-dropdown');

    /** Individual menu items inside the user dropdown */
    /** @readonly */ this.profileLink = page.getByTestId('user-menu-profile');
    /** @readonly */ this.settingsLink = page.getByTestId('user-menu-settings');
    /** @readonly */ this.logoutButton = page.getByTestId('user-menu-logout');
  }

  // =========================================================================
  // METHODS
  // =========================================================================

  /**
   * Open the user menu dropdown by clicking the avatar/trigger.
   * Waits for the dropdown to become visible before returning.
   */
  async openUserMenu() {
    await this.userMenuTrigger.click();
    await this.userMenuDropdown.waitFor({ state: 'visible' });
  }

  /**
   * Log out by opening the user menu and clicking Logout.
   * Waits for redirect to /login after logout completes.
   */
  async logout() {
    await this.openUserMenu();
    await this.logoutButton.click();
    await this.page.waitForURL(/login/);
  }

  /**
   * Navigate to the profile page via the user menu.
   */
  async goToProfile() {
    await this.openUserMenu();
    await this.profileLink.click();
  }

  /**
   * Navigate to settings via the user menu.
   */
  async goToSettings() {
    await this.openUserMenu();
    await this.settingsLink.click();
  }

  /**
   * Get the notification count from the badge.
   * Returns 0 if the badge is not visible (no unread notifications).
   *
   * @returns {Promise<number>}
   */
  async getNotificationCount() {
    const isVisible = await this.notificationBadge.isVisible();
    if (!isVisible) return 0;
    // textContent() returns null when the element has no text node at all.
    // ?? '0'  — nullish coalescing: only kicks in for null/undefined, not for
    //           empty string ''. So '0' is the fallback, not a silent override.
    // WHY NOT rely on parseInt(null)?  parseInt(null, 10) returns NaN, and
    //   NaN || 0 returns 0 — so the current code "works" by accident. The ??
    //   makes the intent explicit and avoids the hidden NaN step.
    // NOTE: the isVisible() guard above means null is practically impossible
    //   here (a visible badge always has text), but ?? '0' is good practice.
    const text = (await this.notificationBadge.textContent()) ?? '0';
    return parseInt(text, 10) || 0;
  }
}
