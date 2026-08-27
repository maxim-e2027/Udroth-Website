# Dhinia Font — Calligraphr Workflow

Готовые глифы для сборки шрифта **Dhinia** через [calligraphr.com](https://calligraphr.com).

## Структура

```
fonts/dhinia/
  glyphs/            ← 26 PNG, по одному на букву a-z (1000×1000, белый фон, чёрный глиф)
  source/
    _contact_sheet.png  ← контакт-лист всех 26 для быстрого ревью
    boxes.json          ← координаты исходных боксов в DhinicSacredFont.jpg (для перенарезки если надо)
  README.md          ← этот файл
```

## Как собрать .ttf в Calligraphr

1. Зарегистрироваться на https://www.calligraphr.com (бесплатный тариф вмещает 26 латинских букв).
2. **Templates → My Templates → Create a new template** → выбрать набор «Minimal English» (только a–z).
3. Скачать template PDF.
4. **Не печатать** — вместо этого: **Templates → Upload Template → выбрать «Upload Individual Glyphs»**.
5. Залить файлы из `glyphs/` (a.png … z.png). Calligraphr сопоставит имя файла с буквой автоматически.
6. **Build Font**: дать имя `Dhinia`, нажать Build.
7. Скачать `.ttf` (можно сразу с baseline-настройкой).

## Что проверить перед загрузкой

- Глиф `a` — у меня потерялся нижний «foot serif» при чистке от латинской подписи. В Calligraphr можно дорисовать (его редактор поддерживает добавление штрихов) или принять как есть.
- В остальных 25 глифах визуально чисто. Если заметишь артефакт — открой соответствующий `glyphs/<буква>.png` и удалили лишнее в Photoshop / Preview / online editor.

## Перенарезка с нуля

Если захочешь перерезать с другими параметрами:
- Исходник: `/Users/maximus/Documents/Claude/Projects/Worldbuilding/DhinicSacredFont.jpg`
- Скрипт нарезки в истории Claude-сессии 2026-05-24 (можно восстановить).

## Что дальше

Когда `.ttf` готов:
1. Положить файл сюда же — `fonts/dhinia/Dhinia-Regular.ttf`
2. Сконвертировать в `.woff2` (через https://cloudconvert.com или fonttools)
3. Положить .woff2 в `public/fonts/`
4. Claude добавит `@font-face` в `src/layouts/Base.astro` и блок «Writing system» на статью **Dhinaem**.
