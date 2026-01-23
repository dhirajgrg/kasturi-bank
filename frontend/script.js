"use strict";
import { BASE_URL } from "./config.js";

function initMain() {
  // selecting dom-----------------------
  const features = document.querySelector("#features");
  const btnExplore = document.querySelector(".btn--explore");
  const allSections = document.querySelectorAll(".section");
  const header = document.querySelector(".main-header");
  const mainNav = document.querySelector(".main-nav");
  const modal = document.querySelector(".modal");
  const overlay = document.querySelector(".overlay");
  const btnRegister = document.querySelectorAll(".btn--register");
  const btnClose = document.querySelector(".modal__close");
  const navMenu = document.querySelector(".main-nav__menu");
  const hamburger = document.querySelector(".hamburger");
  const hamburgerClose = document.querySelector(".hamburger-close");
  const modalRegister = document.querySelector(".modal__register");
  const modalLogin = document.querySelector(".modal__login");
  const toggleLoginLinks = document.querySelectorAll(".modal__toggle-login");
  const toggleRegisterLinks = document.querySelectorAll(
    ".modal__toggle-register",
  );
  const modalTitleRegister = document.querySelector(".modal__title-register");
  const modalTitleLogin = document.querySelector(".modal__title-login");

  // btn explore scroll to features
  btnExplore.addEventListener("click", (e) => {
    features.scrollIntoView({ behavior: "smooth" });
  });

  //nav bar smooth scroll
  navMenu.addEventListener("click", (e) => {
    e.preventDefault();
    if (e.target.classList.contains("main-nav__menu-link")) {
      const id = e.target.getAttribute("href");
      document.querySelector(id).scrollIntoView({ behavior: "smooth" });
      // close mobile menu after click
      if (navMenu.classList.contains("mobile-open")) {
        navMenu.classList.remove("mobile-open");
        if (hamburger) hamburger.setAttribute("aria-expanded", "false");
      }
    } else {
      return;
    }
  });

  // navbar fade in animation
  function fadeInNav(e) {
    if (e.target.classList.contains("main-nav__menu-link")) {
      const link = e.target;
      const siblings = link
        .closest(".main-nav")
        .querySelectorAll(".main-nav__menu-link");
      const logo = link.closest(".main-nav").querySelector("img");
      siblings.forEach((el) => {
        if (el !== link) el.style.opacity = this;
      });
      logo.style.opacity = this;
    }
  }

  mainNav.addEventListener("mouseover", fadeInNav.bind(0.5));
  mainNav.addEventListener("mouseout", fadeInNav.bind(1));

  // nav bar sticky on scroll
  // Replace the "nav bar sticky on scroll" section with this:
  const headerSection = document.querySelector(".main-header");
  const navElement = document.querySelector(".main-nav");

  const stickyNav = function (entries) {
    const [entry] = entries;

    // When the header is NO LONGER visible in the viewport
    if (!entry.isIntersecting) {
      navElement.classList.add("sticky");
    } else {
      navElement.classList.remove("sticky");
    }
  };

  const headerObserver = new IntersectionObserver(stickyNav, {
    root: null,
    threshold: 0,
    // This triggers the sticky nav 90px before the header completely leaves the view
    rootMargin: "-90px",
  });

  headerObserver.observe(headerSection);

  // register btn modal
  const modalClose = function () {
    modal.classList.add("modal--hidden");
    overlay.classList.add("overlay--hidden");
  };
  const modalOpen = function () {
    // default to register form
    showModalRegister();
    modal.classList.remove("modal--hidden");
    overlay.classList.remove("overlay--hidden");
  };

  btnRegister.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      modalOpen();
    });
  });
  btnClose.addEventListener("click", function () {
    modalClose();
  });

  // Hamburger toggle

  hamburger.addEventListener("click", function (e) {
    navMenu.classList.remove("hidden");
  });

  hamburgerClose.addEventListener("click", function () {
    navMenu.classList.add("hidden");
  });

  // Mobile menu close button inside the opened menu
  const menuCloseBtn = document.querySelector(".main-nav__menu-close");
  if (menuCloseBtn) {
    menuCloseBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (navMenu.classList.contains("mobile-open")) {
        navMenu.classList.remove("mobile-open");
        if (hamburger) {
          hamburger.setAttribute("aria-expanded", "false");
          hamburger.classList.remove("is-open");
          hamburger.innerHTML =
            '<img class="hamburger-open" src="/images/menu-line.png" alt="menu icon">';
          hamburger.setAttribute("aria-label", "Open navigation");
        }
      }
    });
  }

  // close mobile menu on resize to desktop
  window.addEventListener("resize", function () {
    if (window.innerWidth > 500 && navMenu.classList.contains("mobile-open")) {
      navMenu.classList.remove("mobile-open");
      if (hamburger) hamburger.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.classList.contains("modal--hidden")) {
      modalClose();
    }
  });
  overlay.addEventListener("click", function () {
    modalClose();
  });

  // revealing sections on scroll
  const revealSection = new IntersectionObserver(
    function (entries, observe) {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("section--hidden");
        observe.unobserve(entry.target);
      });
    },
    {
      root: null,
      threshold: 0.15,
    },
  );
  allSections.forEach(function (section) {
    revealSection.observe(section);
    section.classList.add("section--hidden");
  });

  // lazy loading images
  const imgTargets = document.querySelectorAll("img[data-src]");
  const lazyObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.src = entry.target.dataset.src;
        entry.target.addEventListener("load", function () {
          entry.target.classList.remove("image--lazy");
          observer.unobserve(entry.target);
        });
      });
    },
    {
      root: null,
      threshold: 0.15,
    },
  );

  imgTargets.forEach((img) => {
    lazyObserver.observe(img);
    img.classList.add("image--lazy");
  });

  // tab component functionality
  const tabs = document.querySelector(".services__tabs");
  tabs.addEventListener("click", (e) => {
    e.preventDefault();
    const clicked = e.target.closest(".services__tab");
    if (!clicked) return;
    document.querySelectorAll(".services__tab").forEach((tab) => {
      tab.classList.remove("services__tab--active");
    });
    document.querySelectorAll(".services__content").forEach((content) => {
      content.classList.remove("services__content--active");
    });
    clicked.classList.add("services__tab--active");
    document
      .querySelector(`.services__content-${clicked.dataset.tab}`)
      .classList.add("services__content--active");
  });

  // slider functionality

  const slides = document.querySelectorAll(".review-slider__slide");
  const prevBtn = document.querySelector(".review-slider__btn--prev");
  const nextBtn = document.querySelector(".review-slider__btn--next");
  const dotsContainer = document.querySelector(".review-slider__dots");
  let currentSlide = 0;

  // Create dots based on the number of slides
  slides.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.classList.add("review-slider__dot");
    if (index === 0) dot.classList.add("review-slider__dot--active");
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll(".review-slider__dot");

  // Function to go to a specific slide with smooth transition
  const goToSlide = (slideIndex) => {
    // Remove the active class from all slides
    slides.forEach((s, index) => {
      s.classList.remove("active");
    });

    // Add active class to the current slide
    slides[slideIndex].classList.add("active");

    // Update dots to reflect the active slide
    updateDots(slideIndex);
  };

  // Function to update the active dot
  const updateDots = (activeIndex) => {
    dots.forEach((dot, index) => {
      dot.classList.toggle("review-slider__dot--active", index === activeIndex);
    });
  };

  // Go to the next slide
  const nextSlide = () => {
    currentSlide = (currentSlide + 1) % slides.length;
    goToSlide(currentSlide);
  };

  // Go to the previous slide
  const prevSlide = () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(currentSlide);
  };

  // Add event listeners for navigation buttons
  nextBtn.addEventListener("click", nextSlide);
  prevBtn.addEventListener("click", prevSlide);

  // Add event listeners for dots
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentSlide = index;
      goToSlide(currentSlide);
    });
  });

  // Initialize the slider
  goToSlide(0);

  // Modal form toggle (register <-> login)

  function showModalLogin() {
    if (modalRegister) modalRegister.style.display = "none";
    if (modalLogin) modalLogin.style.display = "block";
    if (modalTitleRegister) modalTitleRegister.style.display = "none";
    if (modalTitleLogin) modalTitleLogin.style.display = "inline";
  }

  function showModalRegister() {
    if (modalRegister) modalRegister.style.display = "block";
    if (modalLogin) modalLogin.style.display = "none";
    if (modalTitleRegister) modalTitleRegister.style.display = "inline";
    if (modalTitleLogin) modalTitleLogin.style.display = "none";
  }

  toggleLoginLinks.forEach((link) =>
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showModalLogin();
    }),
  );

  toggleRegisterLinks.forEach((link) =>
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showModalRegister();
    }),
  );

  /////////////////register new user on click //////////////////
  const registerForm = document.querySelector(".modal__register");

  const errorContainer = document.querySelector(".error-container");
  const retryBtn = document.querySelector(".btn--retry");
  const errorMessage = document.querySelector(".error-text");
  // show error func
  function showError(msg) {
    errorContainer.classList.remove("error-hidden");
    modal.classList.add("error-hidden");
    errorMessage.textContent = msg;
  }

  // retry btn click
  retryBtn.addEventListener("click", function (e) {
    e.preventDefault();
    errorContainer.classList.add("error-hidden");
    modal.classList.remove("error-hidden");
  });

  // register form submit
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.querySelector("#reg-name").value;
    const email = document.querySelector("#reg-email").value;
    const password = document.querySelector("#reg-password").value;
    const confirmPassword = document.querySelector(
      "#reg-confirmPassword",
    ).value;
    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        // 1. Check for specific status codes to give friendly messages
        if (response.status === 404) {
          throw new Error(
            "The registration service is temporarily unavailable. Please try again later.",
          );
        }
        if (response.status === 500) {
          throw new Error(
            "Our servers are having trouble. Please try again in a few minutes.",
          );
        }

        // 2. Use backend message if it exists, otherwise use a generic one
        throw new Error(
          data.message ||
            "We couldn't create your account. Please check your details.",
        );
      }

      // Success logic...
      if (data.status === "success") {
        showModalLogin();
      }
    } catch (err) {
      // 3. Final Filter: Decide what the user sees
      if (err.message === "Failed to fetch") {
        showError("Network error: Please check your internet connection.");
      } else if (err.name === "SyntaxError") {
        // This happens if the server sends back HTML instead of JSON
        showError("We encountered an unexpected error. Please try again.");
      } else {
        // This shows the friendly messages we 'threw' above
        showError(err.message);
      }
    }
  });

  // ///////////////////// login user on click//////////////////
  //////////////////////////////////////////////////////////////
  const loginForm = document.querySelector(".modal__login");
  let isLoggingIn = false; // Add this variable at the top

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // selecting login inputs
    const email = document.querySelector("#lg-email").value;
    const password = document.querySelector("#lg-password").value;

    // If we are already waiting for a response, stop here!
    if (isLoggingIn) return;

    isLoggingIn = true; // Block further clicks
    const loginBtn = loginForm.querySelector("button");
    if (loginBtn) loginBtn.disabled = true; // Visually disable button

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        // 1. Check for specific status codes to give friendly messages
        if (response.status === 404) {
          throw new Error(
            "The login service is temporarily unavailable. Please try again later.",
          );
        }
        if (response.status === 500) {
          throw new Error(
            "Our servers are having trouble. Please try again in a few minutes.",
          );
        }

        // 2. Use backend message if it exists, otherwise use a generic one
        throw new Error(
          data.message ||
            "We couldn't login your account. Please check your details.",
        );
      }
      if (data.status === "success") {
        window.location.href = "app.html";
        return; // Stop here to prevent further logic
      }

      // If it failed, we must re-enable the button
      isLoggingIn = false;
      if (loginBtn) loginBtn.disabled = false;
    } catch (err) {
      isLoggingIn = false; // Re-enable on error
      if (loginBtn) loginBtn.disabled = false;
      showError(err.message);
    }
  });

  //   loginForm.addEventListener("submit", async (e) => {
  //     e.preventDefault();
  //     console.log("login clicked");

  //     // selecting login inputs
  //     const email = document.querySelector("#lg-email").value;
  //     const password = document.querySelector("#lg-password").value;

  //     try {
  //       const response = await fetch(`${BASE_URL}/auth/login`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         credentials: "include",
  //         body: JSON.stringify({
  //           email,
  //           password,
  //         }),
  //       });

  //       const data = await response.json();
  //       if (!response.ok) {
  //         // 1. Check for specific status codes to give friendly messages
  //         if (response.status === 404) {
  //           throw new Error(
  //             "The login service is temporarily unavailable. Please try again later.",
  //           );
  //         }
  //         if (response.status === 500) {
  //           throw new Error(
  //             "Our servers are having trouble. Please try again in a few minutes.",
  //           );
  //         }

  //         // 2. Use backend message if it exists, otherwise use a generic one
  //         throw new Error(
  //           data.message ||
  //             "We couldn't login your account. Please check your details.",
  //         );
  //       }
  //       // Success logic...
  //       if (data.status === "success") {
  //         window.location.href = "app.html";
  //       }
  //     } catch (err) {
  //       // 3. Final Filter: Decide what the user sees
  //       if (err.message === "Failed to fetch") {
  //         showError("Network error: Please check your internet connection.");
  //       } else if (err.name === "SyntaxError") {
  //         // This happens if the server sends back HTML instead of JSON
  //         showError("We encountered an unexpected error. Please try again.");
  //       } else {
  //         // This shows the friendly messages we 'threw' above
  //         showError(err.message);
  //       }
  //     }
  //   });
  //
}
// Add this at the very bottom of script.js
window.addEventListener("DOMContentLoaded", () => {
  initMain();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("action") === "login") {
    // Use your existing modal functions
    modalOpen();
    showModalLogin();
  }
});
