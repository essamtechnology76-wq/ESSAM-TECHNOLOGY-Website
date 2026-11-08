const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbznEFn-ZpugHNKvioh9u0AfVCJTqCsZoP7Bk59X9bc7V9hDGTSMfzzTR9ub6QOdKzuA/exec";

const form = document.getElementById("enquiryForm");
const submitBtn = document.getElementById("submitBtn");
const buttonLabel = submitBtn.querySelector(".button-label");
const messageBox = document.getElementById("formMessage");

document.getElementById("year").textContent = new Date().getFullYear();

function showMessage(message, type) {
  messageBox.textContent = message;
  messageBox.className = `form-message show ${type}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.reportValidity()) return;

  const formData = new FormData(form);
  const enquiry = {
    fullName: String(formData.get("fullName") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    businessName: String(formData.get("businessName") || "").trim(),
    service: String(formData.get("service") || "").trim(),
    budget: String(formData.get("budget") || "").trim(),
    description: String(formData.get("description") || "").trim()
  };

  submitBtn.disabled = true;
  buttonLabel.textContent = "Submitting...";
  messageBox.className = "form-message";

  try {
    // text/plain is used to avoid a browser CORS preflight.
    // Apps Script receives the raw JSON in e.postData.contents.
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(enquiry)
    });

    showMessage(
      "Thank you! Your enquiry has been sent. ESSAM TECHNOLOGY will contact you using the details you provided. If you need to follow up, please contact us directly on WhatsApp.",
      "success"
    );
    form.reset();
  } catch (error) {
    showMessage(
      "We couldn't send your enquiry. Please check your internet connection and try again, or contact ESSAM TECHNOLOGY directly on WhatsApp.",
      "error"
    );
  } finally {
    submitBtn.disabled = false;
    buttonLabel.textContent = "Submit enquiry";
  }
});
