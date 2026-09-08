/* Секция «3 слоя продуктовой архитектуры» — подсветка связок.

   Клик по карточке оставляет активной её саму и связанные карточки в двух
   ДРУГИХ колонках; всё остальное в секции приглушается. Связь идёт через
   data-dir: у направления там один ключ, у этапа может быть несколько
   (этап 02 относится и к AdTech, и к CxTech).

   Подсветка не расходится дальше двух соседних колонок. Клик по этапу 02
   зажигает оба его направления и все их продукты, но остальные этапы гаснут,
   даже если принадлежат тем же направлениям — иначе загорелась бы почти вся
   секция и фильтр потерял бы смысл.

   Ниже 1024 в макете остаются только карточки направлений, связывать не с
   чем — там фильтр выключен. */

(function () {
  'use strict';

  var section = document.querySelector('.s-arch');
  if (!section) return;

  var cards  = [].slice.call(section.querySelectorAll('[data-arch]'));
  if (!cards.length) return;

  var wide    = window.matchMedia('(min-width: 1024px)');
  var current = null;                       // выбранная карточка или null

  function dirsOf(el) {
    return (el.getAttribute('data-dir') || '').split(/\s+/).filter(Boolean);
  }

  function clear() {
    if (!current) return;
    current = null;
    section.classList.remove('is-filtered');
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.remove('is-on');
      cards[i].setAttribute('aria-pressed', 'false');
    }
  }

  function select(card) {
    if (current === card) { clear(); return; }   // повторный клик снимает

    current = card;
    var col  = card.getAttribute('data-arch');
    var dirs = dirsOf(card);

    section.classList.add('is-filtered');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var on;
      if (c === card) {
        on = true;
      } else if (c.getAttribute('data-arch') === col) {
        on = false;                              // своя колонка гаснет целиком
      } else {
        on = dirsOf(c).some(function (d) { return dirs.indexOf(d) !== -1; });
      }
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', c === card ? String(on) : 'false');
    }
  }

  section.addEventListener('click', function (e) {
    if (!wide.matches) return;
    var card = e.target.closest('[data-arch]');
    if (card) { select(card); e.stopPropagation(); }
    else clear();                                // пустое место внутри секции
  });

  section.addEventListener('keydown', function (e) {
    if (!wide.matches) return;
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    var card = e.target.closest('[data-arch]');
    if (!card) return;
    e.preventDefault();                          // пробел иначе прокрутит страницу
    select(card);
  });

  document.addEventListener('click', clear);     // клик где угодно снаружи
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') clear();
  });

  // ниже 1024 связывать не с чем — снимаем выбор при сужении окна
  var onChange = function () { if (!wide.matches) clear(); };
  if (wide.addEventListener) wide.addEventListener('change', onChange);
  else wide.addListener(onChange);
})();

/* Аккордеон ниже 1024.

   Класс .js-acc ставится в <head> до первой отрисовки. Без него панели
   раскрыты — так контент остаётся доступен, если скрипт не отработал,
   и не мигает раскрытым при загрузке.

   По решению заказчика: при загрузке всё свёрнуто, открытым может быть
   только один блок. */

(function () {
  'use strict';

  var heads = document.querySelectorAll('.arch-acc .acc__head');
  if (!heads.length) return;

  function toggle(head) {
    var panel = head.parentNode;
    var open  = panel.classList.contains('is-open');

    for (var i = 0; i < heads.length; i++) {           // открыт только один
      var p = heads[i].parentNode;
      p.classList.remove('is-open');
      heads[i].setAttribute('aria-expanded', 'false');
    }
    if (!open) {
      panel.classList.add('is-open');
      head.setAttribute('aria-expanded', 'true');
    }
  }

  for (var i = 0; i < heads.length; i++) {
    heads[i].setAttribute('aria-expanded', 'false');   // при загрузке всё закрыто
    heads[i].addEventListener('click', function (e) { toggle(e.currentTarget); });
  }
})();
