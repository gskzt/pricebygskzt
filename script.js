// ============================================
// КАРУСЕЛЬ КАРТОЧЕК - ПРАЙС-ЛИСТ (МАКСИМАЛЬНО ОПТИМИЗИРОВАНО)
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
const CARD_GAP_MOBILE = 24;

// Кэш для оптимизации
let cachedDimensions = null;
let cachedIsMobile = null;
let cachedTitleCenter = null;

// Флаги для оптимизации
let isUpdating = false;
let rafId = null;

// Оптимизированное определение мобильного устройства
function isMobile() {
    if (cachedIsMobile === null) {
        cachedIsMobile = window.innerWidth <= 768 || 
                        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    return cachedIsMobile;
}

// Получение размеров
function getCardDimensions() {
    if (!cachedDimensions) {
        cachedDimensions = isMobile() 
            ? { width: CARD_WIDTH_MOBILE, gap: CARD_GAP_MOBILE }
            : { width: CARD_WIDTH, gap: CARD_GAP };
    }
    return cachedDimensions;
}

// Сброс кэша
function resetCache() {
    cachedDimensions = null;
    cachedIsMobile = null;
    cachedTitleCenter = null;
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
        
        const containerRect = carouselContainer.getBoundingClientRect();
        const containerLeftOffset = containerRect.left;
        
        const activeCardCenterPosition = currentIndex * (cardWidth + cardGap) + (cardWidth / 2);
        
        // Кэшируем центр заголовка
        if (cachedTitleCenter === null && titleElement) {
            const titleRect = titleElement.getBoundingClientRect();
            cachedTitleCenter = titleRect.left + (titleRect.width / 2);
        }
        
        const titleCenter = cachedTitleCenter || (window.innerWidth / 2);
        const offset = titleCenter - containerLeftOffset - activeCardCenterPosition;
        
        // Используем transform для GPU-ускорения
        carouselTrack.style.transform = `translate3d(${offset}px, 0, 0)`;
        carouselTrack.style.willChange = 'transform';
        
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
    cardElements.forEach((card, index) => {
        if (index === activeIndex) {
            if (!card.classList.contains('active')) {
                card.classList.add('active');
            }
        } else {
            card.classList.remove('active');
        }
    });
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
    
    // Создаем DocumentFragment для оптимизации
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
    cachedTitleCenter = null; // Сбрасываем кэш при изменении
    updateCarousel();
}

// Переход к предыдущей карточке
function prevCard() {
    if (cards.length === 0 || isUpdating) return;
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    cachedTitleCenter = null; // Сбрасываем кэш при изменении
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
// УЛУЧШЕННАЯ АНИМАЦИЯ ЗАГОЛОВКА ПРИ СКРОЛЛЕ
// ============================================
let scrollRafId = null;
let lastScrollY = 0;

function updateTitleAnimation() {
    if (!sectionTitle || !pricingSection) return;
    
    if (scrollRafId) {
        cancelAnimationFrame(scrollRafId);
    }
    
    scrollRafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY || window.pageYOffset;
        
        // Оптимизация: обновляем только при значительном изменении
        if (Math.abs(currentScrollY - lastScrollY) < 5) {
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
        
        // Плавное движение заголовка с эффектом параллакса
        const maxOffset = 80;
        const offset = progress * maxOffset;
        const scale = 1 - (progress * 0.1); // Легкое уменьшение при скролле
        const opacity = 1 - (progress * 0.2);
        
        if (sectionTitle) {
            sectionTitle.style.transform = `translate3d(0, ${offset}px, 0) scale(${scale})`;
            sectionTitle.style.opacity = opacity;
            sectionTitle.style.willChange = 'transform, opacity';
        }
        
        scrollRafId = null;
    });
}

// ============================================
// ОПТИМИЗИРОВАННЫЙ СВАЙП ДЛЯ МОБИЛЬНЫХ
// ============================================
let touchStartX = 0;
let touchEndX = 0;
let isDragging = false;
let touchStartTime = 0;

function handleTouchStart(e) {
    if (!isMobile()) return;
    touchStartX = e.touches[0].clientX;
    touchStartTime = Date.now();
    isDragging = true;
}

function handleTouchMove(e) {
    if (!isDragging || !isMobile()) return;
    // Предотвращаем скролл только если свайп горизонтальный
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
    const deltaY = Math.abs(e.touches[0].clientY - (e.touches[0].clientY || 0));
    
    if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault();
    }
}

function handleTouchEnd(e) {
    if (!isDragging || !isMobile()) return;
    
    touchEndX = e.changedTouches[0].clientX;
    const touchDuration = Date.now() - touchStartTime;
    isDragging = false;
    
    const swipeThreshold = 50;
    const timeThreshold = 300; // Максимальное время для свайпа
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold && touchDuration < timeThreshold) {
        if (diff > 0) {
            nextCard();
        } else {
            prevCard();
        }
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ (МАКСИМАЛЬНО ОПТИМИЗИРОВАННАЯ)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Кэшируем элементы DOM
    sectionTitle = document.querySelector('.section-title');
    pricingSection = document.querySelector('.pricing-section');
    titleElement = sectionTitle; // Для кэширования центра заголовка
    
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
    
    // Свайп для мобильных (оптимизировано)
    requestAnimationFrame(() => {
        if (carouselContainer) {
            carouselContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
            carouselContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
            carouselContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
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
        }, 150);
    }, { passive: true });
    
    // Оптимизированная анимация заголовка при скролле
    window.addEventListener('scroll', updateTitleAnimation, { passive: true });
    
    // Инициализация анимации заголовка
    updateTitleAnimation();
    
    // Кнопка админ панели
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            window.location.href = 'admin.html';
        }, { passive: true });
    }
    
    // Оптимизация: убираем will-change после анимации
    setTimeout(() => {
        if (carouselTrack) {
            carouselTrack.style.willChange = 'auto';
        }
    }, 1000);
});
