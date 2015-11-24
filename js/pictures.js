/* Модуль инициализации списка фотографий */
'use strict';

// Убираем фильтр
var filters = document.querySelector('.filters');

// Берем и прячем его, если он до этого ещё не спрятан
if (!filters.classList.contains('hidden')) {
  filters.classList.add('hidden');
}

// основной контейнер
var picturesContainer = document.querySelector('.pictures');

// 1 способ перебора основного массива из pictures.js
// eslint активно ругается, но массив в другом файле
// eslint иди и ищи его там
// pictures.forEach(function(el) {
//   var element = getPhotoTemplate(el);
//   picturesContainer.appendChild(element);
// });

// Вариант из способа с аяксом
getPhotos();

/**
 * Отрисовка картинок в виде функции
 * @param {Array} pictures
 */
function drawPictures(pictures) {
  // очищаем
  picturesContainer.innerHTML = '';
  var newPictureFragment = document.createDocumentFragment();

  // выводим
  pictures.forEach(function(el) {
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
    var rawData = evt.target.response;
    var loadedPictures = JSON.parse(rawData);

    drawPictures(loadedPictures);

    // Обработчики для фильтров
    filters.onchange = function(event) {
      event.preventDefault();

      // забираем текущее значение фильтра
      var filter = filters.filter.value;

      switch (filter) {
        // выводим стандартный список
        case 'popular':
          drawPictures(loadedPictures);
          break;

        // список отсортированный по датам по убыванию
        // плюс только последний месяц
        case 'new' :
          var newList = loadedPictures.slice(0);
          newList.sort(compareDate);
          var a = null;
          var month = null;
          var lastMonth = null;
          // фильтруем массив
          var filterNewList = newList.filter(function(date, i) {
            a = new Date(date.date);
            month = a.getMonth();
            if (i === 0) {
              lastMonth = a.getMonth();
              return true;
            }
            if (month === lastMonth) {
              return true;
            }
          });
          drawPictures(filterNewList);
          break;

        // списко отсортированный по комментариям по убыванию
        case 'discussed':
          var newList2 = loadedPictures.slice(0);
          newList2.sort(compareComment);
          drawPictures(newList2);
          break;
      }

      /**
       * Сортировка по комментария
       * @param {Array} element
       * @param {Array} element
       */
      function compareComment(a, b) {
        if (a.comments < b.comments) {
          return 1;
        }
        if (a.comments > b.comments) {
          return -1;
        }
      }

      /**
       * Сортировка по датам
       * @param {Array} element
       * @param {Array} element
       */
      function compareDate(a, b) {
        if (a.date < b.date) {
          return 1;
        }
        if (a.date > b.date) {
          return -1;
        }
      }
    };
  };

  xhr.send();
}

// показываем фильтры
filters.classList.remove('hidden');


/**
 * @param {Object} data
 * @return {element}
 */
function getPhotoTemplate(data) {
  var template = document.querySelector('#picture-template');
  var pictureElement = '';
  var IMAGE_TIMEOUT = 10000;

  var image = new Image('182', '182');

  var loadImageTimeOut = setTimeout(function() {
    image.src = '';
    pictureElement.classList.add('picture-load-failure');
  }, IMAGE_TIMEOUT);

  // хак для работы в ИЕ
  if ('content' in template) {
    pictureElement = template.content.children[0].cloneNode(true);
  } else {
    pictureElement = template.children[0].cloneNode(true);
  }

  // заполняем наш элемент
  pictureElement.querySelector('.picture-comments').textContent = data.comments;
  pictureElement.querySelector('.picture-likes').textContent = data.likes;
  var pictureElementImage = pictureElement.querySelector('img');

  image.onload = function() {
    clearTimeout(loadImageTimeOut);
    pictureElement.replaceChild(image, pictureElementImage);
  };

  image.onerror = function() {
    pictureElement.classList.add('picture-load-failure');
  };

  image.src = '/' + data.url;

  return pictureElement;
}
