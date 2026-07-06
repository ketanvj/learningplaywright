export class LoginPage {
  constructor(page) {
    this.page = page; //page is local variable coming from outside, the caller basically is passing it.
    //this.page is instance variable for the LoginPage object.
    this.emailInput = page.getByRole("textbox", { name: "Email address" });
    this.passwordInput = page.getByTestId("auth-password-input");
    this.submitButton = page.getByTestId("auth-submit-button");
    this.rememberMeCheckbox = page.getByTestId("auth-remember-checkbox");
    this.forgotPasswordLink = page.getByTestId("auth-forgot-link");
    this.errorMessage = page.getByTestId("auth-error-message");
  }
  async goto() {
    await this.page.goto("http://localhost:5173/login");
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginExpectingError({ email, password }) {}

  async setRememberMe(enabled = true) {
    if (enabled) {
      await this.rememberMeCheckbox.check();
    } else {
      await this.rememberMeCheckbox.uncheck();
    }
  }
  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }
}
