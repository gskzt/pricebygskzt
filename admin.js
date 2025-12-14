// Дефолтные учетные данные (при первом запуске)
const defaultCredentials = {
    username: 'admin',
    password: 'admin123'
};

// Загрузка учетных данных из localStorage
function getCredentials() {
    const stored = localStorage.getItem('adminCredentials');
    if (stored) {
        return JSON.parse(stored);
    }
    // Сохраняем дефолтные при первом запуске
    localStorage.setItem('adminCredentials', JSON.stringify(defaultCredentials));
    return defaultCredentials;
}

// Сохранение учетных данных
function saveCredentials(username, password) {
    localStorage.setItem('adminCredentials', JSON.stringify({ username, password }));
}

// Проверка авторизации
function checkAuth() {
    const credentials = getCredentials();
    const storedAuth = sessionStorage.getItem('adminAuth');
    return storedAuth === credentials.username;
}

// Авторизация
function login(username, password) {
    const credentials = getCredentials();
    if (username === credentials.username && password === credentials.password) {
        sessionStorage.setItem('adminAuth', credentials.username);
        return true;
    }
    return false;
}

// Выход
function logout() {
    sessionStorage.removeItem('adminAuth');
    showLoginScreen();
}

// Показать экран входа
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').textContent = '';
    document.getElementById('loginError').classList.remove('show');
}

// Показать админ панель
function showAdminPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    loadCards();
}

// Загрузка карточек
function loadCards() {
    let cards = [];
    try {
        const stored = localStorage.getItem('priceCards');
        if (stored) {
            cards = JSON.parse(stored);
            if (!Array.isArray(cards)) {
                cards = [];
            }
        }
    } catch (e) {
        console.error('Error parsing cards from localStorage:', e);
        cards = [];
    }
    
    const cardsList = document.getElementById('cardsList');
    if (!cardsList) return;
    
    if (cards.length === 0) {
        cardsList.innerHTML = `
            <div class="empty-state">
                <p>Нет карточек. Добавьте первую карточку.</p>
            </div>
        `;
        return;
    }
    
    cardsList.innerHTML = '';
    cards.forEach((card, index) => {
        if (!card) return; // Пропускаем невалидные карточки
        const cardElement = createCardElement(card, index);
        cardsList.appendChild(cardElement);
    });
}

// Функция для безопасного экранирования HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Функция для безопасного экранирования атрибутов
function escapeAttr(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Создание элемента карточки
function createCardElement(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card-item';
    cardDiv.dataset.index = index;
    
    // Безопасное создание элементов
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';
    
    const cardInfo = document.createElement('div');
    cardInfo.className = 'card-info';
    
    const h3 = document.createElement('h3');
    h3.textContent = card.title || '';
    
    const priceDiv = document.createElement('div');
    priceDiv.className = 'card-price';
    priceDiv.textContent = card.price || '';
    
    const descDiv = document.createElement('div');
    descDiv.className = 'card-description';
    descDiv.textContent = card.description || '';
    
    cardInfo.appendChild(h3);
    cardInfo.appendChild(priceDiv);
    cardInfo.appendChild(descDiv);
    
    const cardActions = document.createElement('div');
    cardActions.className = 'card-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary edit-card-btn';
    editBtn.setAttribute('data-index', index);
    editBtn.textContent = 'Редактировать';
    editBtn.addEventListener('click', () => editCard(index));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger delete-card-btn';
    deleteBtn.setAttribute('data-index', index);
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => deleteCard(index));
    
    cardActions.appendChild(editBtn);
    cardActions.appendChild(deleteBtn);
    
    cardContent.appendChild(cardInfo);
    cardContent.appendChild(cardActions);
    cardDiv.appendChild(cardContent);
    
    return cardDiv;
}

