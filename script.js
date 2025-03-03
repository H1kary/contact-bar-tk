document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const categoryButtons = document.querySelectorAll('.category-btn');
    const drinksList = document.getElementById('drinks-list');
    const selectedCategoryTitle = document.getElementById('selected-category');
    const modal = document.getElementById('drink-modal');
    const closeBtn = document.querySelector('.close-btn');
    const drinkDetails = document.getElementById('drink-details');
    
    // Данные напитков
    let allDrinks = [];
    let isLoading = false;
    
    // Показать индикатор загрузки
    function showLoader() {
        drinksList.innerHTML = '<div class="loader"><div class="spinner"></div><p>Загрузка напитков...</p></div>';
    }
    
    // Загрузка данных из JSON файлов
    async function loadDrinks() {
        if (isLoading) return;
        isLoading = true;
        showLoader();
        
        try {
            // Загружаем все файлы параллельно для ускорения
            const [cocktails, shots, classics, nonAlcoholic, specialOffers, eon, decanters] = await Promise.all([
                fetch('cocktails.json').then(response => response.json()),
                fetch('shots.json').then(response => response.json()),
                fetch('classics.json').then(response => response.json()),
                fetch('non_alcoholic.json').then(response => response.json()),
                fetch('special_offers.json').then(response => response.json()),
                fetch('eon.json').then(response => response.json()),
                fetch('decanters.json').then(response => response.json())
            ]);
            
            allDrinks = [
                ...cocktails,
                ...shots,
                ...classics,
                ...nonAlcoholic,
                ...specialOffers,
                ...eon,
                ...decanters
            ];
            
            console.log('Все напитки загружены:', allDrinks.length);
            
            // Автоматически выбираем первую категорию после загрузки
            if (categoryButtons.length > 0) {
                categoryButtons[0].click();
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            drinksList.innerHTML = `
                <div class="error-message">
                    <p>Ошибка при загрузке данных</p>
                    <button id="retry-button">Повторить попытку</button>
                </div>
            `;
            
            document.getElementById('retry-button').addEventListener('click', loadDrinks);
        } finally {
            isLoading = false;
        }
    }
    
    // Отображение напитков по категории
    function displayDrinksByCategory(category) {
        let searchType = category;
        
        // Преобразуем тип для поиска
        if (category === 'е-он') searchType = 'e-on';
        if (category === 'спец предложение') searchType = 'спец. предложения';
        if (category === 'безалкогольный') searchType = 'безалкогольные';
        
        const filteredDrinks = allDrinks.filter(drink => drink.type.toLowerCase() === searchType.toLowerCase());
        
        selectedCategoryTitle.textContent = getCategoryDisplayName(category);
        
        if (filteredDrinks.length === 0) {
            drinksList.innerHTML = '<p class="no-drinks">Напитки не найдены</p>';
            console.log('Не найдены напитки для категории:', category, 'поиск по типу:', searchType);
            return;
        }
        
        drinksList.innerHTML = '';
        
        // Создаем фрагмент для оптимизации производительности
        const fragment = document.createDocumentFragment();
        
        filteredDrinks.forEach(drink => {
            const drinkCard = createDrinkCard(drink);
            fragment.appendChild(drinkCard);
        });
        
        drinksList.appendChild(fragment);
    }
    
    // Получение отображаемого имени категории
    function getCategoryDisplayName(category) {
        const categoryNames = {
            'коктейль': 'Коктейли',
            'шот': 'Шоты',
            'классика': 'Классические коктейли',
            'безалкогольный': 'Безалкогольные напитки',
            'спец предложение': 'Специальные предложения',
            'е-он': 'E-on напитки',
            'графин': 'Графины'
        };
        
        return categoryNames[category] || 'Напитки';
    }
    
    // Создание карточки напитка
    function createDrinkCard(drink) {
        const card = document.createElement('div');
        card.className = 'drink-card';
        
        // Определяем иконку в зависимости от типа напитка
        let icon = 'fa-cocktail';
        if (drink.type === 'шот') icon = 'fa-glass-whiskey';
        else if (drink.type === 'классика') icon = 'fa-wine-glass-alt';
        else if (drink.type === 'безалкогольный') icon = 'fa-coffee';
        else if (drink.type === 'спец предложение') icon = 'fa-star';
        else if (drink.type === 'е-он') icon = 'fa-bolt';
        else if (drink.type === 'графин') icon = 'fa-wine-bottle';
        
        card.innerHTML = `
            <div class="drink-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="drink-info">
                <h3>${drink.name}</h3>
                <p><i class="fas fa-blender"></i> ${drink.preparation} • <i class="fas fa-glass-martini"></i> ${drink.glassware}</p>
            </div>
            <button class="details-button">Детали <i class="fas fa-chevron-right"></i></button>
        `;
        
        card.addEventListener('click', () => {
            showDrinkDetails(drink);
        });
        
        return card;
    }
    
    // Отображение деталей напитка
    function showDrinkDetails(drink) {
        const detailsContainer = document.getElementById('drink-details');
        
        // Определяем иконку в зависимости от типа напитка
        let icon = 'fa-cocktail';
        if (drink.type === 'шот') icon = 'fa-glass-whiskey';
        else if (drink.type === 'классика') icon = 'fa-wine-glass-alt';
        else if (drink.type === 'безалкогольный') icon = 'fa-coffee';
        else if (drink.type === 'спец предложение') icon = 'fa-star';
        else if (drink.type === 'е-он') icon = 'fa-bolt';
        else if (drink.type === 'графин') icon = 'fa-wine-bottle';
        
        // Очищаем контейнер
        detailsContainer.innerHTML = '';
        
        // Создаем заголовок
        const detailsHeader = document.createElement('div');
        detailsHeader.id = 'details-header';
        detailsHeader.className = 'drink-details-header';
        detailsHeader.innerHTML = `
            <div class="drink-icon-large">
                <i class="fas ${icon}"></i>
            </div>
            <h2>${drink.name}</h2>
            <p class="preparation-glassware">
                <span class="preparation"><i class="fas fa-blender"></i> ${drink.preparation}</span> • 
                <span class="glassware"><i class="fas fa-glass-martini"></i> ${drink.glassware}</span>
            </p>
        `;
        
        // Создаем список ингредиентов
        const ingredientsContainer = document.createElement('div');
        ingredientsContainer.className = 'ingredients-list';
        
        const ingredientsTitle = document.createElement('h3');
        ingredientsTitle.innerHTML = '<i class="fas fa-list-ul"></i> Ингредиенты:';
        
        const ingredientsList = document.createElement('ul');
        ingredientsList.id = 'ingredients-list';
        
        drink.ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="ingredient-name">${ingredient.name}</span>
                <span class="ingredient-amount">${ingredient.amount}</span>
            `;
            ingredientsList.appendChild(li);
        });
        
        // Собираем все вместе
        ingredientsContainer.appendChild(ingredientsTitle);
        ingredientsContainer.appendChild(ingredientsList);
        
        detailsContainer.appendChild(detailsHeader);
        detailsContainer.appendChild(ingredientsContainer);
        
        // Показываем модальное окно
        modal.style.display = 'block';
    }
    
    // Закрытие модального окна
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Восстанавливаем прокрутку страницы
    }
    
    // Обработчики событий
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Удаляем активный класс у всех кнопок
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            // Отображаем напитки выбранной категории
            const category = this.dataset.category;
            displayDrinksByCategory(category);
        });
    });
    
    // Закрытие модального окна
    closeBtn.addEventListener('click', closeModal);
    
    // Закрытие модального окна при клике вне его содержимого
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Обработка свайпа вниз для закрытия модального окна на мобильных устройствах
    let touchStartY = 0;
    let touchEndY = 0;
    
    modal.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, {passive: true});
    
    modal.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, {passive: true});
    
    function handleSwipe() {
        if (touchEndY - touchStartY > 100) { // Свайп вниз
            closeModal();
        }
    }
    
    // Инициализация
    loadDrinks();
}); 