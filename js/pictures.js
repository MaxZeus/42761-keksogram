/* Модуль инициализации списка фотографий */
'use strict';

(function() {
  // Объявляем фильтр
  var filters = document.querySelector('.filters');
  var loadedPictures;
  var filteredPictures;

  // основной контейнер
  var picturesContainer = document.querySelector('.pictures');
  var currentPage = 0;
  var PAGE_SIZE = 12;

  // Вариант из способа с аяксом
  getPhotos();

  var wheelTimeout;

  window.addEventListener('scroll', function() {
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(function() {
      drawNextPage();
    }, 100);
  });

  /**
   * Функция, которая рисует новую страницу, проверяя при этом можно ли их рисовать по переменной CurrentPage
   */
  function drawNextPage() {
    while (isNextPageAvailable()) {
      drawPictures(filteredPictures, ++currentPage, false);
    }
  }

  /**
   * Функция, проверки заполняют ли картинки экран и можено ли нарисовать ещё одну6 чтобы его заполнить
   * @return {boolean}
   */
  function isNextPageAvailable() {
      var viewportHeight = window.innerHeight;
      var picturesContainerCoord = picturesContainer.getBoundingClientRect();
      return picturesContainerCoord.bottom - viewportHeight <= 0 && currentPage < Math.ceil(filteredPictures.length / PAGE_SIZE);
  }

  /**
   * Отрисовка картинок в виде функции
   * @param {Array} pictures
   * @param {number}
   * @param {boolean}
   */
  function drawPictures(pictures, pageNumber, replace) {
    if (replace) {
      picturesContainer.innerHTML = '';
    }

    var newPictureFragment = document.createDocumentFragment();

    var pageFrom = pageNumber * PAGE_SIZE;
    var pageTo = pageFrom + PAGE_SIZE;
    var picturesPage = pictures.slice(pageFrom, pageTo);

    // выводим
    picturesPage.forEach(function(el) {
      var element = getPhotoTemplate(el);
      newPictureFragment.appendChild(element);
    });

    picturesContainer.appendChild(newPictureFragment);
  }

  /**
   * Забираем картинки в виде аякса а не через массив
   */
  function getPhotos() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/pictures.json');
    xhr.timeout = 10000;

    // событие по началу загрузки
    xhr.onloadstart = function() {
      filters.classList.add('hidden');
      picturesContainer.classList.add('pictures-loading');
    };

    // событие если ошибка
    xhr.onerror = function() {
      picturesContainer.classList.add('pictures-failure');
    };

    // событие по тайауту
    xhr.ontimeout = function() {
      picturesContainer.classList.add('pictures-failure');
    };

    // событие по загрузке
    xhr.onload = function(evt) {
      picturesContainer.classList.remove('pictures-loading');
      filters.classList.remove('hidden');
      var rawData = evt.target.response;
      loadedPictures = JSON.parse(rawData);
      setActiveFilter();
    };

    xhr.send();
  }

  var filterContainer = document.querySelector('.filters');
  filterContainer.addEventListener('click', function(evt) {
    var clickedFilter = evt.target;
    if (clickedFilter.classList.contains('filters-item')) {
      setActiveFilter(clickedFilter.getAttribute('for'));
    }
  });

  /**
   * Установка фильтра
   * @param {string}
   */
  function setActiveFilter(filter) {

    filteredPictures = loadedPictures.slice(0);

    switch (filter) {
      // список отсортированный по датам по убыванию
      // плюс только последний месяц
      case 'filter-new' :
        filteredPictures.sort(function(a, b) {
          return b.date - a.date;
        });
        // фильтруем массив
        filteredPictures = filteredPictures.filter(function(pictureDate) {
          // делаем выборку за последние 3 месяца
          var lastMonth = Date.now() - 3 * 4 * 7 * 24 * 60 * 60 * 1000;
          var pictureDateMs = new Date(pictureDate.date);
          return +pictureDateMs > lastMonth;
        });
        break;

      // списко отсортированный по комментариям по убыванию
      case 'filter-discussed':
        filteredPictures.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
    }
    currentPage = 0;
    drawNextPage();
  }

  /**
   * @param {Object} data
   * @return {Element}
   */
  function getPhotoTemplate(data) {
    var template = document.querySelector('#picture-template');
    var pictureElement;
    var IMAGE_TIMEOUT = 10000;

    var image = new Image('182', '182');

    var loadImageTimeout = setTimeout(function() {
      image.src = '';
      pictureElement.classList.add('picture-load-failure');
    }, IMAGE_TIMEOUT);


    if ('content' in template) {
      pictureElement = template.content.children[0].cloneNode(true);
    } else {
      // хак для работы шаблона в ИЕ
      pictureElement = template.children[0].cloneNode(true);
    }

    // заполняем наш элемент
    pictureElement.querySelector('.picture-comments').textContent = data.comments;
    pictureElement.querySelector('.picture-likes').textContent = data.likes;
    var pictureElementImage = pictureElement.querySelector('img');

    image.onload = function() {
      clearTimeout(loadImageTimeout);
      pictureElement.replaceChild(image, pictureElementImage);
    };

    image.onerror = function() {
      pictureElement.classList.add('picture-load-failure');
    };

    image.src = data.url;

    return pictureElement;
  }
})();