// Редактирование карточки
function editCard(index) {
    let cards = [];
    try {
        const stored = localStorage.getItem('priceCards');
        if (stored) {
            cards = JSON.parse(stored);
            if (!Array.isArray(cards)) {
                cards = [];
            }
        }
    } catch (e) {
        console.error('Error parsing cards from localStorage:', e);
        cards = [];
    }
    
    const card = cards[index];
    
    if (!card) {
        console.error('Card not found at index:', index);
        return;
    }
    
    const cardItem = document.querySelector(`.card-item[data-index="${index}"]`);
    const cardContent = cardItem.querySelector('.card-content');
    
    cardItem.classList.add('editing');
    
    // Безопасное создание формы
    const form = document.createElement('form');
    form.className = 'card-form';
    form.setAttribute('data-index', index);
    
    const titleGroup = document.createElement('div');
    titleGroup.className = 'form-group';
    const titleLabel = document.createElement('label');
    titleLabel.textContent = 'Название';
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'card-title-input';
    titleInput.value = card.title || '';
    titleInput.required = true;
    titleGroup.appendChild(titleLabel);
    titleGroup.appendChild(titleInput);
    
    const priceGroup = document.createElement('div');
    priceGroup.className = 'form-group';
    const priceLabel = document.createElement('label');
    priceLabel.textContent = 'Цена';
    const priceInput = document.createElement('input');
    priceInput.type = 'text';
    priceInput.className = 'card-price-input';
    priceInput.value = card.price || '';
    priceInput.required = true;
    priceGroup.appendChild(priceLabel);
    priceGroup.appendChild(priceInput);
    
    const descGroup = document.createElement('div');
    descGroup.className = 'form-group';
    const descLabel = document.createElement('label');
    descLabel.textContent = 'Описание';
    const descTextarea = document.createElement('textarea');
    descTextarea.className = 'card-description-input';
    descTextarea.textContent = card.description || '';
    descTextarea.required = true;
    descGroup.appendChild(descLabel);
    descGroup.appendChild(descTextarea);
    
    const formActions = document.createElement('div');
    formActions.className = 'form-actions';
    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = 'Сохранить';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-secondary cancel-edit-btn';
    cancelBtn.textContent = 'Отмена';
    formActions.appendChild(saveBtn);
    formActions.appendChild(cancelBtn);
    
    form.appendChild(titleGroup);
    form.appendChild(priceGroup);
    form.appendChild(descGroup);
    form.appendChild(formActions);
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveCard(index);
    });
    
    cancelBtn.addEventListener('click', () => {
        loadCards();
    });
    
    cardContent.innerHTML = '';
    cardContent.appendChild(form);
}

// Сохранение карточки
function saveCard(index) {
    let cards = [];
    try {
        const stored = localStorage.getItem('priceCards');
        if (stored) {
            cards = JSON.parse(stored);
            if (!Array.isArray(cards)) {
                cards = [];
            }
        }
    } catch (e) {
        console.error('Error parsing cards from localStorage:', e);
        cards = [];
    }
    
    const form = document.querySelector(`.card-form[data-index="${index}"]`);
    if (!form) {
        console.error('Form not found for index:', index);
        return;
    }
    
    const titleInput = form.querySelector('.card-title-input');
    const priceInput = form.querySelector('.card-price-input');
    const descInput = form.querySelector('.card-description-input');
    
    if (!titleInput || !priceInput || !descInput) {
        console.error('Form inputs not found');
        return;
    }
    
    if (index >= 0 && index < cards.length) {
        cards[index] = {
            id: cards[index].id || Date.now(),
            title: titleInput.value.trim() || '',
            price: priceInput.value.trim() || '',
            description: descInput.value.trim() || ''
        };
    } else {
        console.error('Invalid card index:', index);
        return;
    }
    
    try {
        localStorage.setItem('priceCards', JSON.stringify(cards));
        loadCards();
        
        // Обновляем главную страницу если она открыта
        if (window.opener && typeof window.opener.updateCards === 'function') {
            window.opener.updateCards(cards);
        }
    } catch (e) {
        console.error('Error saving cards to localStorage:', e);
        alert('Ошибка при сохранении карточки');
    }
}

