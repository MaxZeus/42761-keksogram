function getMessage(a, b) {
  if (typeof(a) == 'boolean') {
    if (a == true) {
      return 'Переданное GIF-изображение анимировано и содержит ' + b + ' кадров';
    }
    if (a == false) {
      return 'Переданное GIF-изображение не анимировано';
    }
  }

  if (typeof(a) == 'number') {
    return 'Переданное SVG-изображение содержит ' + a + ' объектов и ' + b * 4 + ' аттрибутов';
  }

  if (typeof(a) == 'object') {
    if (typeof(b) == 'object') {
      var sum = 0;
      for ( var i = 0; i < a.length; i++){
        sum = sum + a[i] * b[i];
      }
      return 'Общая площадь артефактов сжатия: ' + sum + ' пикселей';
    } else {
      var sum = 0;
      for ( var i = 0; i < a.length; i++){
        sum = sum + a[i];
      }
      return 'Количество красных точек во всех строчках изображения: ' + sum;
    }
  }
}
