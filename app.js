const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const authForm = document.getElementById("authForm");
const nameField = document.getElementById("nameField");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const submitButton = document.getElementById("submitButton");
const passwordHint = document.getElementById("passwordHint");
const message = document.getElementById("message");
const switchCopy = document.getElementById("switchCopy");
const switchButton = document.getElementById("switchButton");
const authView = document.getElementById("authView");
const dashboard = document.getElementById("dashboard");
const dashboardMessage = document.getElementById("dashboardMessage");
let mode = "login";

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `message ${type === "success" ? "success" : ""}`;
}
function setMode(nextMode) {
  mode = nextMode;
  const registering = mode === "register";
  loginTab.classList.toggle("active", !registering);
  registerTab.classList.toggle("active", registering);
  nameField.hidden = !registering;
  nameInput.required = registering;
  formTitle.textContent = registering ? "Create your account" : "Welcome back";
  formSubtitle.textContent = registering ? "Fill in your details to get started." : "Enter your details to access your account.";
  submitButton.innerHTML = registering ? 'Create account <span>→</span>' : 'Sign in <span>→</span>';
  passwordHint.textContent = registering ? "8 characters minimum" : "Your account password";
  passwordInput.autocomplete = registering ? "new-password" : "current-password";
  switchCopy.firstChild.textContent = registering ? "Already have an account? " : "New here? ";
  switchButton.textContent = registering ? "Sign in" : "Create an account";
  showMessage("");
}
loginTab.addEventListener("click", () => setMode("login"));
registerTab.addEventListener("click", () => setMode("register"));
switchButton.addEventListener("click", () => setMode(mode === "login" ? "register" : "login"));

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "same-origin"
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}
function showDashboard(user) {
  authView.hidden = true;
  dashboard.hidden = false;
  document.getElementById("accountName").textContent = user.name;
  document.getElementById("accountEmail").textContent = user.email;
  document.getElementById("avatar").textContent = (user.name || "U").trim().charAt(0).toUpperCase();
  document.getElementById("welcomeTitle").textContent = `Welcome, ${user.name.split(" ")[0]}`;
}
function showAuth() {
  dashboard.hidden = true;
  authView.hidden = false;
  authForm.reset();
  setMode("login");
  document.getElementById("protectedContent").hidden = true;
}
authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("");
  submitButton.disabled = true;
  const payload = { email: emailInput.value.trim(), password: passwordInput.value };
  if (mode === "register") payload.name = nameInput.value.trim();
  try {
    const result = await api(`/api/auth/${mode === "register" ? "register" : "login"}`, {
      method: "POST", body: JSON.stringify(payload)
    });
    showMessage(result.message, "success");
    showDashboard(result.user);
  } catch (error) {
    showMessage(error.message);
  } finally {
    submitButton.disabled = false;
  }
});
document.getElementById("protectedButton").addEventListener("click", async () => {
  dashboardMessage.textContent = "";
  try {
    const result = await api("/api/protected");
    document.getElementById("protectedContent").hidden = false;
    document.getElementById("protectedMessage").textContent = result.message;
  } catch (error) {
    dashboardMessage.textContent = error.message;
  }
});
document.getElementById("logoutButton").addEventListener("click", async () => {
  try {
    const result = await api("/api/auth/logout", { method: "POST", body: "{}" });
    showAuth();
    showMessage(result.message, "success");
  } catch (error) {
    dashboardMessage.textContent = error.message;
  }
});
(async function checkExistingSession() {
  try {
    const result = await api("/api/auth/me");
    if (result.authenticated) showDashboard(result.user);
  } catch (_) {
    // The sign-in form remains visible if the session check fails.
  }
})();
