// ============================================
// КАРУСЕЛЬ КАРТОЧЕК - МАКСИМАЛЬНО ОПТИМИЗИРОВАНО
// ============================================

// Данные карточек (5 штук)
const cards = [
    {
        id: 1,
        title: 'Шашки по городу',
        price: '4000 тг',
        description: 'Классические шашки по городу с качественной съемкой'
    },
    {
        id: 2,
        title: 'Шашки по городу с сергеком',
        price: '5000 тг',
        description: 'Шашки с участием сергека для большего экшна'
    },
    {
        id: 3,
        title: '1 минутный видео',
        price: '6000 тг',
        description: 'Короткое динамичное видео длительностью 1 минута'
    },
    {
        id: 4,
        title: '1 минутный видео с полицейскими',
        price: '7000 тг',
        description: 'Видео с погонями и участием полицейских'
    },
    {
        id: 5,
        title: '1 минутный видео полносюжетный',
        price: '8000 тг',
        description: 'Полноценный сюжет с полицейскими и сергеком'
    }
];

// Текущий индекс активной карточки
let currentIndex = 2;

// Элементы DOM (кэширование)
let carouselContainer = null;
let carouselTrack = null;
let cardElements = [];
let sectionTitle = null;
let pricingSection = null;
let titleElement = null;

// Параметры карточек
const CARD_WIDTH = 320;
const CARD_GAP = 32;
const CARD_WIDTH_MOBILE = 280;
const CARD_GAP_MOBILE = 20; // Уменьшенный gap для мобильных

// Кэш для оптимизации
let cachedDimensions = null;
let cachedIsMobile = null;
let cachedTitleCenter = null;
let cachedContainerWidth = null;

// Флаги для оптимизации
let isUpdating = false;
let rafId = null;

// Определение типа устройства
function isMobile() {
    if (cachedIsMobile === null) {
        const width = window.innerWidth;
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isSmallScreen = width <= 768;
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(userAgent);
        const isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(userAgent) && width > 768 && width <= 1024;
        cachedIsMobile = isSmallScreen || (isMobileUA && !isTablet);
    }
    return cachedIsMobile;
}

function isTablet() {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return (width > 768 && width <= 1024) || /iPad|Android(?!.*Mobile)|Tablet/i.test(userAgent);
}

// Получение размеров
function getCardDimensions() {
    if (!cachedDimensions) {
        if (isMobile()) {
            cachedDimensions = { width: CARD_WIDTH_MOBILE, gap: CARD_GAP_MOBILE };
        } else {
            cachedDimensions = { width: CARD_WIDTH, gap: CARD_GAP };
        }
    }
    return cachedDimensions;
}

// Сброс кэша
function resetCache() {
    cachedDimensions = null;
    cachedIsMobile = null;
    cachedTitleCenter = null;
    cachedContainerWidth = null;
}

// Оптимизированное обновление позиции карусели
function updateCarousel() {
    if (!carouselContainer || !carouselTrack || isUpdating) return;
    
    isUpdating = true;
    
    // Отменяем предыдущий RAF
    if (rafId) {
        cancelAnimationFrame(rafId);
    }
    
    rafId = requestAnimationFrame(() => {
        const dimensions = getCardDimensions();
        const cardWidth = dimensions.width;
        const cardGap = dimensions.gap;
        
        // Кэшируем ширину контейнера для мобильных
        if (cachedContainerWidth === null || isMobile()) {
            cachedContainerWidth = carouselContainer.offsetWidth;
        }
        
        const containerRect = carouselContainer.getBoundingClientRect();
        const containerLeftOffset = containerRect.left;
        
        const activeCardCenterPosition = currentIndex * (cardWidth + cardGap) + (cardWidth / 2);
        
        // На мобильных центрируем относительно экрана, на десктопе - относительно заголовка
        let targetCenter;
        
        if (isMobile()) {
            // На мобильных центрируем относительно центра экрана
            targetCenter = window.innerWidth / 2;
        } else {
            // На десктопе центрируем относительно заголовка
            if (cachedTitleCenter === null && titleElement) {
                const titleRect = titleElement.getBoundingClientRect();
                cachedTitleCenter = titleRect.left + (titleRect.width / 2);
            }
            targetCenter = cachedTitleCenter || (window.innerWidth / 2);
        }
        
        const offset = targetCenter - containerLeftOffset - activeCardCenterPosition;
        
        // Применяем transform с GPU-ускорением
        carouselTrack.style.transform = `translate3d(${offset}px, 0, 0)`;
        
        // Убираем will-change после анимации для оптимизации
        if (!carouselTrack.style.willChange) {
            carouselTrack.style.willChange = 'transform';
        }
        
        isUpdating = false;
        rafId = null;
    });
    
    updateActiveCard();
}