// Удаление карточки
function deleteCard(index) {
    if (!confirm('Вы уверены, что хотите удалить эту карточку?')) {
        return;
    }
    
    let cards = [];
    try {
        const stored = localStorage.getItem('priceCards');
        if (stored) {
            cards = JSON.parse(stored);
            if (!Array.isArray(cards)) {
                cards = [];
            }
        }
    } catch (e) {
        console.error('Error parsing cards from localStorage:', e);
        cards = [];
    }
    
    if (index >= 0 && index < cards.length) {
        cards.splice(index, 1);
    } else {
        console.error('Invalid card index for deletion:', index);
        return;
    }
    
    try {
        localStorage.setItem('priceCards', JSON.stringify(cards));
        loadCards();
        
        // Обновляем главную страницу если она открыта
        if (window.opener && typeof window.opener.updateCards === 'function') {
            window.opener.updateCards(cards);
        }
    } catch (e) {
        console.error('Error saving cards to localStorage:', e);
        alert('Ошибка при удалении карточки');
    }
}

// Добавление новой карточки
function addCard() {
    let cards = [];
    try {
        const stored = localStorage.getItem('priceCards');
        if (stored) {
            cards = JSON.parse(stored);
            if (!Array.isArray(cards)) {
                cards = [];
            }
        }
    } catch (e) {
        console.error('Error parsing cards from localStorage:', e);
        cards = [];
    }
    
    const newCard = {
        id: Date.now(),
        title: 'Новая карточка',
        price: '0 тг',
        description: 'Описание карточки'
    };
    
    cards.push(newCard);
    
    try {
        localStorage.setItem('priceCards', JSON.stringify(cards));
        loadCards();
        
        // Автоматически открываем редактирование новой карточки
        setTimeout(() => {
            const newIndex = cards.length - 1;
            editCard(newIndex);
            const cardItem = document.querySelector(`.card-item[data-index="${newIndex}"]`);
            if (cardItem) {
                cardItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
    } catch (e) {
        console.error('Error saving cards to localStorage:', e);
        alert('Ошибка при добавлении карточки');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Проверка авторизации
    if (checkAuth()) {
        showAdminPanel();
    } else {
        showLoginScreen();
    }
    
    // Форма входа
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');
        
        if (login(username, password)) {
            showAdminPanel();
        } else {
            errorDiv.textContent = 'Неверный логин или пароль';
            errorDiv.classList.add('show');
        }
    });
    
    // Кнопка выхода
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Кнопка изменения учетных данных
    document.getElementById('changeCredentialsBtn').addEventListener('click', () => {
        const section = document.getElementById('credentialsSection');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    });
    
    // Кнопка отмены изменения учетных данных
    document.getElementById('cancelCredentialsBtn').addEventListener('click', () => {
        document.getElementById('credentialsSection').style.display = 'none';
        document.getElementById('credentialsForm').reset();
        document.getElementById('credentialsError').classList.remove('show');
        document.getElementById('credentialsSuccess').classList.remove('show');
    });
    
    // Форма изменения учетных данных
    document.getElementById('credentialsForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorDiv = document.getElementById('credentialsError');
        const successDiv = document.getElementById('credentialsSuccess');
        
        errorDiv.classList.remove('show');
        successDiv.classList.remove('show');
        
        if (newPassword !== confirmPassword) {
            errorDiv.textContent = 'Пароли не совпадают';
            errorDiv.classList.add('show');
            return;
        }
        
        if (newPassword.length < 4) {
            errorDiv.textContent = 'Пароль должен содержать минимум 4 символа';
            errorDiv.classList.add('show');
            return;
        }
        
        saveCredentials(newUsername, newPassword);
        successDiv.textContent = 'Учетные данные успешно изменены';
        successDiv.classList.add('show');
        
        // Обновляем сессию если изменили текущий логин
        const currentAuth = sessionStorage.getItem('adminAuth');
        const oldCredentials = getCredentials();
        if (currentAuth === oldCredentials.username) {
            sessionStorage.setItem('adminAuth', newUsername);
        }
        
        setTimeout(() => {
            document.getElementById('credentialsSection').style.display = 'none';
            document.getElementById('credentialsForm').reset();
            successDiv.classList.remove('show');
        }, 2000);
    });
    
    // Кнопка добавления карточки
    document.getElementById('addCardBtn').addEventListener('click', addCard);
});


