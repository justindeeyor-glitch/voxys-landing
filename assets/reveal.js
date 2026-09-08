/* Появление элементов при скролле.

   Класс .js-reveal на <html> ставится отдельным скриптом в <head>,
   до первой отрисовки — иначе элементы успели бы мелькнуть видимыми,
   а потом спрятаться. Здесь остаётся только показать их в нужный момент.

   Список селекторов должен совпадать с блоком «Появление при скролле»
   в assets/style.css. */

(function () {
  'use strict';

  var SELECTOR = [
    '.s-cycle__title', '.s-cycle__col', '.s-cycle__img', '.s-cycle__center',
    '.v-card',
    '.s-eco__title', '.eco',
    '.s-arch__title', '.s-arch__sub', '.s-arch__notes', '.stage', '.dir', '.prod',
    '.arch-acc .acc',
    '.s-trust__title', '.s-trust__stat', '.s-trust__tabs', '.s-trust__wall',
    '.s-mission__claim', '.s-mission__box', '.s-mission__wordmark',
    '.s-mission__values > .s-mission__label', '.val',
    '.s-footer__card', '.s-footer__contact'
  ].join(',');

  /* Доля высоты экрана, ниже которой элемент считается «показавшимся».
     0.88 — элемент только зашёл снизу, но уже попал в поле зрения. */
  var TRIGGER = 0.88;

  var root = document.documentElement;

  /* Класса нет — значит анимация не нужна (включено «уменьшить движение»)
     либо скрипт в <head> не отработал. Выходим молча: контент уже виден. */
  if (!root.classList.contains('js-reveal')) return;

  var pending = [].slice.call(document.querySelectorAll(SELECTOR));

  function show(el) {
    el.classList.add('is-in');
    if (io) io.unobserve(el);
  }

  /* Основной механизм. */
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) show(entries[i].target);
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    for (var i = 0; i < pending.length; i++) io.observe(pending[i]);
  }

  /* Подстраховка. IntersectionObserver сообщает только о смене состояния:
     если при резкой прокрутке элемент пролетает экран за один кадр, порог
     не пересекается, события нет — и элемент остаётся скрытым навсегда.
     Поэтому на каждый кадр прокрутки досматриваем оставшихся вручную и
     показываем всех, кто уже поднялся выше линии срабатывания. */
  var queued = false;

  function sweep() {
    queued = false;
    var line = window.innerHeight * TRIGGER;
    var rest = [];
    for (var i = 0; i < pending.length; i++) {
      var el = pending[i];
      if (el.classList.contains('is-in') || el.getBoundingClientRect().top < line) {
        if (!el.classList.contains('is-in')) show(el);
      } else {
        rest.push(el);
      }
    }
    pending = rest;
    if (!pending.length) stop();               // показывать больше нечего
  }

  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(sweep);
  }

  function stop() {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    if (io) { io.disconnect(); io = null; }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  sweep();                                     // то, что видно сразу при загрузке
})();