// Оптимизированное обновление визуального состояния
function updateActiveCard() {
    if (cardElements.length === 0) return;
    
    // Батчинг обновлений DOM
    const activeIndex = currentIndex;
    for (let i = 0; i < cardElements.length; i++) {
        if (i === activeIndex) {
            if (!cardElements[i].classList.contains('active')) {
                cardElements[i].classList.add('active');
            }
        } else {
            cardElements[i].classList.remove('active');
        }
    }
}

// Создание элемента карточки
function createCardElement(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'price-card';
    if (index === currentIndex) {
        cardDiv.classList.add('active');
    }
    
    const h3 = document.createElement('h3');
    h3.textContent = card.title || '';
    
    const priceDiv = document.createElement('div');
    priceDiv.className = 'price';
    priceDiv.textContent = card.price || '';
    
    const descDiv = document.createElement('div');
    descDiv.className = 'description';
    descDiv.textContent = card.description || '';
    
    const button = document.createElement('button');
    button.className = 'order-btn';
    button.textContent = 'Заказать';
    button.addEventListener('click', () => {
        openWhatsApp(card.title || '', card.price || '');
    }, { passive: true });
    
    cardDiv.appendChild(h3);
    cardDiv.appendChild(priceDiv);
    cardDiv.appendChild(descDiv);
    cardDiv.appendChild(button);
    
    return cardDiv;
}

// Инициализация карусели
function initCarousel() {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;
    
    carousel.innerHTML = '';
    carouselContainer = carousel;
    
    const track = document.createElement('div');
    track.className = 'carousel-track';
    carouselTrack = track;
    
    // Используем DocumentFragment для оптимизации
    const fragment = document.createDocumentFragment();
    cardElements = [];
    
    cards.forEach((card, index) => {
        const cardElement = createCardElement(card, index);
        fragment.appendChild(cardElement);
        cardElements.push(cardElement);
    });
    
    track.appendChild(fragment);
    carousel.appendChild(track);
    
    // Обновляем позицию после рендера
    requestAnimationFrame(() => {
        updateCarousel();
    });
}

// Переход к следующей карточке
function nextCard() {
    if (cards.length === 0 || isUpdating) return;
    currentIndex = (currentIndex + 1) % cards.length;
    cachedTitleCenter = null;
    updateCarousel();
}

// Переход к предыдущей карточке
function prevCard() {
    if (cards.length === 0 || isUpdating) return;
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    cachedTitleCenter = null;
    updateCarousel();
}

// Открытие WhatsApp
function openWhatsApp(title, price) {
    const whatsappNumber = '+77477330414';
    const message = encodeURIComponent(`Здравствуйте! Хочу заказать: ${title} (${price})`);
    const url = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(url, '_blank');
}

// ============================================
// ОПТИМИЗИРОВАННАЯ АНИМАЦИЯ ЗАГОЛОВКА
// ============================================
let scrollRafId = null;
let lastScrollY = 0;
let isScrolling = false;

function updateTitleAnimation() {
    if (!sectionTitle || !pricingSection || isScrolling) return;
    
    if (scrollRafId) {
        cancelAnimationFrame(scrollRafId);
    }
    
    scrollRafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY || window.pageYOffset;
        
        // Оптимизация: обновляем только при значительном изменении
        if (Math.abs(currentScrollY - lastScrollY) < 3) {
            scrollRafId = null;
            return;
        }
        
        lastScrollY = currentScrollY;
        
        const rect = pricingSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        let progress = 0;
        
        if (rect.top < windowHeight && rect.bottom > 0) {
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            const visibleHeight = windowHeight - sectionTop;
            progress = Math.max(0, Math.min(1, visibleHeight / (windowHeight + sectionHeight)));
        }
        
        // Упрощенная анимация для мобильных
        if (isMobile()) {
            const maxOffset = 50;
            const offset = progress * maxOffset;
            if (sectionTitle) {
                sectionTitle.style.transform = `translate3d(0, ${offset}px, 0)`;
                sectionTitle.style.opacity = 1 - (progress * 0.2);
            }
        } else {
            const maxOffset = 80;
            const offset = progress * maxOffset;
            const scale = 1 - (progress * 0.1);
            const opacity = 1 - (progress * 0.2);
            
            if (sectionTitle) {
                sectionTitle.style.transform = `translate3d(0, ${offset}px, 0) scale(${scale})`;
                sectionTitle.style.opacity = opacity;
            }
        }
        
        scrollRafId = null;
    });
}

