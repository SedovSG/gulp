'use strict';

$(document).ready(function() {  
  $('.main-page .slider').slider({
    indicators: false,
    height: 835
  });

  $('.sidenav').sidenav();
  
  $('.scrollspy').scrollSpy({
    'scrollOffset': 100
  });

  $('.materialboxed').materialbox();

  $('.modal').modal();

  //Behavior headers when scrolling
  $(window).on('scroll', (() => {

    if ($(this).scrollTop() >= 50){
      $('.navbar nav').removeClass('transparent').addClass('white shadow navbar-fixed').css({'position': 'fixed', 'top': 0}).
        end().find('#menu-phone').removeClass('hide');
    }
    else {
      $('.navbar nav').removeClass('white shadow').addClass('transparent').css({'position': 'inherit'}).end().find('#menu-phone').addClass('hide');
    }

  }));

  //Scroll top
  $('.brand-logo').on('click', () => {
    $('body, html').animate({
      scrollTop: 0
    }, 0);
  });

  //##########################################
  // Яндекс.карты
  //##########################################
  /* jshint ignore:start */
  
  ymaps.ready(init);

  function init(){
    let target = $('#map');
        // Строка с адресом, который нужно геокодировать
        let address = ($(target).data('address')) ? $(target).data('address') : 'Екатеринбург';
        let company = $(target).data('name');
        let email   = $(target).data('email');
        let phone   = $(target).data('phone');
        let work    = $(target).data('work');

        // Ищем координаты указанного адреса
        let geocoder = ymaps.geocode(address);
           
        // После того, как поиск вернул результат, вызывается callback-функция
        geocoder.then(
          function (res) {
            // координаты объекта
            let coordinates = res.geoObjects.get(0).geometry.getCoordinates();
            // Создаем карту
            let map = new ymaps.Map('map', {
                center: coordinates, // центр карты - координаты найденного объекта
                zoom: 9, // коэффициент масштабирования

                // элементы управления картой
                // список элементов можно посмотреть на этой странице
                // https://tech.yandex.ru/maps/doc/jsapi/2.1/dg/concepts/controls-docpage/
                controls: [
                    'typeSelector', // переключатель отображаемого типа карты
                    'zoomControl' // ползунок масштаба
                    ]
                  });

            map.behaviors.disable('scrollZoom');

            if($(this).parents('html').hasClass('mobile'))
            {
              map.behaviors.disable('drag');
            }

            let html  = '<div class="popup">';
            html +=   '<div class="popup-text">';
            html +=     `<h5 style="padding-top: 0.2em; padding-bottom: 0.1em">${company}</h5>`;
            html +=     `<div style="padding-bottom: 0.2em"><b>Адрес</b>: ${address}</div>`;
            html +=     work ? `<div style="padding-bottom: 0.2em"><b>Режим работы</b>: ${work}</div>` : '';
            html +=     phone ? `<div style="padding-bottom: 0.2em"><b>Тел.</b>: <a href="tel:${phone}">${phone}</a> (для заказа)</div>` : '';
            html +=     email ? `<div style="padding-bottom: 0.6em"><b>Тел.</b>: <a href="tel:${email}">${email}</a> (производство)</div>` : '';
            html +=   '</div>';
            html += '</div>';

            // Добавление метки (Placemark) на карту
            // Подробнее про метки здесь https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Placemark-docpage/
            
            let placemark = new ymaps.Placemark(
                coordinates, // коодирнаты метки

                // объект с данными метки
                // подробнее https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Placemark-docpage/#param-properties
                {
                    'hintContent': address, // всплывающая подсказка (выводим адрес объекта)
                    'balloonContent': html, // содержимое балуна (выводим время работы)
                  },
                // подробнее https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Placemark-docpage/#param-options
                {
                    // варианты стилей https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.presetStorage-docpage/
                    'preset': 'islands#bluePocketIcon'
                  }
                  );

            map.geoObjects.add(placemark);

            placemark.balloon.open();
          });
      }

      /* jshint ignore:end */
    
});