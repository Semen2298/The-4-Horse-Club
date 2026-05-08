document.addEventListener("DOMContentLoaded", function () {
    const template = document.getElementById("ticker-template");
    const tickers = Array.from(document.querySelectorAll("[data-ticker]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const SPEED = 90;

    if (!template || !tickers.length) {
        return;
    }

    const source = template.content.querySelector(".ticker__item");

    if (!source) {
        return;
    }

    const text = source.textContent.trim().replace(/\s+/g, " ");

    function createItem() {
        const item = source.cloneNode(true);
        item.textContent = text;
        return item;
    }

    function initTicker(ticker) {
        const track = document.createElement("div");
        let itemWidth = 0;
        let offset = 0;
        let animationId = null;
        let lastTime = null;

        ticker.textContent = "";
        ticker.setAttribute("aria-label", text);
        track.className = "ticker__track";
        track.setAttribute("aria-hidden", "true");
        ticker.appendChild(track);

        function stop() {
            window.cancelAnimationFrame(animationId);
            animationId = null;
            lastTime = null;
        }

        function fillTrack() {
            track.textContent = "";
            track.appendChild(createItem());

            itemWidth = track.firstElementChild.offsetWidth;

            if (!itemWidth) {
                return;
            }

            const minWidth = ticker.offsetWidth + itemWidth * 2;

            while (track.scrollWidth < minWidth) {
                track.appendChild(createItem());
            }
        }

        function render() {
            track.style.transform = "translate3d(" + -offset + "px, 0, 0)";
        }

        function animate(time) {
            if (lastTime === null) {
                lastTime = time;
            }

            const delta = time - lastTime;
            lastTime = time;
            offset = (offset + SPEED * delta / 1000) % itemWidth;
            render();
            animationId = window.requestAnimationFrame(animate);
        }

        function start() {
            stop();

            if (reducedMotion.matches || !itemWidth) {
                offset = 0;
                render();
                return;
            }

            animationId = window.requestAnimationFrame(animate);
        }

        function setup() {
            stop();
            fillTrack();
            offset = itemWidth ? offset % itemWidth : 0;
            render();
            start();
        }

        if ("ResizeObserver" in window) {
            const resizeObserver = new ResizeObserver(setup);
            resizeObserver.observe(ticker);
        } else {
            window.addEventListener("resize", setup);
        }

        if (document.fonts) {
            document.fonts.ready.then(setup);
        }

        setup();

        return {
            setup,
            start,
            stop
        };
    }

    const instances = tickers.map(initTicker).filter(Boolean);

    function handleMotionChange() {
        instances.forEach(function (instance) {
            instance.setup();
        });
    }

    function handleVisibilityChange() {
        instances.forEach(function (instance) {
            if (document.hidden) {
                instance.stop();
            } else {
                instance.start();
            }
        });
    }

    if (typeof reducedMotion.addEventListener === "function") {
        reducedMotion.addEventListener("change", handleMotionChange);
    } else {
        reducedMotion.addListener(handleMotionChange);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
});
