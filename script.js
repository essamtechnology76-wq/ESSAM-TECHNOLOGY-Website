const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyDze_dmUsaZc9uGW0nAgOAEELf6zlYm8vnm8jlAUR9HVPUvTWVLIk70Objyu2-YogX/exec";

document.getElementById("year").textContent = new Date().getFullYear();

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", function () {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll("[data-service]").forEach(function (link) {
  link.addEventListener("click", function () {
    const serviceSelect = document.querySelector('#orderForm select[name="service"]');
    if (serviceSelect) {
      const requested = link.getAttribute("data-service");
      const option = Array.from(serviceSelect.options).find(function (item) {
        return item.text.trim() === requested;
      });
      if (option) serviceSelect.value = option.value;
    }
  });
});

document.querySelectorAll(".open-form").forEach(function (button) {
  button.addEventListener("click", function () {
    const targetId = button.getAttribute("data-target");
    const target = document.getElementById(targetId);
    if (!target) return;
    document.querySelectorAll(".inline-form-wrap").forEach(function (panel) {
      if (panel !== target.closest(".inline-form-wrap")) panel.classList.remove("open");
    });
    const wrapper = target.closest(".inline-form-wrap");
    if (wrapper) {
      wrapper.classList.add("open");
      wrapper.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

document.querySelectorAll(".close-form").forEach(function (button) {
  button.addEventListener("click", function () {
    const wrapper = button.closest(".inline-form-wrap");
    if (wrapper) wrapper.classList.remove("open");
  });
});

const referralFromUrl = new URLSearchParams(window.location.search).get("ref");
const referralField = document.querySelector('#orderForm [name="referralCode"]');
if (referralFromUrl && referralField) referralField.value = referralFromUrl.trim().slice(0, 80);

function feedback(form, message, type) {
  const box = form.querySelector(".form-feedback");
  if (!box) return;
  box.textContent = message;
  box.className = "form-feedback show " + type;
}

function cleanFormData(form) {
  const data = {};
  new FormData(form).forEach(function (value, key) {
    if (typeof value === "string") data[key] = value.trim();
  });
  return data;
}

document.querySelectorAll("form[data-form]").forEach(function (form) {
  const honeypot = document.createElement("input");
  honeypot.type = "text";
  honeypot.name = "website";
  honeypot.tabIndex = -1;
  honeypot.autocomplete = "off";
  honeypot.setAttribute("aria-hidden", "true");
  honeypot.style.position = "absolute";
  honeypot.style.left = "-10000px";
  honeypot.style.width = "1px";
  honeypot.style.height = "1px";
  form.appendChild(honeypot);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const originalLabel = submitButton ? submitButton.textContent : "";
    const formType = form.getAttribute("data-form");
    const data = cleanFormData(form);

    if (data.website) return;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    const messages = {
      order: "Thank you. Your project enquiry has been sent. ESSAM TECHNOLOGY will review the details and contact you. If your request is urgent, please follow up on WhatsApp.",
      partner: "Thank you for applying to become an ESSAM TECHNOLOGY partner. Your application has been submitted for review. We will contact you using the details you provided.",
      marketer: "Thank you for registering your interest as a marketer. Your details have been submitted for review. Commission applies only to verified referrals after the customer has paid and the agreed service has been delivered."
    };

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ formType: formType, data: data })
      });

      feedback(form, messages[formType] || "Your submission has been sent. We will contact you soon.", "success");
      form.reset();
      if (referralFromUrl && formType === "order" && referralField) referralField.value = referralFromUrl.trim().slice(0, 80);
    } catch (error) {
      feedback(form, "We could not send your submission. Please check your internet connection and try again, or contact us on WhatsApp at +234 902 660 1873.", "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
    }
  });
});