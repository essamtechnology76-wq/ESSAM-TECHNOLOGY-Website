const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyDze_dmUsaZc9uGW0nAgOAEELf6zlYm8vnm8jlAUR9HVPUvTWVLIk70Objyu2-YogX/exec";

const yearElement = document.getElementById("year");
if (yearElement) yearElement.textContent = new Date().getFullYear();

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
if (referralFromUrl && referralField) {
  referralField.value = referralFromUrl.trim().slice(0, 80);
}

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

function prepareBackendData(formType, formData) {
  const common = {
    fullName: "Full Name",
    email: "Email",
    whatsapp: "WhatsApp Number",
    website: "website"
  };

  const fieldMaps = {
    order: {
      ...common,
      businessName: "Business / Brand Name",
      service: "Selected Service",
      description: "Project Description",
      budget: "Budget",
      deadline: "Deadline",
      referralCode: "Referral Code"
    },
    partner: {
      ...common,
      location: "Location",
      skills: "Skills",
      experience: "Experience",
      introduction: "Introduction",
      portfolioLink: "CV or Portfolio Link"
    },
    marketer: {
      ...common,
      location: "Location",
      platforms: "Social Platforms",
      platformLinks: "Profile Links",
      followers: "Follower Count",
      contentCategory: "Content Category"
    },
    contact: {
      ...common,
      message: "Message"
    }
  };

  const map = fieldMaps[formType];
  if (!map) throw new Error("This form type is not supported.");

  const converted = {};
  Object.keys(map).forEach(function (htmlName) {
    const sheetName = map[htmlName];
    if (formData[htmlName] !== undefined) {
      converted[sheetName] = formData[htmlName];
    }
  });

  // The marketer form collects profile links and usernames in one field.
  if (formType === "marketer" && formData.platformLinks) {
    converted["Social Usernames"] = formData.platformLinks;
  }

  return converted;
}

/*
 * Submit through a hidden HTML form + iframe. This lets the Apps Script
 * HTML response post the real JSON result back to this page with postMessage.
 * Unlike fetch(..., {mode:"no-cors"}), the page can distinguish success/failure.
 */
function submitToAppsScript(payload) {
  return new Promise(function (resolve, reject) {
    const token = (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : String(Date.now()) + "-" + Math.random().toString(16).slice(2);

    const iframe = document.createElement("iframe");
    iframe.name = "essam-submit-" + token;
    iframe.title = "Submission response";
    iframe.style.display = "none";

    const form = document.createElement("form");
    form.method = "POST";
    form.action = SCRIPT_URL;
    form.target = iframe.name;
    form.acceptCharset = "UTF-8";
    form.style.display = "none";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "payload";
    input.value = JSON.stringify({ ...payload, responseToken: token });
    form.appendChild(input);

    let finished = false;
    const timeout = window.setTimeout(function () {
      finish(new Error("The server did not respond in time. Please try again."));
    }, 30000);

    function finish(error, result) {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      form.remove();
      iframe.remove();
      if (error) reject(error);
      else resolve(result);
    }

    function onMessage(event) {
      if (event.source !== iframe.contentWindow) return;
      if (!event.origin || !(event.origin.endsWith(".googleusercontent.com") || event.origin === "https://script.google.com")) return;
      const result = event.data;
      if (!result || result.source !== "essam-technology" || result.token !== token) return;
      if (result.success) finish(null, result);
      else finish(new Error(result.message || "Your submission could not be saved."));
    }

    window.addEventListener("message", onMessage);
    document.body.appendChild(iframe);
    document.body.appendChild(form);

    try {
      form.submit();
    } catch (error) {
      finish(error);
    }
  });
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
    const formData = cleanFormData(form);

    if (formData.website) return;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    const messages = {
      order: "Your project enquiry has been saved successfully. ESSAM TECHNOLOGY will review it and contact you.",
      partner: "Your partner application has been saved successfully. We will contact you after reviewing it.",
      marketer: "Your marketer registration has been saved successfully. Commission applies only to verified referrals after customer payment and service delivery.",
      contact: "Your message has been saved successfully. Thank you for contacting ESSAM TECHNOLOGY."
    };

    try {
      const data = prepareBackendData(formType, formData);
      const result = await submitToAppsScript({ formType: formType, data: data });

      feedback(
        form,
        (messages[formType] || "Your submission was saved successfully.") +
          (result.emailNotificationSent ? " An email notification was also sent." : " Your submission was saved, but the email notification could not be sent."),
        "success"
      );

      form.reset();

      if (referralFromUrl && formType === "order" && referralField) {
        referralField.value = referralFromUrl.trim().slice(0, 80);
      }
    } catch (error) {
      console.error("ESSAM TECHNOLOGY form submission error:", error);
      feedback(
        form,
        error.message || "We could not confirm your submission. Please try again or contact us on WhatsApp at +234 902 660 1873.",
        "error"
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
    }
  });
});
