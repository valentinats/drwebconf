const form = document.getElementById("registrationForm");
const submitBtn = document.getElementById("submitFormButton");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const emailWarning = document.getElementById("warningEmailText");
let emailWarningShown = false;

document
  .getElementById("agreementCheckbox")
  .addEventListener("change", function () {
    submitBtn.disabled = !this.checked;
  });

phoneInput.addEventListener("input", function () {
  const digits = this.value.replace(/\D/g, "").slice(0, 11);
  this.value = digits ? "+" + digits : "";
});

phoneInput.addEventListener("keydown", function (e) {
  if (e.key === "Backspace" && this.value === "+") {
    e.preventDefault();
    this.value = "";
  }
});

emailInput.addEventListener("input", function () {
  if (!emailWarningShown && this.value) {
    emailWarning.classList.add("form__email-warning--visible");
    emailWarningShown = true;
  }
});

function setError(id, hasError) {
  document.getElementById(id)?.classList.toggle("form__input--error", hasError);
  document
    .getElementById(id + "-error")
    ?.classList.toggle("form__error--visible", hasError);
}

function validateForm() {
  const checks = [
    ...["name", "company", "position"].map((id) => ({
      id,
      invalid: !document.getElementById(id).value.trim(),
    })),
    {
      id: "email",
      invalid: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim()),
    },
    {
      id: "phone",
      invalid: phoneInput.value.length < 12,
    },
  ];

  checks.forEach(({ id, invalid }) => setError(id, invalid));
  return checks.every(({ invalid }) => !invalid);
}

function closeModal(overlay) {
  overlay.classList.remove("modal__overlay--visible");
  document.body.classList.remove("is-modal-open");
  overlay.addEventListener("transitionend", () => overlay.remove(), {
    once: true,
  });
}

function createModal({ title, text, buttons }) {
  const overlay = document.createElement("div");
  overlay.className = "modal__overlay";
  overlay.addEventListener(
    "click",
    (e) => e.target === overlay && closeModal(overlay),
  );

  const box = document.createElement("div");
  box.className = "modal__box";

  const closeBtn = document.createElement("button");
  closeBtn.className = "modal__close";
  closeBtn.setAttribute("aria-label", "Закрыть");
  closeBtn.innerHTML = '<img src="./assets/close.svg" alt="close button"/>';
  closeBtn.addEventListener("click", () => closeModal(overlay));

  const h = document.createElement("h3");
  h.className = "modal__title";
  h.textContent = title;

  const p = document.createElement("p");
  p.className = "modal__text";
  p.textContent = text;

  const btnWrap = document.createElement("div");
  btnWrap.className = "modal__buttons";

  buttons.forEach(({ label, primary, onClick }) => {
    const btn = document.createElement("button");
    btn.className = `modal__btn ${primary ? "modal__btn--primary" : "modal__btn--secondary"}`;
    btn.textContent = label;
    btn.addEventListener("click", () => onClick(overlay));
    btnWrap.appendChild(btn);
  });

  box.append(closeBtn, h, p, btnWrap);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  document.body.classList.add("is-modal-open");

  requestAnimationFrame(() => overlay.classList.add("modal__overlay--visible"));
}

const MODALS = {
  taken: {
    title: "Ошибка!",
    text: "Похоже, такой e-mail уже зарегистрирован, введите новый или обратитесь в поддержку.",
    buttons: [
      {
        label: "Ввести новый e-mail",
        primary: true,
        onClick(overlay) {
          closeModal(overlay);
          emailInput.value = "";
          emailInput.focus();
        },
      },
      {
        label: "Обратиться в поддержку",
        primary: false,
        onClick() {},
      },
    ],
  },
  error: {
    title: "Что-то пошло не так",
    text: "Перезагрузите страницу или зайдите позже.",
    buttons: [{ label: "Хорошо", primary: true, onClick: closeModal }],
  },
  success: {
    title: "Регистрация прошла успешно!",
    text: "В течение 24 часов вы получите письмо с подтверждением регистрации.",
    buttons: [{ label: "Хорошо", primary: true, onClick: closeModal }],
  },
};

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!validateForm()) return;

  const email = emailInput.value.trim();
  const key = ["taken", "error"].find((k) => email.includes(k)) ?? "success";

  if (key === "success") {
    form.reset();
    emailWarningShown = false;
    emailWarning.classList.remove("form__email-warning--visible");
  }

  createModal(MODALS[key]);
});