// ============================================
// ОПТИМИЗИРОВАННЫЙ СВАЙП ДЛЯ МОБИЛЬНЫХ
// ============================================
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let isDragging = false;
let touchStartTime = 0;
let lastSwipeTime = 0;

function handleTouchStart(e) {
    if (!isMobile() && !isTablet()) return;
    
    // Защита от слишком частых свайпов
    const now = Date.now();
    if (now - lastSwipeTime < 300) return;
    
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = now;
    isDragging = true;
}

function handleTouchMove(e) {
    if (!isDragging || (!isMobile() && !isTablet())) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartX);
    const deltaY = Math.abs(touch.clientY - touchStartY);
    
    // Предотвращаем скролл только если свайп горизонтальный
    if (deltaX > deltaY && deltaX > 15) {
        e.preventDefault();
    }
}

function handleTouchEnd(e) {
    if (!isDragging || (!isMobile() && !isTablet())) return;
    
    const touch = e.changedTouches[0];
    touchEndX = touch.clientX;
    const touchDuration = Date.now() - touchStartTime;
    const diffY = Math.abs(touch.clientY - touchStartY);
    isDragging = false;
    
    const swipeThreshold = 40; // Уменьшенный порог для мобильных
    const timeThreshold = isTablet() ? 400 : 350;
    const diff = touchStartX - touchEndX;
    
    // Проверяем что свайп горизонтальный
    if (Math.abs(diff) > swipeThreshold && 
        Math.abs(diff) > diffY && 
        touchDuration < timeThreshold) {
        
        lastSwipeTime = Date.now();
        
        if (diff > 0) {
            nextCard();
        } else {
            prevCard();
        }
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Кэшируем элементы DOM
    sectionTitle = document.querySelector('.section-title');
    pricingSection = document.querySelector('.pricing-section');
    titleElement = sectionTitle;
    
    initCarousel();
    
    // Обработчики кнопок навигации
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevCard, { passive: true });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', nextCard, { passive: true });
    }
    
    // Навигация клавиатурой (throttle)
    let keyThrottle = false;
    document.addEventListener('keydown', (e) => {
        if (keyThrottle) return;
        keyThrottle = true;
        
        if (e.key === 'ArrowLeft') prevCard();
        if (e.key === 'ArrowRight') nextCard();
        
        setTimeout(() => { keyThrottle = false; }, 300);
    }, { passive: true });
    
    // Свайп для мобильных и планшетов
    requestAnimationFrame(() => {
        if (carouselContainer) {
            carouselContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
            carouselContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
            carouselContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
            carouselContainer.addEventListener('touchcancel', () => {
                isDragging = false;
            }, { passive: true });
        }
    });
    
    // Оптимизированное обновление при изменении размера окна
    let resizeTimeout;
    let resizeRafId = null;
    
    window.addEventListener('resize', () => {
        resetCache();
        clearTimeout(resizeTimeout);
        
        if (resizeRafId) {
            cancelAnimationFrame(resizeRafId);
        }
        
        resizeTimeout = setTimeout(() => {
            resizeRafId = requestAnimationFrame(() => {
                updateCarousel();
                resizeRafId = null;
            });
        }, 200);
    }, { passive: true });
    
    // Оптимизированная анимация заголовка при скролле
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            isScrolling = true;
            updateTitleAnimation();
            setTimeout(() => { isScrolling = false; }, 100);
        }
    }, { passive: true });
    
    // Инициализация анимации заголовка
    updateTitleAnimation();
    
    // Кнопка админ панели
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            window.location.href = 'admin.html';
        }, { passive: true });
    }
    
    // Убираем will-change после инициализации для оптимизации
    setTimeout(() => {
        if (carouselTrack) {
            carouselTrack.style.willChange = 'auto';
        }
    }, 2000);
});
