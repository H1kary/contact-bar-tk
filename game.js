document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultsScreen = document.getElementById('results-screen');
    const categoryCheckboxes = document.querySelectorAll('.category-checkboxes input');
    const startGameBtn = document.getElementById('start-game');
    const endGameBtn = document.getElementById('end-game');
    const restartGameBtn = document.getElementById('restart-game');
    const drinkCard = document.getElementById('drink-card');
    const drinkName = document.getElementById('drink-name');
    const currentProgress = document.getElementById('current-progress');
    const totalProgress = document.getElementById('total-progress');
    const correctCount = document.getElementById('correct-count');
    const incorrectCount = document.getElementById('incorrect-count');
    const totalDrinks = document.getElementById('total-drinks');
    const knownDrinks = document.getElementById('known-drinks');
    const unknownDrinks = document.getElementById('unknown-drinks');
    const knowledgePercent = document.getElementById('knowledge-percent');
    const unknownList = document.getElementById('unknown-list');
    const modal = document.getElementById('drink-modal');
    const closeBtn = document.querySelector('.close-btn');
    const drinkDetails = document.getElementById('drink-details');
    
    // Кнопки для десктопных устройств
    const knowButton = document.getElementById('know-button');
    const dontKnowButton = document.getElementById('dont-know-button');
    const detailsButton = document.getElementById('details-button');
    
    // Данные напитков
    let allDrinks = [];
    let gameDrinks = [];
    let currentDrinkIndex = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unknownDrinksList = [];
    let isLoading = false;
    let touchStartY = 0;
    let touchEndY = 0;
    
    // Загрузка данных из JSON файлов
    async function loadDrinks() {
        if (isLoading) return;
        isLoading = true;
        
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
            isLoading = false;
            
            // Разблокируем кнопку старта
            startGameBtn.disabled = false;
            startGameBtn.textContent = 'Начать тренировку';
            
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            startGameBtn.textContent = 'Ошибка загрузки. Попробуйте снова';
            isLoading = false;
        }
    }
    
    // Начало игры
    function startGame() {
        // Проверяем, выбрана ли хотя бы одна категория
        const selectedCategories = getSelectedCategories();
        if (selectedCategories.length === 0) {
            alert('Выберите хотя бы одну категорию напитков');
            return;
        }
        
        // Фильтруем напитки по выбранным категориям
        gameDrinks = allDrinks.filter(drink => selectedCategories.includes(drink.type));
        
        // Проверяем, есть ли напитки в выбранных категориях
        if (gameDrinks.length === 0) {
            alert('В выбранных категориях нет напитков');
            return;
        }
        
        // Перемешиваем напитки
        shuffleArray(gameDrinks);
        
        // Сбрасываем счетчики
        currentDrinkIndex = 0;
        correctAnswers = 0;
        incorrectAnswers = 0;
        unknownDrinksList = [];
        
        // Обновляем интерфейс
        updateGameStats();
        showCurrentDrink();
        
        // Переключаем экраны
        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        resultsScreen.classList.add('hidden');
    }
    
    // Получение выбранных категорий
    function getSelectedCategories() {
        const selected = [];
        categoryCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selected.push(checkbox.dataset.category);
            }
        });
        return selected;
    }
    
    // Перемешивание массива (алгоритм Фишера-Йейтса)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Обновление статистики игры
    function updateGameStats() {
        currentProgress.textContent = currentDrinkIndex + 1;
        totalProgress.textContent = gameDrinks.length;
        correctCount.textContent = correctAnswers;
        incorrectCount.textContent = incorrectAnswers;
    }
    
    // Показ текущего напитка
    function showCurrentDrink() {
        if (currentDrinkIndex >= gameDrinks.length) {
            endGame();
            return;
        }
        
        const drink = gameDrinks[currentDrinkIndex];
        drinkName.textContent = drink.name;
        
        // Сбрасываем классы анимации
        drinkCard.classList.remove('swiped-up', 'swiped-down');
        
        // Обновляем статистику
        updateGameStats();
    }
    
    // Обработка свайпа вверх (знаю)
    function handleSwipeUp() {
        if (currentDrinkIndex >= gameDrinks.length) return;
        
        drinkCard.classList.add('swiped-up');
        correctAnswers++;
        
        setTimeout(() => {
            currentDrinkIndex++;
            showCurrentDrink();
        }, 300);
    }
    
    // Обработка свайпа вниз (не знаю)
    function handleSwipeDown() {
        if (currentDrinkIndex >= gameDrinks.length) return;
        
        drinkCard.classList.add('swiped-down');
        incorrectAnswers++;
        unknownDrinksList.push(gameDrinks[currentDrinkIndex]);
        
        setTimeout(() => {
            currentDrinkIndex++;
            showCurrentDrink();
        }, 300);
    }
    
    // Завершение игры
    function endGame() {
        // Обновляем статистику результатов
        totalDrinks.textContent = gameDrinks.length;
        knownDrinks.textContent = correctAnswers;
        unknownDrinks.textContent = incorrectAnswers;
        
        const percent = gameDrinks.length > 0 
            ? Math.round((correctAnswers / gameDrinks.length) * 100) 
            : 0;
        knowledgePercent.textContent = `${percent}%`;
        
        // Заполняем список неизвестных напитков
        unknownList.innerHTML = '';
        if (unknownDrinksList.length > 0) {
            unknownDrinksList.forEach(drink => {
                const li = document.createElement('li');
                li.textContent = drink.name;
                li.addEventListener('click', () => showDrinkDetails(drink));
                unknownList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'Отлично! Вы знаете все напитки!';
            unknownList.appendChild(li);
        }
        
        // Переключаем экраны
        setupScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        resultsScreen.classList.remove('hidden');
    }
    
    // Отображение деталей напитка
    function showDrinkDetails(drink) {
        const modal = document.getElementById('drink-modal');
        const drinkDetails = document.getElementById('drink-details');
        
        drinkDetails.innerHTML = `
            <div class="drink-details-header">
                <h2>${drink.name}</h2>
                <p class="preparation-glassware">
                    <span class="preparation">${drink.preparation}</span> • 
                    <span class="glassware">${drink.glassware}</span>
                </p>
            </div>
            
            <div class="ingredients-list">
                <h3>Ингредиенты:</h3>
                <ul>
                    ${drink.ingredients.map(ingredient => 
                        `<li>
                            <span class="ingredient-name">${ingredient.name}:</span> 
                            <span class="ingredient-amount">${ingredient.amount}</span>
                        </li>`
                    ).join('')}
                </ul>
            </div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
    }
    
    // Закрытие модального окна
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Восстанавливаем прокрутку страницы
    }
    
    // Обработчики событий
    startGameBtn.addEventListener('click', startGame);
    
    endGameBtn.addEventListener('click', endGame);
    
    restartGameBtn.addEventListener('click', function() {
        setupScreen.classList.remove('hidden');
        resultsScreen.classList.add('hidden');
    });
    
    // Обработка нажатия на карточку для просмотра деталей
    drinkCard.addEventListener('click', function() {
        if (currentDrinkIndex < gameDrinks.length) {
            showDrinkDetails(gameDrinks[currentDrinkIndex]);
        }
    });
    
    // Обработка свайпов на карточке
    drinkCard.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    }, {passive: true});
    
    drinkCard.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        const diffY = touchEndY - touchStartY;
        
        if (diffY < -100) { // Свайп вверх (знаю)
            handleSwipeUp();
        } else if (diffY > 100) { // Свайп вниз (не знаю)
            handleSwipeDown();
        }
    }, {passive: true});
    
    // Обработчики для кнопок на десктопных устройствах
    knowButton.addEventListener('click', handleSwipeUp);
    
    dontKnowButton.addEventListener('click', handleSwipeDown);
    
    detailsButton.addEventListener('click', function() {
        if (currentDrinkIndex < gameDrinks.length) {
            showDrinkDetails(gameDrinks[currentDrinkIndex]);
        }
    });
    
    // Добавляем клавиатурные сокращения
    document.addEventListener('keydown', function(e) {
        if (gameScreen.classList.contains('hidden')) return;
        
        if (e.key === 'ArrowUp') {
            handleSwipeUp();
        } else if (e.key === 'ArrowDown') {
            handleSwipeDown();
        } else if (e.key === 'Enter' || e.key === ' ') {
            if (currentDrinkIndex < gameDrinks.length) {
                showDrinkDetails(gameDrinks[currentDrinkIndex]);
            }
        }
    });
    
    // Закрытие модального окна
    closeBtn.addEventListener('click', closeModal);
    
    // Закрытие модального окна при клике вне его содержимого
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Обработка свайпа вниз для закрытия модального окна
    modal.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    }, {passive: true});
    
    modal.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        if (touchEndY - touchStartY > 100) { // Свайп вниз
            closeModal();
        }
    }, {passive: true});
    
    // Инициализация
    startGameBtn.disabled = true;
    startGameBtn.textContent = 'Загрузка напитков...';
    loadDrinks();
}); 