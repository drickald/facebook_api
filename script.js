import { FB_APP_ID } from "./config.js";

// ==========================================
// 1. INITIALIZE FACEBOOK SDK
// ==========================================
window.fbAsyncInit = function () {
  FB.init({
    appId: FB_APP_ID,
    cookie: true,
    xfbml: false,
    version: "v18.0"
  });

  console.log("Facebook SDK is ready.");
};

// ==========================================
// 2. DOM ELEMENTS
// ==========================================
const titleText = document.getElementById("titleText");
const subtitleText = document.getElementById("subtitleText");
const loginBtn = document.getElementById("loginBtn");
const resultDiv = document.getElementById("result");
const errorDiv = document.getElementById("error");
const loadingText = document.getElementById("loading");
const themeToggle = document.getElementById("themeToggle");

// ==========================================
// 3. EVENT LISTENERS
// ==========================================
loginBtn.addEventListener("click", loginWithFacebook);

// ==========================================
// 4. CORE FUNCTIONS (OAuth 2.0 Flow)
// ==========================================
function loginWithFacebook() {
  clearUI();
  updateHeader("Facebook Login", "Sign in to view your Facebook profile");
  loginBtn.disabled = true;

  FB.login(
    (response) => {
      if (response.authResponse) {
        showLoading();
        // Ipinapasa ang OAuth 2.0 Access Token
        fetchUserProfile(response.authResponse.accessToken);
      } else {
        showError("Login cancelled by user.");
        loginBtn.disabled = false;
      }
    },
    { scope: "public_profile,email" }
  );
}

/**
 * Fetch Profile Daata
 */
async function fetchUserProfile(token) {
  try {
    const res = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.width(300).height(300)&access_token=${token}`
    );

    if (!res.ok) throw new Error("Failed to fetch profile data from Facebook.");

    const user = await res.json();
    showViewer(user);

  } catch (err) {
    showError(err.message);
    loginBtn.disabled = false;
  } finally {
    hideLoading();
  }
}

// ==========================================
// UI RENDERING
// ==========================================
function showViewer(user) {
  loginBtn.style.display = "none"; // Itago ang login button
  updateHeader("Profile Viewer", "Successfully retrieved your profile info");

  resultDiv.innerHTML = "";

  const card = document.createElement("div");
  card.className = "viewer-card";

  const img = document.createElement("img");
  img.className = "viewer-avatar";
  img.alt = "Profile Picture";
  img.src = user.picture.data.url; 

  const name = document.createElement("h2");
  name.className = "viewer-name";
  name.textContent = user.name;

  const email = document.createElement("p");
  email.className = "viewer-email";
  email.textContent = user.email || "No email available";

  card.append(img, name, email);
  resultDiv.appendChild(card);
}

// ==========================================
// UI HELPERS
// ==========================================

function updateHeader(title, subtitle) {
  titleText.textContent = title;
  subtitleText.textContent = subtitle;
}

function showLoading() {
  loadingText.classList.remove("hidden");
}

function hideLoading() {
  loadingText.classList.add("hidden");
}

function showError(msg) {
  errorDiv.textContent = msg;
}

function clearUI() {
  errorDiv.textContent = "";
  resultDiv.innerHTML = "";
}

// ==========================================
// 6. THEME TOGGLER BUTTON
// ==========================================
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");

  themeToggle.textContent =
    document.body.classList.contains("light") ? "☀️" : "🌙";
});