(function () {
    const preloaderElement = document.querySelector("[data-preloader]");
    const MIN_VISIBLE_TIME = 500;
    const MAX_WAIT_TIME = 3000;
    const FONT_WAIT_TIME = 1200;

    if (!preloaderElement) {
        document.body.classList.remove("page--loading");
        document.body.classList.add("page--ready");
        return;
    }

    const startTime = performance.now();

    function getUrlsFromBackground(backgroundValue) {
        const urls = [];
        const urlPattern = /url\((['"]?)(.*?)\1\)/g;
        let match = urlPattern.exec(backgroundValue);

        while (match) {
            if (match[2] && !match[2].startsWith("data:")) {
                urls.push(match[2]);
            }

            match = urlPattern.exec(backgroundValue);
        }

        return urls;
    }

    function collectCriticalImageUrls() {
        const urls = new Set();
        const hero = document.querySelector(".hero");
        const elements = hero ? Array.from(hero.querySelectorAll("*")) : [];

        if (hero) {
            elements.push(hero);
        }

        document.querySelectorAll(".hero img").forEach(function (image) {
            const src = image.currentSrc || image.src;

            if (src) {
                urls.add(src);
            }
        });

        elements.forEach(function (element) {
            ["", "::before", "::after"].forEach(function (pseudoElement) {
                const backgroundImage = window.getComputedStyle(element, pseudoElement).backgroundImage;

                getUrlsFromBackground(backgroundImage).forEach(function (url) {
                    urls.add(url);
                });
            });
        });

        return Array.from(urls);
    }

    function loadImage(url) {
        return new Promise(function (resolve) {
            const image = new Image();

            image.onload = resolve;
            image.onerror = resolve;
            image.src = url;

            if (image.complete) {
                resolve();
            }
        });
    }

    function wait(milliseconds) {
        return new Promise(function (resolve) {
            window.setTimeout(resolve, milliseconds);
        });
    }

    function hidePreloader() {
        const elapsedTime = performance.now() - startTime;
        const delay = Math.max(MIN_VISIBLE_TIME - elapsedTime, 0);

        window.setTimeout(function () {
            preloaderElement.classList.add("is-hidden");
            document.body.classList.remove("page--loading");

            window.setTimeout(function () {
                document.body.classList.add("page--ready");
                preloaderElement.remove();
            }, 500);
        }, delay);
    }

    function init() {
        const imageUrls = collectCriticalImageUrls();
        const imagesReady = Promise.allSettled(imageUrls.map(loadImage));
        const fontsReady = document.fonts
            ? Promise.race([document.fonts.ready.catch(function () {}), wait(FONT_WAIT_TIME)])
            : Promise.resolve();
        const pageReady = Promise.allSettled([imagesReady, fontsReady]);

        Promise.race([pageReady, wait(MAX_WAIT_TIME)]).then(hidePreloader);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
}());

document.addEventListener("DOMContentLoaded", function () {
    const anchorButtons = document.querySelectorAll(".hero__button[href^='#']");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    anchorButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
            const target = document.querySelector(button.getAttribute("href"));

            if (!target) {
                return;
            }

            event.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
                block: "center",
            });
            history.pushState(null, "", button.getAttribute("href"));
        });
    });

    const supportSession = document.querySelector(".support__session");

    if (supportSession) {
        if ("IntersectionObserver" in window) {
            const sessionObserver = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        supportSession.classList.add("is-animated");
                        observer.unobserve(supportSession);
                    }
                });
            }, {
                threshold: 0.35
            });

            sessionObserver.observe(supportSession);
        } else {
            supportSession.classList.add("is-animated");
        }
    }

    const lazyBackgroundBlocks = Array.from(document.querySelectorAll(".support__intro, .stages, .participants"));

    if (lazyBackgroundBlocks.length) {
        if ("IntersectionObserver" in window) {
            const backgroundObserver = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-background-ready");
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: "500px 0px"
            });

            lazyBackgroundBlocks.forEach(function (block) {
                backgroundObserver.observe(block);
            });
        } else {
            lazyBackgroundBlocks.forEach(function (block) {
                block.classList.add("is-background-ready");
            });
        }
    }

    const slides = Array.from(document.querySelectorAll(".participants__card"));
    const prevButton = document.querySelector(".participants__control--prev");
    const nextButton = document.querySelector(".participants__control--next");
    const counter = document.querySelector(".participants__counter");
    const AUTOPLAY_DELAY = 4000;

    if (!slides.length || !prevButton || !nextButton || !counter) {
        return;
    }

    let slidesPerView = getSlidesPerView();
    let currentSlide = 0;
    let autoplayId = null;

    function getSlidesPerView() {
        if (window.innerWidth >= 1200) {
            return 3;
        }

        if (window.innerWidth >= 768) {
            return 2;
        }

        return 1;
    }

    function getMaxStart() {
        return Math.max(slides.length - slidesPerView, 0);
    }

    function clampSlide(index) {
        return Math.min(Math.max(index, 0), getMaxStart());
    }

    function renderSlides() {
        const maxStart = getMaxStart();
        currentSlide = clampSlide(currentSlide);

        slides.forEach(function (slide, index) {
            const isVisible = index >= currentSlide && index < currentSlide + slidesPerView;
            slide.hidden = !isVisible;
        });

        const visibleTo = Math.min(currentSlide + slidesPerView, slides.length);
        counter.textContent = visibleTo + " / " + slides.length;

        prevButton.classList.toggle("is-disabled", currentSlide === 0);
        nextButton.classList.toggle("is-disabled", currentSlide === maxStart);
        prevButton.disabled = currentSlide === 0;
        nextButton.disabled = currentSlide === maxStart;
    }

    function goToSlide(index) {
        currentSlide = clampSlide(index);
        renderSlides();
    }

    function goToNextManual() {
        if (currentSlide < getMaxStart()) {
            goToSlide(currentSlide + 1);
        }
    }

    function goToPrevManual() {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        }
    }

    function goToNextAuto() {
        const nextSlide = currentSlide >= getMaxStart() ? 0 : currentSlide + 1;
        currentSlide = nextSlide;
        renderSlides();
    }

    function restartAutoplay() {
        window.clearInterval(autoplayId);
        autoplayId = window.setInterval(goToNextAuto, AUTOPLAY_DELAY);
    }

    prevButton.addEventListener("click", function () {
        goToPrevManual();
        restartAutoplay();
    });

    nextButton.addEventListener("click", function () {
        goToNextManual();
        restartAutoplay();
    });

    window.addEventListener("resize", function () {
        slidesPerView = getSlidesPerView();
        renderSlides();
    });

    renderSlides();
    restartAutoplay();
});
