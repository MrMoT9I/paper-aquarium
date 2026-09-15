// Три языка: русский, английский, польский.
//
// Язык берём из выбора человека (localStorage), а если выбора не было —
// из настроек его устройства. Ни угадываний по IP, ни отдельного адреса
// для каждого языка: у аквариума один адрес, и он должен открываться
// одинаково у всех, кому дали ссылку.
//
// Строки лежат в одном месте на все страницы: аквариум, съёмка, раскраски,
// управление и правила. Разъедутся по файлам — половина останется
// непереведённой, и заметишь это не ты, а тот, кому ты дал ссылку.
//
//   I18N.t('menu.feed.title')            — строка
//   I18N.t('home.fish', {n: 3})          — с подстановкой
//   I18N.plural(3, 'fish')               — рыбка / рыбки / рыбок
//   I18N.apply(root)                     — раскладывает переводы по data-t
//   I18N.set('pl')                       — переключить и запомнить
//   I18N.mount(el)                       — нарисовать переключатель RU EN PL
//
// В разметке:
//   <b data-t="menu.feed.title"></b>     — текст
//   <input data-t-ph="home.code.hint">   — placeholder
//   <button data-t-title="menu.close">   — подсказка title
//   <img data-t-alt="cap.photo">         — подпись alt
(function () {
  'use strict';

  var KEY = 'aqua.lang';
  var LANGS = ['ru', 'en', 'pl'];

  var DICT = {
    ru: {
      'lang.name': 'Русский',

      // ── главная ──
      'home.title': 'Мои аквариумы',
      'home.lead': 'Распечатай шаблон, раскрась фломастерами, сфотографируй — и робот оживёт. У каждого ребёнка может быть свой аквариум.',
      'home.empty': 'Пока ни одного аквариума. Создай первый — это займёт секунду.',
      'home.new': 'Новый аквариум',
      'home.bycode.title': 'Открыть аквариум по коду',
      'home.bycode.hint': 'Код нужен только на новом устройстве — на этом аквариумы запоминаются сами. Подойдут и пять цифр из «Открыть на другом экране».',
      'home.pin.bad.title': 'Эти цифры не подошли',
      'home.pin.bad.text': 'Код из пяти цифр живёт 5 минут — возможно, он истёк. Попроси показать его заново: на телефоне «Открыть на другом экране» → «Код для телевизора».',
      'home.pin.many.title': 'Слишком много попыток',
      'home.pin.many.text': 'Подожди немного и попробуй ещё раз.',
      'home.bycode.placeholder': 'например, mk4dp7wq2f',
      'home.bycode.open': 'Открыть',
      // Четыре шага для того, кто пришёл впервые: увидел рилс — а дальше что?
      'home.how.title': 'Как это работает',
      'home.how.s0': 'Создай аквариум',
      'home.how.s1': 'Распечатай раскраску',
      'home.how.s2': 'Раскрась фломастерами',
      'home.how.s3': 'Сфотографируй телефоном',
      'home.how.s4': 'Открой на большом экране по коду',
      'home.how.demo': '🤖 Посмотреть живой аквариум',
      'home.how.demo.sub': 'общая витрина — роботы уже двигаются',
      'home.card.kill': 'Убрать аквариум',
      'home.card.empty': 'тут пока пусто',
      'home.terms': 'Правила и данные ↗',
      'terms.back': '← к аквариумам',
      'home.footer.important': 'Важно.',
      'home.footer.text': ' Аккаунтов нет: по коду аквариум смотрят, по паролю управляют, оба хранит этот браузер. Подробности — в правилах.',

      'home.create.title': 'Новый аквариум',
      'home.create.text': 'Назови, чтобы отличать в списке — например, по имени ребёнка.',
      'home.create.value': 'Аквариум',
      'home.create.ok': 'Создать',
      'home.created.title': 'Аквариум создан',
      'home.created.text': 'По коду аквариум открывают и смотрят, по паролю им управляют. На этом устройстве оба уже сохранены — они всегда под рукой в меню аквариума, записывать их прямо сейчас не обязательно. Но где-то сохранить стоит: почты и аккаунта тут нет, восстановить их будет негде.',
      'home.created.code': 'Код аквариума',
      'home.created.pass': 'Пароль',
      'home.created.ok': 'Сохранил, поехали',
      'home.create.fail.title': 'Аквариум не создался',
      'home.create.fail.text': 'Похоже, сервер не отвечает. Проверь, запущен ли node server.js.',
      'home.remove.title': 'Убрать «{name}»?',
      'home.remove.text': 'Из списка — аквариум останется на сервере, вернёшь его по коду {code}. Совсем — {what} уедут в корзину на сервере, и по коду он больше не откроется.',
      'home.remove.whatEmpty': 'аквариум уедет',
      'home.remove.cancel': 'Отмена',
      'home.remove.forget': 'Убрать из моего списка',
      'home.remove.delete': 'Удалить аквариум совсем',
      'home.remove.pass.title': 'Пароль от «{name}»',
      'home.remove.pass.text': 'Удалить аквариум совсем можно только с паролем. Если пароля нет — убери аквариум из своего списка, он останется у хозяина.',
      'home.badcode.title': 'Код не подходит',
      'home.badcode.text': 'Код аквариума — это ровно 10 символов, буквы и цифры. Проверь, не потерялся ли знак.',

      // ── меню аквариума ──
      'menu.tank': 'Аквариум',
      'menu.copied': 'ссылка скопирована',
      'menu.pass': '🔑 пароль',
      'menu.pass.set': '🔓 задать пароль',
      'menu.pass.title': 'Пароль аквариума',
      'menu.rename.hint': 'Переименовать аквариум',
      'menu.close': 'Закрыть меню',
      'menu.back': '← назад',
      'menu.hint': 'нажми в любом месте — покажу меню',
      'menu.capture.title': 'Сфотографировать робота',
      'menu.capture.sub': 'раскрашенный лист оживает в аквариуме',
      'menu.pack.title': 'Запустить готового робота',
      'menu.pack.sub': 'из набора, без раскрашивания',
      'menu.feed.title': 'Подзарядить',
      'menu.feed.sub': 'роботы соберутся на подзарядку',
      'menu.print.title': 'Раскраски для печати',
      'menu.print.sub': '12 видов роботов на обычном листе A4',
      'menu.bg.title': 'Сменить фон',
      'menu.bg.sub': 'картинка, на фоне которой двигаются роботы',
      'menu.fish.title': 'Убрать роботов',
      'menu.fish.sub': 'удалить лишних из аквариума',
      'menu.fish.sub.pass': 'удалить лишних — нужен пароль',
      'menu.home.title': 'Мои аквариумы',
      'menu.home.sub': 'другие аквариумы — и завести новый',
      'menu.picker.title': 'Кого запустить?',
      'menu.picker.sub': 'Робот из набора появится в аквариуме сразу',
      'menu.picker.drawing': 'рисую…',
      'menu.picker.failed': 'не вышло',
      'menu.picker.nopack': 'Набор не собран — запусти tools\\convert-pack.ps1',
      'menu.rename.title': 'Название аквариума',
      'menu.rename.text': 'Видно только тебе — в списке аквариумов и в заголовке этой страницы.',
      'menu.rename.ok': 'Сохранить',
      'menu.rename.fail': 'Не переименовалось',
      'menu.access.title': 'Доступ к аквариуму',
      'menu.access.text': 'По коду аквариум смотрят, по паролю им управляют. Оба сохранены в этом браузере — если почистить его данные, восстановить их будет негде.',
      'menu.access.done': 'Готово',
      'menu.access.change': 'Сменить пароль',
      'menu.newpass.title': 'Новый пароль аквариума',
      'menu.newpass.first': 'Пароль для аквариума',
      'menu.newpass.text': 'От 4 знаков. Цифры удобнее: их диктуют по телефону и набирают на пульте. Старый пароль перестанет работать на всех устройствах.',
      'menu.newpass.ph': 'новый пароль',
      'menu.newpass.short.title': 'Слишком короткий',
      'menu.newpass.short.text': 'Нужно хотя бы четыре знака.',
      'menu.newpass.saved.title': 'Пароль сохранён',
      'menu.newpass.saved.text': 'Запиши его: восстановить пароль негде. Код аквариума не менялся — по нему по-прежнему смотрят.',
      'menu.newpass.saved.field': 'Новый пароль',
      'menu.newpass.saved.ok': 'Записал',
      'menu.oldpass.title': 'Старый пароль',
      'menu.oldpass.text': 'Сменить пароль может тот, кто знает нынешний.',
      'menu.fail.title': 'Не вышло',
      'menu.fail.server': 'Сервер не отвечает.',
      'menu.fail.pass': 'Сервер не принял пароль.',
      'menu.link.title': 'Ссылка на аквариум',
      'tank.doctitle': 'Аквариум',
      'tank.frame.print': 'Раскраски для печати',
      'tank.frame.bg': 'Фон аквариума',
      'tank.frame.fish': 'Роботы аквариума',
      'tank.frame.capture': 'Съёмка робота',
      'tank.crash': '<b>Сцена не запустилась</b><br>{msg}',
      'menu.link.text': 'Скопировать сам не смог — забери отсюда. По ней аквариум откроется на любом устройстве.',
      'menu.link.ok': 'Готово',
      // «Открыть на другом экране»: телефон снимает, большой экран показывает —
      // весь перенос между устройствами собран в одном пункте.
      'menu.share.title': 'Открыть на другом экране',
      'menu.share.sub': 'QR и ссылка: телевизор, планшет, второй телефон',
      'menu.share.hint': 'Наведи камеру телефона — аквариум откроется там',
      'menu.share.copy': 'Скопировать ссылку',
      'menu.share.copy.sub': 'отправь её в мессенджер — и открой где угодно',
      'menu.share.send': 'Отправить ссылку…',
      'menu.share.send.sub': 'через то, чем ты обычно делишься',
      'menu.share.pin': 'Код для телевизора',
      'menu.share.pin.sub': 'пять цифр — их легко набрать пультом',
      'menu.share.pin.text': 'Набери эти цифры на телевизоре — на главной странице, в поле «Открыть аквариум по коду». Код живёт 5 минут.',
      'menu.share.pin.fail': 'Код не выдался — попробуй ещё раз',
      // Витрина: общий аквариум для знакомства. Меню здесь урезано, чтобы
      // гость не отправил рыбку ребёнка в чужой аквариум.
      'demo.title': '🫧 Это витрина',
      'demo.text': 'Общий аквариум для знакомства — роботы тут ничьи. Свои живут в собственном аквариуме: завести его — секунда, раскраски и съёмка будут там.',
      'demo.own': 'Завести свой аквариум',
      'demo.own.sub': 'печать, съёмка и свои роботы — там',

      'tank.loading': 'Наполняю аквариум…',
      'tank.nofish': 'роботов пока нет',
      'tank.notank': 'Аквариум не найден — возможно, его удалили или в коде опечатка.',
      'tank.tolist': 'К моим аквариумам →',
      'tank.noserver': 'Сервер недоступен. Запусти <code>node server.js</code> и обнови страницу.',
      'tank.nopick': 'Не выбран аквариум.',
      'tank.home': 'На главную →',

      // ── съёмка ──
      'cap.title': '🤖 Оживи своего робота!',
      'cap.sub': 'Раскрась робота на листе, сфотографируй — и он появится в аквариуме',
      'cap.back': '← в аквариум',
      'cap.shoot': 'Сфотографировать лист',
      'cap.hint': 'Положи лист на стол, чтобы все четыре чёрных квадрата попали в кадр',
      'cap.qr': 'Удобнее с телефона: наведи камеру на код — съёмка откроется там',
      'cap.searching': 'Ищу робота на фото…',
      'cap.reviving': 'робот оживает…',
      'cap.release': 'Выпустить в аквариум! 🌊',
      'cap.retake': 'Переснять',
      'cap.boost': 'Ярче цвета',
      'cap.done': 'Робот отправился в аквариум!',
      'cap.done.sub': 'Посмотри на большой экран — она уже там',
      'cap.done.sub.embed': 'Закрой окно — он уже двигается',
      'cap.again': 'Сфотографировать ещё одну',
      'cap.retry': 'Попробовать ещё раз',
      'cap.sending': 'Робот отправляется в аквариум…',
      'cap.err.manifest': 'Не загрузился manifest.json — проверь, что сервер запущен.',
      'cap.err.photo': 'Не удалось открыть фото, попробуй ещё раз.',
      'cap.itis': 'Это {name}!',
      'cap.photo': 'Твой робот',
      'cap.err.nofish': 'Робот потерялся — сфотографируй лист заново.',
      'cap.err.status': 'Сервер ответил {code}',
      'cap.err.markers': 'Нашёл меток: {n} из 4. Сфотографируй весь лист целиком, при хорошем свете и без бликов — все четыре чёрных квадрата должны быть в кадре.',
      'cap.err.send': 'Не получилось отправить: {msg}',

      // ── управление ──
      'adm.doctitle': 'Аквариум — управление роботами',
      'adm.title': 'управление',
      'adm.tank': 'Аквариум',
      'adm.capture': 'Съёмка',
      'adm.print': 'Раскраски',
      'adm.home': 'Мои аквариумы',
      'adm.pass': 'Пароль:',
      'adm.pass.change': 'Сменить пароль',
      'adm.pass.show': 'Показать пароль',
      'adm.bg': 'Фон аквариума',
      'adm.bg.one': 'Фон {n}',
      'adm.bg.own': 'Свой фон',
      'adm.bg.add': 'свой фон',
      'adm.bg.busy': 'загружаю…',
      'adm.bg.del': 'Удалить этот фон',
      'adm.bg.del.title': 'Удалить фон?',
      'adm.bg.del.text': 'Файл будет стёрт безвозвратно — в отличие от роботов, копии не остаётся.',
      'adm.bg.fail': 'Фон не загрузился',
      'adm.bg.err.read': 'не удалось прочитать файл',
      'adm.bg.err.img': 'это не картинка',
      'adm.fish.count': 'роботов: {n}',
      'adm.fish.pack': 'из набора · ',
      'adm.fish.del': 'Удалить',
      'adm.fish.del.title': 'Удалить робота?',
      'adm.fish.del.pack': 'Он уйдёт из аквариума. Запустить такого же можно снова в любой момент.',
      'adm.fish.del.painted': 'Рисунок переедет в корзину на сервере — если что, его можно вернуть.',
      'adm.empty': 'В аквариуме пока нет нарисованных роботов.',
      'adm.empty.sub': 'Раскрась лист и сфотографируй его с телефона — ссылка «Съёмка» наверху.',
      'adm.clear': 'Удалить всех роботов',
      'adm.clear.title': 'Очистить аквариум?',
      'adm.clear.text': 'Из аквариума уйдут все роботы — {n} шт. Рисунки переедут в корзину на сервере, вернуть их можно, но из списка они пропадут.',
      'adm.noserver': 'сервер недоступен — запусти node server.js',
      'adm.gate.title': '🔒 Управление под паролем',
      'adm.gate.text': 'Смотреть аквариум можно и без него — пароль нужен, чтобы менять фон, переименовывать и удалять роботов.',
      'adm.gate.ph': 'пароль',
      'adm.gate.enter': 'Войти',
      'adm.gate.back': '← в аквариум',
      'adm.gate.bad': 'Пароль не подошёл.',
      'adm.gate.old': 'Пароль устарел — введи новый.',
      'adm.gate.many': 'Слишком много попыток, подожди минуту.',
      'adm.gate.wait': 'Слишком много попыток. Подожди {n} с.',
      'adm.gate.noserver': 'Сервер не отвечает.',
      'adm.gate.need': 'Нужен пароль аквариума.',

      // ── раскраски ──
      'print.title': 'Раскраски — шаблоны для печати',
      'print.home': '← мои аквариумы',
      'print.all': 'Печать всех',
      'print.pdf': 'Скачать PDF',
      'print.pdf.file': 'раскраски-аквариум.pdf',
      'print.one': 'Печать этого листа',
      'print.note': 'Печатай на обычной А4 в альбомной ориентации, масштаб 100% (без «вписать в страницу») — размеры меток важны для распознавания. Чёрные квадраты в углах не закрашивать!',
      'print.note2': 'Принтера рядом нет? Скачай все листы одним PDF (кнопка вверху) и отправь туда, где принтер найдётся. А пока запусти в аквариум готового робота из меню.',
      'print.nomanifest': 'Не загрузился manifest.json — проверь, что сервер запущен.',

      // ── общее ──
      'pass.ask.title': 'Пароль аквариума',
      'pass.ask.text': 'Пароль спрашивают только на управление. Смотреть аквариум можно и без него.',
      'pass.ask.ph': 'например, 481902',
      'pass.ask.ok': 'Войти',
      'pass.bad.title': 'Пароль не подошёл',
      'pass.bad.text': 'Проверь пароль — тот, что показали при создании аквариума.',
      'pass.many.title': 'Слишком много попыток',
      'pass.many.text': 'Подожди {n} с и попробуй снова.',
      'modal.cancel': 'Отмена',
      'modal.delete': 'Удалить',
      'modal.ok': 'Понятно',
      'modal.save': 'Сохранить',
      'modal.copyHint': 'Нажми, чтобы скопировать',
      'modal.copied': 'скопировано'
    },

    en: {
      'lang.name': 'English',

      'home.title': 'My aquariums',
      'home.lead': 'Print a sheet, colour it with markers, take a photo — and the robot comes alive. Every child can have their own aquarium.',
      'home.empty': 'No aquariums yet. Create the first one — it takes a second.',
      'home.new': 'New aquarium',
      'home.bycode.title': 'Open an aquarium by code',
      'home.bycode.hint': 'The code is only needed on a new device — this one remembers your aquariums. Five digits from “Open on another screen” work too.',
      'home.pin.bad.title': 'Those digits did not fit',
      'home.pin.bad.text': 'A five-digit code lives for 5 minutes — it may have expired. Ask for a fresh one: “Open on another screen” → “TV code” on the phone.',
      'home.pin.many.title': 'Too many attempts',
      'home.pin.many.text': 'Wait a little and try again.',
      'home.bycode.placeholder': 'for example, mk4dp7wq2f',
      'home.bycode.open': 'Open',
      'home.how.title': 'How it works',
      'home.how.s0': 'Create an aquarium',
      'home.how.s1': 'Print a colouring sheet',
      'home.how.s2': 'Colour it with markers',
      'home.how.s3': 'Photograph it with a phone',
      'home.how.s4': 'Open on a big screen with a code',
      'home.how.demo': '🤖 Peek at a live aquarium',
      'home.how.demo.sub': 'a shared showcase — robots already moving',
      'home.card.kill': 'Remove aquarium',
      'home.card.empty': 'empty so far',
      'home.terms': 'Terms and data ↗',
      'terms.back': '← to the aquariums',
      'home.footer.important': 'Important.',
      'home.footer.text': ' No accounts: the code is for watching, the password is for managing, and this browser keeps both. Details — in the terms.',

      'home.create.title': 'New aquarium',
      'home.create.text': 'Give it a name so you can tell it apart in the list — your child’s name works well.',
      'home.create.value': 'Aquarium',
      'home.create.ok': 'Create',
      'home.created.title': 'Aquarium created',
      'home.created.text': 'The code opens the aquarium for watching, the password lets you manage it. Both are already saved on this device — they live in the aquarium menu, no need to write them down right now. Still, keep a copy somewhere: there is no email and no account here, so there is nowhere to recover them from.',
      'home.created.code': 'Aquarium code',
      'home.created.pass': 'Password',
      'home.created.ok': 'Saved, let’s go',
      'home.create.fail.title': 'Could not create the aquarium',
      'home.create.fail.text': 'The server is not responding. Check that node server.js is running.',
      'home.remove.title': 'Remove “{name}”?',
      'home.remove.text': 'From the list — the aquarium stays on the server, you can bring it back with the code {code}. For good — {what} move to the server’s bin, and the code stops working.',
      'home.remove.whatEmpty': 'the aquarium moves',
      'home.remove.cancel': 'Cancel',
      'home.remove.forget': 'Remove from my list',
      'home.remove.delete': 'Delete the aquarium for good',
      'home.remove.pass.title': 'Password for “{name}”',
      'home.remove.pass.text': 'Deleting an aquarium for good needs the password. Without it, just remove the aquarium from your list — it stays with its owner.',
      'home.badcode.title': 'That code does not fit',
      'home.badcode.text': 'An aquarium code is exactly 10 characters, letters and digits. Check whether one got lost.',

      'menu.tank': 'Aquarium',
      'menu.copied': 'link copied',
      'menu.pass': '🔑 password',
      'menu.pass.set': '🔓 set a password',
      'menu.pass.title': 'Aquarium password',
      'menu.rename.hint': 'Rename the aquarium',
      'menu.close': 'Close the menu',
      'menu.back': '← back',
      'menu.hint': 'tap anywhere — the menu will show up',
      'menu.capture.title': 'Photograph a robot',
      'menu.capture.sub': 'a coloured sheet comes alive in the aquarium',
      'menu.pack.title': 'Release a ready-made robot',
      'menu.pack.sub': 'from the set, no colouring needed',
      'menu.feed.title': 'Charge them',
      'menu.feed.sub': 'the robots will gather around the charger',
      'menu.print.title': 'Colouring sheets to print',
      'menu.print.sub': '12 kinds of robots on a plain A4 sheet',
      'menu.bg.title': 'Change the background',
      'menu.bg.sub': 'the picture the robots move against',
      'menu.fish.title': 'Remove robots',
      'menu.fish.sub': 'take the extra ones out of the aquarium',
      'menu.fish.sub.pass': 'take the extra ones out — password needed',
      'menu.home.title': 'My aquariums',
      'menu.home.sub': 'other aquariums — and starting a new one',
      'menu.picker.title': 'Who shall we release?',
      'menu.picker.sub': 'A robot from the set appears in the aquarium right away',
      'menu.picker.drawing': 'drawing…',
      'menu.picker.failed': 'did not work',
      'menu.picker.nopack': 'The set is not built — run tools\\convert-pack.ps1',
      'menu.rename.title': 'Aquarium name',
      'menu.rename.text': 'Only you see it — in the list of aquariums and in this page’s title.',
      'menu.rename.ok': 'Save',
      'menu.rename.fail': 'Renaming failed',
      'menu.access.title': 'Access to the aquarium',
      'menu.access.text': 'The code is for watching, the password is for managing. Both are saved in this browser — if you clear its data, there is nowhere to recover them from.',
      'menu.access.done': 'Done',
      'menu.access.change': 'Change the password',
      'menu.newpass.title': 'New aquarium password',
      'menu.newpass.first': 'Password for the aquarium',
      'menu.newpass.text': 'At least 4 characters. Digits are handier: they are easy to read out over the phone and to type on a TV remote. The old password stops working on every device.',
      'menu.newpass.ph': 'new password',
      'menu.newpass.short.title': 'Too short',
      'menu.newpass.short.text': 'Four characters at the very least.',
      'menu.newpass.saved.title': 'Password saved',
      'menu.newpass.saved.text': 'Write it down: there is nowhere to recover it from. The aquarium code has not changed — it still works for watching.',
      'menu.newpass.saved.field': 'New password',
      'menu.newpass.saved.ok': 'Written down',
      'menu.oldpass.title': 'Current password',
      'menu.oldpass.text': 'Only someone who knows the current password can change it.',
      'menu.fail.title': 'Did not work',
      'menu.fail.server': 'The server is not responding.',
      'menu.fail.pass': 'The server did not accept the password.',
      'menu.link.title': 'Link to the aquarium',
      'tank.doctitle': 'Aquarium',
      'tank.frame.print': 'Colouring sheets for printing',
      'tank.frame.bg': 'Aquarium background',
      'tank.frame.fish': 'Robots in the aquarium',
      'tank.frame.capture': 'Photographing a robot',
      'tank.crash': '<b>The scene did not start</b><br>{msg}',
      'menu.link.text': 'Could not copy it myself — take it from here. It opens the aquarium on any device.',
      'menu.link.ok': 'Done',
      'menu.share.title': 'Open on another screen',
      'menu.share.sub': 'QR and link: a TV, a tablet, another phone',
      'menu.share.hint': 'Point a phone camera here — the aquarium opens there',
      'menu.share.copy': 'Copy the link',
      'menu.share.copy.sub': 'send it to a messenger — and open it anywhere',
      'menu.share.send': 'Send the link…',
      'menu.share.send.sub': 'through whatever you usually share with',
      'menu.share.pin': 'TV code',
      'menu.share.pin.sub': 'five digits — easy to type with a remote',
      'menu.share.pin.text': 'Type these digits on the TV — on the home page, in the “Open an aquarium by code” field. The code lives for 5 minutes.',
      'menu.share.pin.fail': 'No code came — try again',
      'demo.title': '🫧 This is a showcase',
      'demo.text': 'A shared aquarium for a first look — the robots here belong to no one. Your own robots live in your own aquarium: starting one takes a second, and the sheets and shooting are there.',
      'demo.own': 'Start your own aquarium',
      'demo.own.sub': 'printing, shooting and your own robots live there',

      'tank.loading': 'Filling the aquarium…',
      'tank.nofish': 'no robots yet',
      'tank.notank': 'Aquarium not found — it may have been deleted, or the code has a typo.',
      'tank.tolist': 'To my aquariums →',
      'tank.noserver': 'The server is unreachable. Run <code>node server.js</code> and refresh the page.',
      'tank.nopick': 'No aquarium selected.',
      'tank.home': 'To the home page →',

      'cap.title': '🤖 Bring your robot to life!',
      'cap.sub': 'Colour the robot on the sheet, take a photo — and it will appear in the aquarium',
      'cap.back': '← to the aquarium',
      'cap.shoot': 'Photograph the sheet',
      'cap.hint': 'Put the sheet on a table so that all four black squares are in the frame',
      'cap.qr': 'Easier on a phone: point its camera at the code and the shooting opens there',
      'cap.searching': 'Looking for the robot in the photo…',
      'cap.reviving': 'the robot is coming alive…',
      'cap.release': 'Release into the aquarium! 🌊',
      'cap.retake': 'Retake',
      'cap.boost': 'Brighter colours',
      'cap.done': 'The robot has entered the aquarium!',
      'cap.done.sub': 'Look at the big screen — it is already there',
      'cap.done.sub.embed': 'Close this window — it is already moving',
      'cap.again': 'Photograph another one',
      'cap.retry': 'Try again',
      'cap.sending': 'The robot is heading to the aquarium…',
      'cap.err.manifest': 'manifest.json did not load — check that the server is running.',
      'cap.err.photo': 'Could not open the photo, try again.',
      'cap.itis': 'It’s a {name}!',
      'cap.photo': 'Your robot',
      'cap.err.nofish': 'The robot got lost — photograph the sheet again.',
      'cap.err.status': 'The server answered {code}',
      'cap.err.markers': 'Found {n} markers out of 4. Photograph the whole sheet, in good light and without glare — all four black squares have to be in the frame.',
      'cap.err.send': 'Sending failed: {msg}',

      'adm.doctitle': 'Aquarium — managing the robots',
      'adm.title': 'management',
      'adm.tank': 'Aquarium',
      'adm.capture': 'Camera',
      'adm.print': 'Colouring sheets',
      'adm.home': 'My aquariums',
      'adm.pass': 'Password:',
      'adm.pass.change': 'Change the password',
      'adm.pass.show': 'Show the password',
      'adm.bg': 'Aquarium background',
      'adm.bg.one': 'Background {n}',
      'adm.bg.own': 'Your own',
      'adm.bg.add': 'your own',
      'adm.bg.busy': 'uploading…',
      'adm.bg.del': 'Delete this background',
      'adm.bg.del.title': 'Delete the background?',
      'adm.bg.del.text': 'The file will be erased for good — unlike robots, no copy is kept.',
      'adm.bg.fail': 'The background did not upload',
      'adm.bg.err.read': 'could not read the file',
      'adm.bg.err.img': 'this is not a picture',
      'adm.fish.count': 'robots: {n}',
      'adm.fish.pack': 'from the set · ',
      'adm.fish.del': 'Delete',
      'adm.fish.del.title': 'Delete the robot?',
      'adm.fish.del.pack': 'It will leave the aquarium. You can release the same one again any time.',
      'adm.fish.del.painted': 'The drawing moves to the bin on the server — it can be brought back.',
      'adm.empty': 'No drawn robots in this aquarium yet.',
      'adm.empty.sub': 'Colour a sheet and photograph it with a phone — the “Camera” link is at the top.',
      'adm.clear': 'Delete all the robots',
      'adm.clear.title': 'Empty the aquarium?',
      'adm.clear.text': 'Every robot will leave — {n} of them. The drawings move to the bin on the server; they can be brought back, but they disappear from this list.',
      'adm.noserver': 'server unreachable — run node server.js',
      'adm.gate.title': '🔒 Management needs a password',
      'adm.gate.text': 'Watching the aquarium does not — the password is for changing the background, renaming and removing robots.',
      'adm.gate.ph': 'password',
      'adm.gate.enter': 'Enter',
      'adm.gate.back': '← to the aquarium',
      'adm.gate.bad': 'That password does not fit.',
      'adm.gate.old': 'The password is out of date — enter the new one.',
      'adm.gate.many': 'Too many attempts, wait a minute.',
      'adm.gate.wait': 'Too many attempts. Wait {n} s.',
      'adm.gate.noserver': 'The server is not responding.',
      'adm.gate.need': 'The aquarium password is needed.',

      'print.title': 'Colouring sheets — ready to print',
      'print.home': '← my aquariums',
      'print.all': 'Print all',
      'print.pdf': 'Download PDF',
      'print.pdf.file': 'aquarium-colouring-sheets.pdf',
      'print.one': 'Print this sheet',
      'print.note': 'Print on plain A4 in landscape at 100% scale (not “fit to page”) — the marker size matters for recognition. Do not colour the black squares in the corners!',
      'print.note2': 'No printer around? Download all sheets as one PDF (button up top) and send it wherever a printer lives. Meanwhile, release a ready-made robot from the menu.',
      'print.nomanifest': 'manifest.json did not load — check that the server is running.',

      'pass.ask.title': 'Aquarium password',
      'pass.ask.text': 'The password is only asked for managing. Watching the aquarium needs none.',
      'pass.ask.ph': 'for example, 481902',
      'pass.ask.ok': 'Enter',
      'pass.bad.title': 'That password does not fit',
      'pass.bad.text': 'Check the password — the one shown when the aquarium was created.',
      'pass.many.title': 'Too many attempts',
      'pass.many.text': 'Wait {n} s and try again.',
      'modal.cancel': 'Cancel',
      'modal.delete': 'Delete',
      'modal.ok': 'Got it',
      'modal.save': 'Save',
      'modal.copyHint': 'Click to copy',
      'modal.copied': 'copied'
    },

    pl: {
      'lang.name': 'Polski',

      'home.title': 'Moje akwaria',
      'home.lead': 'Wydrukuj szablon, pokoloruj mazakami, zrób zdjęcie — i robot ożyje. Każde dziecko może mieć własne akwarium.',
      'home.empty': 'Jeszcze żadnego akwarium. Załóż pierwsze — to chwila.',
      'home.new': 'Nowe akwarium',
      'home.bycode.title': 'Otwórz akwarium kodem',
      'home.bycode.hint': 'Kod przydaje się tylko na nowym urządzeniu — to zapamiętuje akwaria samo. Zadziała też pięć cyfr z „Otwórz na innym ekranie”.',
      'home.pin.bad.title': 'Te cyfry nie pasują',
      'home.pin.bad.text': 'Pięciocyfrowy kod żyje 5 minut — mógł wygasnąć. Poproś o nowy: „Otwórz na innym ekranie” → „Kod dla telewizora” na telefonie.',
      'home.pin.many.title': 'Za dużo prób',
      'home.pin.many.text': 'Odczekaj chwilę i spróbuj ponownie.',
      'home.bycode.placeholder': 'na przykład mk4dp7wq2f',
      'home.bycode.open': 'Otwórz',
      'home.how.title': 'Jak to działa',
      'home.how.s0': 'Załóż akwarium',
      'home.how.s1': 'Wydrukuj kolorowankę',
      'home.how.s2': 'Pokoloruj ją flamastrami',
      'home.how.s3': 'Sfotografuj telefonem',
      'home.how.s4': 'Otwórz na dużym ekranie kodem',
      'home.how.demo': '🤖 Zobacz żywe akwarium',
      'home.how.demo.sub': 'wspólna witryna — roboty już się ruszają',
      'home.card.kill': 'Usuń akwarium',
      'home.card.empty': 'na razie pusto',
      'home.terms': 'Zasady i dane ↗',
      'terms.back': '← do akwariów',
      'home.footer.important': 'Ważne.',
      'home.footer.text': ' Nie ma kont: kodem się ogląda, hasłem zarządza, a oba trzyma ta przeglądarka. Szczegóły — w zasadach.',

      'home.create.title': 'Nowe akwarium',
      'home.create.text': 'Nazwij je, żeby odróżnić na liście — na przykład imieniem dziecka.',
      'home.create.value': 'Akwarium',
      'home.create.ok': 'Utwórz',
      'home.created.title': 'Akwarium utworzone',
      'home.created.text': 'Kodem otwiera się akwarium do oglądania, hasłem się nim zarządza. Na tym urządzeniu oba są już zapisane — znajdziesz je w menu akwarium, nie musisz ich teraz notować. Ale gdzieś je zachowaj: nie ma tu poczty ani konta, więc nie będzie skąd ich odzyskać.',
      'home.created.code': 'Kod akwarium',
      'home.created.pass': 'Hasło',
      'home.created.ok': 'Zapisane, jedziemy',
      'home.create.fail.title': 'Nie udało się utworzyć akwarium',
      'home.create.fail.text': 'Serwer nie odpowiada. Sprawdź, czy działa node server.js.',
      'home.remove.title': 'Usunąć „{name}”?',
      'home.remove.text': 'Z listy — akwarium zostaje na serwerze, wrócisz do niego kodem {code}. Całkiem — {what} trafią do kosza na serwerze, a kod przestanie działać.',
      'home.remove.whatEmpty': 'akwarium trafi',
      'home.remove.cancel': 'Anuluj',
      'home.remove.forget': 'Usuń z mojej listy',
      'home.remove.delete': 'Usuń akwarium całkiem',
      'home.remove.pass.title': 'Hasło do „{name}”',
      'home.remove.pass.text': 'Usunięcie akwarium całkiem wymaga hasła. Jeśli go nie masz — usuń akwarium ze swojej listy, u właściciela zostanie.',
      'home.badcode.title': 'Ten kod nie pasuje',
      'home.badcode.text': 'Kod akwarium ma dokładnie 10 znaków, litery i cyfry. Sprawdź, czy któryś nie zginął.',

      'menu.tank': 'Akwarium',
      'menu.copied': 'link skopiowany',
      'menu.pass': '🔑 hasło',
      'menu.pass.set': '🔓 ustaw hasło',
      'menu.pass.title': 'Hasło akwarium',
      'menu.rename.hint': 'Zmień nazwę akwarium',
      'menu.close': 'Zamknij menu',
      'menu.back': '← wstecz',
      'menu.hint': 'kliknij w dowolnym miejscu — pokażę menu',
      'menu.capture.title': 'Sfotografuj robota',
      'menu.capture.sub': 'pokolorowana kartka ożywa w akwarium',
      'menu.pack.title': 'Wypuść gotowego robota',
      'menu.pack.sub': 'z zestawu, bez kolorowania',
      'menu.feed.title': 'Naładuj',
      'menu.feed.sub': 'roboty zbiorą się przy ładowarce',
      'menu.print.title': 'Kolorowanki do druku',
      'menu.print.sub': '12 rodzajów robotów na zwykłej kartce A4',
      'menu.bg.title': 'Zmień tło',
      'menu.bg.sub': 'obrazek, na tle którego poruszają się roboty',
      'menu.fish.title': 'Usuń roboty',
      'menu.fish.sub': 'wyjmij zbędne z akwarium',
      'menu.fish.sub.pass': 'wyjmij zbędne — potrzebne hasło',
      'menu.home.title': 'Moje akwaria',
      'menu.home.sub': 'inne akwaria — i założenie nowego',
      'menu.picker.title': 'Kogo wypuszczamy?',
      'menu.picker.sub': 'Robot z zestawu pojawi się w akwarium od razu',
      'menu.picker.drawing': 'rysuję…',
      'menu.picker.failed': 'nie wyszło',
      'menu.picker.nopack': 'Zestaw nie jest zbudowany — uruchom tools\\convert-pack.ps1',
      'menu.rename.title': 'Nazwa akwarium',
      'menu.rename.text': 'Widzisz ją tylko ty — na liście akwariów i w tytule tej strony.',
      'menu.rename.ok': 'Zapisz',
      'menu.rename.fail': 'Nie udało się zmienić nazwy',
      'menu.access.title': 'Dostęp do akwarium',
      'menu.access.text': 'Kodem się ogląda, hasłem zarządza. Oba są zapisane w tej przeglądarce — po wyczyszczeniu jej danych nie ma skąd ich odzyskać.',
      'menu.access.done': 'Gotowe',
      'menu.access.change': 'Zmień hasło',
      'menu.newpass.title': 'Nowe hasło akwarium',
      'menu.newpass.first': 'Hasło do akwarium',
      'menu.newpass.text': 'Co najmniej 4 znaki. Cyfry są wygodniejsze: łatwo je podyktować przez telefon i wpisać pilotem. Stare hasło przestanie działać na wszystkich urządzeniach.',
      'menu.newpass.ph': 'nowe hasło',
      'menu.newpass.short.title': 'Za krótkie',
      'menu.newpass.short.text': 'Potrzebne są co najmniej cztery znaki.',
      'menu.newpass.saved.title': 'Hasło zapisane',
      'menu.newpass.saved.text': 'Zapisz je sobie: nie ma skąd go odzyskać. Kod akwarium się nie zmienił — nadal służy do oglądania.',
      'menu.newpass.saved.field': 'Nowe hasło',
      'menu.newpass.saved.ok': 'Zapisałem',
      'menu.oldpass.title': 'Stare hasło',
      'menu.oldpass.text': 'Hasło zmienia ten, kto zna obecne.',
      'menu.fail.title': 'Nie wyszło',
      'menu.fail.server': 'Serwer nie odpowiada.',
      'menu.fail.pass': 'Serwer nie przyjął hasła.',
      'menu.link.title': 'Link do akwarium',
      'tank.doctitle': 'Akwarium',
      'tank.frame.print': 'Kolorowanki do druku',
      'tank.frame.bg': 'Tło akwarium',
      'tank.frame.fish': 'Roboty w akwarium',
      'tank.frame.capture': 'Zdjęcie robota',
      'tank.crash': '<b>Scena się nie uruchomiła</b><br>{msg}',
      'menu.link.text': 'Sam nie zdołałem skopiować — weź stąd. Otworzy akwarium na dowolnym urządzeniu.',
      'menu.link.ok': 'Gotowe',
      'menu.share.title': 'Otwórz na innym ekranie',
      'menu.share.sub': 'QR i link: telewizor, tablet, drugi telefon',
      'menu.share.hint': 'Skieruj aparat telefonu — akwarium otworzy się tam',
      'menu.share.copy': 'Skopiuj link',
      'menu.share.copy.sub': 'wyślij go do komunikatora — i otwórz gdzie chcesz',
      'menu.share.send': 'Wyślij link…',
      'menu.share.send.sub': 'przez to, czym zwykle się dzielisz',
      'menu.share.pin': 'Kod dla telewizora',
      'menu.share.pin.sub': 'pięć cyfr — łatwo wpisać pilotem',
      'menu.share.pin.text': 'Wpisz te cyfry na telewizorze — na stronie głównej, w polu „Otwórz akwarium kodem”. Kod żyje 5 minut.',
      'menu.share.pin.fail': 'Kod się nie wydał — spróbuj jeszcze raz',
      'demo.title': '🫧 To witryna',
      'demo.text': 'Wspólne akwarium na pierwszy rzut oka — te roboty są niczyje. Własne roboty mieszkają we własnym akwarium: założenie go to sekunda, a kolorowanki i zdjęcia są tam.',
      'demo.own': 'Załóż własne akwarium',
      'demo.own.sub': 'druk, zdjęcia i własne roboty — tam',

      'tank.loading': 'Napełniam akwarium…',
      'tank.nofish': 'jeszcze bez robotów',
      'tank.notank': 'Nie znaleziono akwarium — mogło zostać usunięte albo w kodzie jest literówka.',
      'tank.tolist': 'Do moich akwariów →',
      'tank.noserver': 'Serwer niedostępny. Uruchom <code>node server.js</code> i odśwież stronę.',
      'tank.nopick': 'Nie wybrano akwarium.',
      'tank.home': 'Na stronę główną →',

      'cap.title': '🤖 Ożyw swojego robota!',
      'cap.sub': 'Pokoloruj robota na kartce, zrób zdjęcie — a pojawi się w akwarium',
      'cap.back': '← do akwarium',
      'cap.shoot': 'Sfotografuj kartkę',
      'cap.hint': 'Połóż kartkę na stole tak, żeby wszystkie cztery czarne kwadraty były w kadrze',
      'cap.qr': 'Wygodniej telefonem: skieruj aparat na kod, a zdjęcie zrobisz tam',
      'cap.searching': 'Szukam robota na zdjęciu…',
      'cap.reviving': 'robot ożywa…',
      'cap.release': 'Wypuść do akwarium! 🌊',
      'cap.retake': 'Zrób jeszcze raz',
      'cap.boost': 'Żywsze kolory',
      'cap.done': 'Robot trafił do akwarium!',
      'cap.done.sub': 'Spójrz na duży ekran — już tam jest',
      'cap.done.sub.embed': 'Zamknij okno — już się rusza',
      'cap.again': 'Sfotografuj następną',
      'cap.retry': 'Spróbuj jeszcze raz',
      'cap.sending': 'Robot zmierza do akwarium…',
      'cap.err.manifest': 'Nie wczytał się manifest.json — sprawdź, czy serwer działa.',
      'cap.err.photo': 'Nie udało się otworzyć zdjęcia, spróbuj jeszcze raz.',
      'cap.itis': 'To {name}!',
      'cap.photo': 'Twój robot',
      'cap.err.nofish': 'Robot się zgubił — zrób zdjęcie kartki jeszcze raz.',
      'cap.err.status': 'Serwer odpowiedział {code}',
      'cap.err.markers': 'Znalazłem {n} znaczniki z 4. Sfotografuj całą kartkę, przy dobrym świetle i bez odblasków — wszystkie cztery czarne kwadraty muszą być w kadrze.',
      'cap.err.send': 'Nie udało się wysłać: {msg}',

      'adm.doctitle': 'Akwarium — zarządzanie robotami',
      'adm.title': 'zarządzanie',
      'adm.tank': 'Akwarium',
      'adm.capture': 'Aparat',
      'adm.print': 'Kolorowanki',
      'adm.home': 'Moje akwaria',
      'adm.pass': 'Hasło:',
      'adm.pass.change': 'Zmień hasło',
      'adm.pass.show': 'Pokaż hasło',
      'adm.bg': 'Tło akwarium',
      'adm.bg.one': 'Tło {n}',
      'adm.bg.own': 'Własne tło',
      'adm.bg.add': 'własne tło',
      'adm.bg.busy': 'wysyłam…',
      'adm.bg.del': 'Usuń to tło',
      'adm.bg.del.title': 'Usunąć tło?',
      'adm.bg.del.text': 'Plik zostanie skasowany bezpowrotnie — w odróżnieniu od robotów kopia nie zostaje.',
      'adm.bg.fail': 'Tło się nie wgrało',
      'adm.bg.err.read': 'nie udało się odczytać pliku',
      'adm.bg.err.img': 'to nie jest obrazek',
      'adm.fish.count': 'robotów: {n}',
      'adm.fish.pack': 'z zestawu · ',
      'adm.fish.del': 'Usuń',
      'adm.fish.del.title': 'Usunąć robota?',
      'adm.fish.del.pack': 'Odejdzie z akwarium. Takiego samego możesz wypuścić w każdej chwili.',
      'adm.fish.del.painted': 'Rysunek trafi do kosza na serwerze — w razie czego można go przywrócić.',
      'adm.empty': 'W akwarium nie ma jeszcze narysowanych robotów.',
      'adm.empty.sub': 'Pokoloruj kartkę i zrób jej zdjęcie telefonem — link „Aparat” na górze.',
      'adm.clear': 'Usuń wszystkie roboty',
      'adm.clear.title': 'Opróżnić akwarium?',
      'adm.clear.text': 'Odejdą wszystkie roboty — {n} szt. Rysunki trafią do kosza na serwerze, można je przywrócić, ale z listy znikną.',
      'adm.noserver': 'serwer niedostępny — uruchom node server.js',
      'adm.gate.title': '🔒 Zarządzanie na hasło',
      'adm.gate.text': 'Oglądać akwarium można bez hasła — jest ono potrzebne do zmiany tła, nazwy i usuwania robotów.',
      'adm.gate.ph': 'hasło',
      'adm.gate.enter': 'Wejdź',
      'adm.gate.back': '← do akwarium',
      'adm.gate.bad': 'Hasło nie pasuje.',
      'adm.gate.old': 'Hasło jest nieaktualne — wpisz nowe.',
      'adm.gate.many': 'Za dużo prób, poczekaj minutę.',
      'adm.gate.wait': 'Za dużo prób. Poczekaj {n} s.',
      'adm.gate.noserver': 'Serwer nie odpowiada.',
      'adm.gate.need': 'Potrzebne jest hasło akwarium.',

      'print.title': 'Kolorowanki — szablony do druku',
      'print.home': '← moje akwaria',
      'print.all': 'Drukuj wszystkie',
      'print.pdf': 'Pobierz PDF',
      'print.pdf.file': 'kolorowanki-akwarium.pdf',
      'print.one': 'Drukuj tę kartkę',
      'print.note': 'Drukuj na zwykłym A4 poziomo, w skali 100% (bez „dopasuj do strony”) — rozmiar znaczników jest ważny dla rozpoznawania. Czarnych kwadratów w rogach nie kolorujemy!',
      'print.note2': 'Nie ma drukarki pod ręką? Pobierz wszystkie kartki jednym plikiem PDF (przycisk u góry) i wyślij tam, gdzie drukarka jest. A na razie wypuść z menu gotowego robota.',
      'print.nomanifest': 'Nie wczytał się manifest.json — sprawdź, czy serwer działa.',

      'pass.ask.title': 'Hasło akwarium',
      'pass.ask.text': 'Hasło jest potrzebne tylko do zarządzania. Oglądać można bez niego.',
      'pass.ask.ph': 'na przykład 481902',
      'pass.ask.ok': 'Wejdź',
      'pass.bad.title': 'Hasło nie pasuje',
      'pass.bad.text': 'Sprawdź hasło — to pokazane przy tworzeniu akwarium.',
      'pass.many.title': 'Za dużo prób',
      'pass.many.text': 'Poczekaj {n} s i spróbuj ponownie.',
      'modal.cancel': 'Anuluj',
      'modal.delete': 'Usuń',
      'modal.ok': 'Jasne',
      'modal.save': 'Zapisz',
      'modal.copyHint': 'Kliknij, żeby skopiować',
      'modal.copied': 'skopiowano'
    }
  };

  // Множественное число. В русском и польском три формы, в английском две.
  // Считаем сами: Intl.PluralRules есть не везде, где эта игра запускается,
  // а правил тут всего два языка.
  var PLURALS = {
    ru: { fish: ['робот', 'робота', 'роботов'] },
    pl: { fish: ['robot', 'roboty', 'robotów'] },
    en: { fish: ['robot', 'robots', 'robots'] }
  };

  function pluralIndex(lang, n) {
    if (lang === 'en') return n === 1 ? 0 : 1;
    // русский и польский: 1 — одна, 2–4 — две, остальное — много
    var t = n % 10, h = n % 100;
    if (t === 1 && h !== 11) return 0;
    if (t >= 2 && t <= 4 && (h < 12 || h > 14)) return 1;
    return 2;
  }

  function pick() {
    var saved;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* приватный режим */ }
    if (saved && DICT[saved]) return saved;

    // Настройки устройства: ru-RU → русский, pl-PL → польский, остальное —
    // английский как язык по умолчанию для всех прочих.
    var list = (navigator.languages && navigator.languages.length)
      ? navigator.languages : [navigator.language || 'en'];
    for (var i = 0; i < list.length; i++) {
      var code = String(list[i]).slice(0, 2).toLowerCase();
      if (DICT[code]) return code;
      if (code === 'be' || code === 'uk' || code === 'kk') return 'ru';   // соседи по алфавиту
    }
    return 'en';
  }

  var lang = pick();

  function t(key, vars) {
    var s = (DICT[lang] && DICT[lang][key]) || DICT.ru[key] || key;
    if (!vars) return s;
    return s.replace(/\{(\w+)\}/g, function (m, name) {
      return vars[name] === undefined ? m : vars[name];
    });
  }

  function plural(n, what) {
    var forms = (PLURALS[lang] || PLURALS.ru)[what];
    return n + ' ' + forms[pluralIndex(lang, n)];
  }

  function apply(root) {
    root = root || document;
    root.querySelectorAll('[data-t]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-t'));
    });
    root.querySelectorAll('[data-t-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-t-html'));
    });
    root.querySelectorAll('[data-t-ph]').forEach(function (el) {
      el.placeholder = t(el.getAttribute('data-t-ph'));
    });
    root.querySelectorAll('[data-t-title]').forEach(function (el) {
      el.title = t(el.getAttribute('data-t-title'));
    });
    root.querySelectorAll('[data-t-alt]').forEach(function (el) {
      el.alt = t(el.getAttribute('data-t-alt'));
    });
    if (document.documentElement) document.documentElement.lang = lang;
  }

  function set(next) {
    if (!DICT[next] || next === lang) return;
    lang = next;
    try { localStorage.setItem(KEY, next); } catch (e) { /* приватный режим */ }
    apply(document);
    window.dispatchEvent(new CustomEvent('aqua:lang', { detail: next }));
  }

  // Переключатель: три коротких кнопки. Место занимает мало, а объяснять
  // ничего не надо — RU EN PL читается на любом из трёх языков.
  function mount(host) {
    if (!host) return null;
    host.classList.add('langpick');
    host.textContent = '';
    LANGS.forEach(function (code) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = code.toUpperCase();
      b.title = DICT[code]['lang.name'];
      b.dataset.lang = code;
      b.setAttribute('aria-pressed', code === lang ? 'true' : 'false');
      b.onclick = function () { set(code); };
      host.appendChild(b);
    });
    var paint = function () {
      host.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false');
      });
    };
    window.addEventListener('aqua:lang', paint);
    return host;
  }

  // Соседние вкладки и врезки внутри меню аквариума: язык поменяли в одном
  // месте — меняется везде, где открыт тот же сайт.
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY || !e.newValue || e.newValue === lang) return;
    lang = e.newValue;
    apply(document);
    window.dispatchEvent(new CustomEvent('aqua:lang', { detail: lang }));
  });

  window.I18N = {
    get lang() { return lang; },
    t: t,
    plural: plural,
    apply: apply,
    set: set,
    mount: mount,
    langs: LANGS
  };

  // Раскладываем переводы, как только разметка готова.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { apply(document); });
  } else {
    apply(document);
  }
})();
