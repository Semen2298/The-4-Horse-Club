(function() {
    var marquee = document.getElementById('marquee');
    var text = marquee.querySelector('span');
    var clone = text.cloneNode(true);
    marquee.appendChild(clone);

    var scrollAmount = 1; // Скорость прокрутки (единицы на шаг)
    var speed = 6; // Интервал между шагами анимации (миллисекунды)

    function move() {
        if (marquee.scrollLeft >= text.offsetWidth) {
            marquee.scrollLeft -= text.offsetWidth;
        } else {
            marquee.scrollLeft += scrollAmount;
        }
    }

    var interval = setInterval(move, speed);
})();

(function() {
    var marquee = document.getElementById('marquee2');
    var text = marquee.querySelector('span');
    var clone = text.cloneNode(true);
    marquee.appendChild(clone);

    var scrollAmount = 1; // Скорость прокрутки (единицы на шаг)
    var speed = 6; // Интервал между шагами анимации (миллисекунды)

    function move() {
        if (marquee.scrollLeft >= text.offsetWidth) {
            marquee.scrollLeft -= text.offsetWidth;
        } else {
            marquee.scrollLeft += scrollAmount;
        }
    }

    var interval = setInterval(move, speed);
})();