// Слайдер


document.addEventListener('DOMContentLoaded', function () {
    const slides = document.querySelectorAll('.tournament__participant');
    const totalSlides = slides.length;
    let slidesPerView = 1;
    let currentSlide = 0;

    function showSlides() {
        slides.forEach((slide, index) => {
            if (index >= currentSlide && index < currentSlide + slidesPerView) {
                slide.style.display = 'flex';
            } else {
                slide.style.display = 'none';
            }
        });

        const navNumber = document.querySelector('.tournament__nav-number-slide span:first-child');
        const currentSlideNumber = currentSlide + 1; // Плюс один для корректного отображения номера слайда
        let totalVisibleSlides = totalSlides - (slidesPerView - 1);
        navNumber.textContent = currentSlideNumber + " / " + totalVisibleSlides; // Обновляем номер и общее количество слайдов
        updateNav();
    }

    function updateNav() {
        const prevNav = document.querySelector('.tournament__nav.prev');
        const nextNav = document.querySelector('.tournament__nav.next');

        if (currentSlide === 0) {
            prevNav.classList.add('disabled');
        } else {
            prevNav.classList.remove('disabled');
        }

        if (currentSlide + slidesPerView >= totalSlides) {
            nextNav.classList.add('disabled');
        } else {
            nextNav.classList.remove('disabled');
        }
    }

    function goToPrevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            showSlides();
        }
    }

    function goToNextSlide() {
        if (currentSlide + slidesPerView < totalSlides) {
            currentSlide++;
            showSlides();
        }
    }

    const prevNav = document.querySelector('.tournament__nav.prev');
    const nextNav = document.querySelector('.tournament__nav.next');

    prevNav.addEventListener('click', goToPrevSlide);
    nextNav.addEventListener('click', goToNextSlide);

    window.addEventListener('resize', function () {
        updateSlidesPerView();
        showSlides();
    });

    function updateSlidesPerView() {
        if (totalSlides === 1) {
            slidesPerView = 1;
        } else if (totalSlides === 2) {
            slidesPerView = 1;
        } else if (totalSlides >= 3 && window.innerWidth >= 1024) {
            slidesPerView = 3;
        } else if (totalSlides >= 2 && window.innerWidth >= 768) {
            slidesPerView = 2;
        } else {
            slidesPerView = 1;
        }
    }

    updateSlidesPerView();
    showSlides();
    setInterval(goToNextSlide, 4000);
});

