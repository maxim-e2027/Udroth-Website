# SITE-CONTEXT.md — Контекст проекта Udroth Website

> **Для Claude:** читай этот файл в начале каждой сессии по работе над сайтом.
> Также читай `~/Documents/Claude/Projects/Worldbuilding/WorldbuildingContext.md` для лора мира.

---

## Что это за проект

Сайт-архив фэнтези-мира **Udroth** (также Wyrmsland). Публикуется как коллекция внутримировых документов — текстов, карт, артефактов — через которые читатель реконструирует мир. С 2026-05 добавлен слой **энциклопедии**: meta-статьи (внешний голос, не in-world), привязанные к фасетам и тегам артефактов.

Пользователь: **Alexey** (dpushok@gmail.com). Пишет по-русски. Не разработчик, понимает суть технических решений. Задавай вопросы по одному, предлагай варианты кнопками.

---

## Технический стек

| Что | Как |
|---|---|
| Фреймворк | **Astro v5** (static site generator) |
| Контент | Content Collections + Zod-схемы (`src/content.config.ts`) |
| Wikilinks | `remark-wiki-link` — `[[Name]]` → ссылка через `/wiki/<slug>` |
| Шрифты | Google Fonts: **Cinzel** (заголовки) + **Lora** (текст) |
| Деплой | Cloudflare (git-интеграция, автодеплой по push в main) |
| Домен | `udroth.net` (зарегистрирован, подключён через Cloudflare) |
| Dev | `npm run dev` → `localhost:4321` |
| Build | `npm run build` |

---

## Папки проекта

```
Udroth-Website/           ← корень (~/Documents/Udroth-Website)
  Templates/              ← Obsidian-шаблоны: Text, Image, Author, Article
  Texts/                  ← внутримировые документы (text collection)
  Images/                 ← карты, иллюстрации (image collection)
  Authors/                ← авторы текстов (author collection)
  Articles/               ← энциклопедия (article collection)
    Geography/            ← place + бывшие Locations
    Theology/             ← religion
    Ethnography/          ← culture
    History/              ← era + politics
    Themes/               ← свободные tags
  assets/                 ← исходники изображений
  public/assets/          ← копия для веб-сервера
  Raw/                    ← черновики, не публикуются
  src/
    layouts/Base.astro    ← layout: шапка, нав, стили
    components/
      FacetChips.astro    ← рендер wikilink-фасета как ссылок на статьи
    lib/
      wikilinks.ts        ← parseWikilink, articleHref, backreferences
    pages/
      index.astro
      texts/index.astro
      texts/[...slug].astro
      gallery/index.astro
      gallery/[...slug].astro
      authors/index.astro
      encyclopedia/index.astro                  ← 5 категорий
      encyclopedia/[category]/index.astro       ← список статей категории
      encyclopedia/[category]/[slug].astro      ← страница статьи
      wiki/[slug].astro                         ← резолвер для [[body wikilinks]]
    content.config.ts
  astro.config.mjs
  HOW-TO-ADD-CONTENT.md
  SITE-CONTEXT.md
  BUILD.md
```

---

## Дизайн-решения (закрыты, не переспрашивать)

| Параметр | Решение |
|---|---|
| Визуальный стиль | Музейность — Google Arts & Culture как ориентир |
| Голос артефактов | Внутримировой (Text/Image — это сами документы) |
| Голос энциклопедии | Meta — внешний справочник, нейтральный тон |
| Палитра | Пергамент и сепия |
| Приоритет устройств | Desktop-first |
| Язык сайта | Только английский |
| Публикация | Ручная (git push) |

### CSS-переменные (палитра)
```css
--bg:          #f5ecd7
--bg-dark:     #e8dcc6
--text:        #3a2e1f
--text-muted:  #7a6b57
--accent:      #8b5e34
--accent-dark: #6b4423
--border:      #c9b896
--card-bg:     #faf3e3
```

### Типографика
- Заголовки: **Cinzel**, serif, uppercase, letter-spacing
- Текст: **Lora**, serif, line-height 1.7
- Базовый размер: 18px

### Layout
- Контент: `width: 90%`, `max-width: 1600px`, центрирован
- Адаптивность: 93% на планшете (<1024px), 96% на телефоне (<600px)
- Шапка: sticky
- На страницах текстов в шапке "Reading: [название]"

---

## Схема frontmatter

### Wikilinks в фасетах (новое)

Все фасеты в Text/Image и `era`/`culture` в Author — **массивы wikilinks** вида `["[[Article Name]]"]`. Zod валидирует формат на этапе билда. Каждый wikilink должен указывать на статью в `Articles/` соответствующей категории, иначе чип рендерится как `tag-unresolved` (полупрозрачным).

### Маппинг фасет → категория статьи

| Поле | Категория |
|---|---|
| `place` | geography |
| `religion` | theology |
| `culture` | ethnography |
| `era`, `politics` | history |
| `tags` | themes |

### Text
```yaml
title: ""
type: text
subtype: ""               # story | legend | chronicle | myth | letter | manifesto | proclamation | speech
author: "[[Author Name]]" # wikilink, не массив (один автор)
excerpt: ""
date_in_world: ""
place:    ["[[...]]"]
era:      ["[[...]]"]     # стал массивом
culture:  ["[[...]]"]
politics: ["[[...]]"]
religion: ["[[...]]"]
tags:     ["[[...]]"]     # стал массивом wikilinks (= статьи Themes)
related_images: ["[[Image-Slug]]"]
publish: false
```

