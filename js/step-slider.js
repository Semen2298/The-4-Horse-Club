document.addEventListener("DOMContentLoaded", function () {
    const stages = document.querySelector(".stages");
    const list = document.querySelector(".stages__list");
    const slides = Array.from(document.querySelectorAll(".stages__group"));
    const prevButton = document.querySelector(".stages__control--prev");
    const nextButton = document.querySelector(".stages__control--next");
    const pagination = document.querySelector(".stages__pagination");

    if (!list || !slides.length || !prevButton || !nextButton || !pagination) {
        return;
    }

    let currentSlide = 0;

    slides.forEach(function (_, index) {
        const dot = document.createElement("button");
        dot.className = "stages__dot";
        dot.type = "button";
        dot.setAttribute("aria-label", "Показать этап " + (index + 1));
        dot.addEventListener("click", function () {
            goToSlide(index);
        });
        pagination.appendChild(dot);
    });

    const dots = Array.from(pagination.querySelectorAll(".stages__dot"));

    function isMobileSlider() {
        return window.matchMedia("(max-width: 992px)").matches;
    }

    function updateControls() {
        prevButton.classList.toggle("is-disabled", currentSlide === 0);
        nextButton.classList.toggle("is-disabled", currentSlide === slides.length - 1);
        prevButton.disabled = currentSlide === 0;
        nextButton.disabled = currentSlide === slides.length - 1;

        dots.forEach(function (dot, index) {
            dot.classList.toggle("is-active", index === currentSlide);
        });
    }

    function renderSlide() {
        if (isMobileSlider()) {
            list.style.transform = "translateX(" + currentSlide * -100 + "%)";
        } else {
            list.style.transform = "";
        }

        updateControls();
    }

    function goToSlide(index) {
        if (index < 0 || index >= slides.length) {
            return;
        }

        currentSlide = index;
        renderSlide();
    }

    prevButton.addEventListener("click", function () {
        goToSlide(currentSlide - 1);
    });

    nextButton.addEventListener("click", function () {
        goToSlide(currentSlide + 1);
    });

    window.addEventListener("resize", renderSlide);

    function revealPlaneOnCenter() {
        if (!stages || stages.classList.contains("is-visible")) {
            return;
        }

        const rect = stages.getBoundingClientRect();
        const blockCenter = rect.top + rect.height / 2;
        const screenCenter = window.innerHeight / 2;
        const centerOffset = Math.abs(blockCenter - screenCenter);

        if (centerOffset <= rect.height * 0.18) {
            stages.classList.add("is-visible");
            window.removeEventListener("scroll", revealPlaneOnCenter);
            window.removeEventListener("resize", revealPlaneOnCenter);
        }
    }

    if (stages) {
        window.addEventListener("scroll", revealPlaneOnCenter, { passive: true });
        window.addEventListener("resize", revealPlaneOnCenter);
        revealPlaneOnCenter();
    }

    renderSlide();
});
