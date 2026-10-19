document.querySelectorAll(".menu").forEach((btn) => {
  btn.addEventListener("click", () => {
    const header = document.querySelector("header");
    if (header) {
      const isExpanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", !isExpanded);
      header.classList.toggle("nav-open");
    }
  });
});
