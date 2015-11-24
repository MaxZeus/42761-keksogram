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

// перебор основного массива из pictures.js
// eslint активно ругается, но массив в другом файле
// eslint иди и ищи его там
pictures.forEach(function(el) {
  var element = getPhotoTemplate(el);
  picturesContainer.appendChild(element);
});

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
