/*
Tags
Metadata
*/

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3001/api/v1";

async function getAuthToken(request) {
  const response = await request.post(`${BASE_URL}/auth/login`, {
    data: {
      email: "patient@healthhub.test",
      password: "Test123!",
    },
  });
  console.log(response);
  const body = await response.json();
  return body.data.token;
}

test.describe("Authentication", () => {
  test("should login with valid credentials", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/auth/login`, {
      data: {
        email: "patient@healthhub.test",
        password: "Test123!",
      },
    });
    expect(response.status()).toBe(200);
    console.log("Response Object is below ****************");
    console.log(response);
    console.log("Response Object is above ****************");

    console.log("Response Body is below ****************");
    const body = await response.json();
    console.log(body);
    console.log("Response Body is above ****************");

    expect(body.success).toBe(true);
    expect(body.data.token).toBeTruthy();
    expect(body.data.user.email).toBe("patient@healthhub.test");
  });

  test("should fail login with invalid credentials", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/auth/login`, {
      data: {
        email: "wrong@email.com",
        password: "WrongPassword",
      },
    });

    expect(response.status()).toBe(401); //unauthorized request
    console.log("Reponse Bode is below ****************");
    const body = await response.json();
    console.log(body);
    console.log("Reponse Bode is above ****************");
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INVALID_CREDENTIALS");
    expect(body.data?.token).not.toBeTruthy();
  });

  test("should register a new user", async ({ request }) => {
    const uniqueEmail = `test-${Date.now()}@healthhub.test`;
    const response = await request.post(`${BASE_URL}/auth/register`, {
      data: {
        email: uniqueEmail,
        password: "NewUser123!",
        first_name: "Test",
        last_name: "User",
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe(uniqueEmail);
    expect(body.data.token).toBeTruthy();
  });

  test("should get current user with valid token", async ({ request }) => {
    const token = await getAuthToken(request);

    const response = await request.get(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.email).toBe("patient@healthhub.test");
  });

  test("should reject request with invalid token", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/appointments`, {
      headers: {
        Authorization: "Bearer invalid-token-here",
      },
    });

    expect(response.status()).toBe(401);
  });
});

test.describe.only("Appointments CRUD", () => {
  let token;

  test.beforeEach(async ({ request }) => {
    token = await getAuthToken(request);
  });

  test("GET - should list all appointments", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    console.log("Reponse Bode is below ****************");
    const body = await response.json();
    console.log(body);
    console.log("Reponse Bode is above ****************");

    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });
  test("GET - should get a single appointment", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/appointments/1`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(1);
    expect(body.data.title).toBeTruthy();
  });
});