### Image
```yaml
title: ""
type: image
subtype: ""               # map | illustration | artifact | portrait | scene | symbol
image_file: ""
caption: ""
place / era / culture / politics / religion / tags: массивы wikilinks
related_texts: ["[[Text-Slug]]"]
publish: false
```

### Author
```yaml
title: ""
type: author
era: ["[[Age of ...]]"]    # стал массивом wikilinks
culture: ["[[...]]"]
description: ""
portrait: ""
publish: false
```

### Article
```yaml
title: ""                   # точно как в wikilink
type: article
category: ""                # geography | theology | ethnography | history | themes
summary: ""                 # 1-2 предложения
related_articles: ["[[Other Article]]"]
publish: false
```

Тип `Location` удалён — Geography-статьи играют его роль.

---

## Текущий контент

_Актуализировано 2026-08-29, вторая правка того же дня (наполнение по списку Alexey)._

**Тексты (5):** Proclamation-of-the-Third-Aethliri-Empire, Address-to-Debke-Wadam-Garrison, Unified-Magic-a-Manifesto, Among-the-Moles, Foundations-of-Metatheology.

**Изображения (15):** Udroth-Complete-Map, Dhinaem-Map, Izbred-Map, Kilruzutar-Map, Urandayed-Map, AalyranShrine, ExarchSunstone, HeroShrine, HolyVale, IgninomiconArazymar, IgninomiconMzurabil, IgninomiconUran, IgninomiconYrdhuna, IgninomiconZunarydh, IgniomiconZaymarub.

**Авторы (5):** Öraethin of Izbred, Öthenar Maelorith, Unified Magic Society of Udroth, Dhumman Garnkfel, Udvaz Mzurab-Nazbar.

**Статьи (48, все publish: true). Написано — 5, пустых stub-ов — 43:**
- Geography (14): Dhinaem ✓, Great River ✓, Kilruzurtar ✓, Aethlirin ✓, Debkemewd, Hildrend, Ranga, Izbred, Kwod, Arwadek, Urandayed, Photoflora, Pyroflora, Caligoflora
- Theology (14): Dhinism, Uranism, Aradh Cults, Metatheology, Izbredic Hero Cult, Kolmwadh Cult, Kilruz Faiths (переим. из Goblin Faiths), Syncretic Faiths (переим. из Syncretic Teachings), Old Gods (= Uran's Court), The Stars (= Dhin's Court), Aradh (демоны — отдельно от Aradh Cults, культа вокруг них), The Heroes, Kilruz Prophets, Miscellaneous Spirits
- Ethnography (4): Yanadr ✓ (содержит все ветви — Uranic/Izbredic Yanadr и Dirrha — как подразделы одной статьи, не отдельные статьи), Aethlir, Kilruz, Kwoden
- History (14): Age of Chaos, Age of Creation, Age of History, Aethliri Empire, First Aethliri Empire, Second Aethliri Empire, Third Aethliri Empire, Shaethliri Empire, Exarchate of Nemerwod, Exarchate of Koldwealm, Urmyzhar Empire, Urandayedic Confederation, The Great Sealing, Zurkan Invasions
- Themes (2): Magic, Regional Map — 13 из старых 15 удалены (были типологией артефакта, не концептами мира)

Все обратные ссылки (facet/tag wikilinks) резолвятся — 0 битых на 2026-08-29.

---

## Следующие задачи (открытые)

1. **Наполнение статей** — 28 из 33 stub-ов пусты (список — выше). В `~/Documents/Claude/Projects/Worldbuilding/` есть неиспользованные источники: `WorldbuildingContext.md` (регионы, народы, космология, история) и два docx — `History of Urmyzhar Empire.docx`, `Peoples of Dhinaem.docx` — можно опираться на них вместо придумывания с нуля.
2. **Поиск и фильтры** — на сайте нет ни полнотекстового поиска, ни фильтров по фасетам (`texts/index.astro`, `gallery/index.astro` — статичные сетки без JS). План: Pagefind для полнотекстового поиска + UI-чипсы по существующим фасетам + новое поле `date_added` во frontmatter для сортировки по новизне (обсуждено с Alexey 2026-08-29).
3. **Кастомные шрифты** — резьба по камню, чеканка по металлу, граффити. Calligraphr → FontForge.
4. **Раздел Geography** — интерактивная карта-хаб (SVG или Leaflet) поверх существующих Geography-статей.
5. **Продвижение** — SEO-база (sitemap, OG-теги) готова; см. чек-лист сообществ для публикации.
6. **Favicon и 404-страница** — оба отсутствуют в `public/`.
7. **Приватная аналитика** — отложено намеренно, вернуться позже.

---

## Правила работы над кодом

- Лор мира — **канон**. Не изменяй имена, события, теологию без явного разрешения.
- Не придумывай новые имена собственные.
- Перед правкой кода — читай файл, не редактируй вслепую.
- При добавлении изображений — файл нужен в **двух местах**: `assets/` и `public/assets/`.
- `publish: false` по умолчанию — материалы не появятся пока явно не поставить `true`.
- Wikilinks `[[Name]]` в фасетах и tags — имя должно совпадать с `title` статьи в `Articles/`.
- Wikilinks в теле markdown работают через `/wiki/<slug>` и резолвятся в любую коллекцию.
