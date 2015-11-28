/* Модуль инициализации списка фотографий */
'use strict';

(function() {
  // Объявляем фильтр
  var filters = document.querySelector('.filters');
  var loadedPictures;

  // основной контейнер
  var picturesContainer = document.querySelector('.pictures');
  var currentPage = 0;
  var PAGE_SIZE = 12;

  // Вариант из способа с аяксом
  getPhotos();

  var wheelTimeout;

  window.addEventListener('wheel', function() {
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(function() {
      console.log('scroll');
      var lastPhoto = document.querySelector('.picture:last-child');
      var viewportHeight = window.innerHeight;
      var lastPhotoCoord = lastPhoto.getBoundingClientRect();

      if (lastPhotoCoord.bottom - viewportHeight <= lastPhotoCoord.height) {
        if (currentPage < Math.ceil(loadedPictures.length / PAGE_SIZE)) {
          drawPictures(loadedPictures, ++currentPage, false);
        }
      }
    }, 100);
  });

  /**
   * Отрисовка картинок в виде функции
   * @param {Array} pictures
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
      // показываем фильтр
      filters.classList.remove('hidden');
      var rawData = evt.target.response;
      loadedPictures = JSON.parse(rawData);

      drawPictures(loadedPictures, 0, true);
    };

    xhr.send();
  }

  // Обработчики для фильтров
  filters.onchange = function(event) {
    event.preventDefault();

    // забираем текущее значение фильтра
    var filter = filters.filter.value;

    switch (filter) {
      // выводим стандартный список
      case 'popular':
        drawPictures(loadedPictures, 0, true);
        break;

      // список отсортированный по датам по убыванию
      // плюс только последний месяц
      case 'new' :
        var newList = loadedPictures.slice(0);
        newList.sort(function(a, b) {
          return b.date - a.date;
        });
        // фильтруем массив
        var filterNewList = newList.filter(function(pictureDate) {
          // делаем выборку за последние 3 месяца
          var lastMonth = Date.now() - 3 * 4 * 7 * 24 * 60 * 60 * 1000;
          var pictureDateMs = new Date(pictureDate.date);
          return +pictureDateMs > lastMonth;
        });
        drawPictures(filterNewList, 0, true);
        break;

      // списко отсортированный по комментариям по убыванию
      case 'discussed':
        var newList2 = loadedPictures.slice(0);
        newList2.sort(function(a, b) {
          return b.comments - a.comments;
        });
        drawPictures(newList2, 0, true);
        break;
    }
  };

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
