# Как добавлять контент на сайт Udroth

---

## Четыре типа контента

- **Text** (`Texts/`) — внутримировой документ: проповедь, манифест, хроника
- **Image** (`Images/`) — карта, иллюстрация, артефакт (метаданные к JPG/PNG)
- **Author** (`Authors/`) — автор текста, реальный или коллективный
- **Article** (`Articles/`) — meta-статья энциклопедии (внешний голос, не in-world)

---

## Добавить статью энциклопедии

1. Скопируй `Templates/Article.md` → сохрани в `Articles/<Категория>/Название.md`
2. Категории: `Geography / Theology / Ethnography / History / Themes`
3. Заполни frontmatter:
   - `title` — точно как пишется в wikilink-ах из текстов/карт
   - `category` — одно из: `geography | theology | ethnography | history | themes`
   - `summary` — 1-2 предложения, показывается в списке и в заголовке
   - `related_articles: ["[[Other Article]]"]` — перекрёстные ссылки
   - `publish: true`
4. Тело — meta-голос, нейтральный справочник (не in-world)

**Соответствие фасетов и категорий:**

| Где используется | Категория |
|---|---|
| `place` (в Text/Image) | Geography |
| `religion` | Theology |
| `culture` | Ethnography |
| `era`, `politics` | History |
| `tags` | Themes |

---

## Добавить текст

1. Скопируй `Templates/Text.md` → сохрани в `Texts/Название-текста.md`
2. Заполни frontmatter:
   - `title` — название
   - `subtype` — жанр: `story | legend | chronicle | myth | letter | manifesto | proclamation | speech`
   - `author: "[[Имя автора]]"` (должен существовать в `Authors/`)
   - `excerpt` — 1-2 предложения для карточки
   - `date_in_world` — например `"733 Age of History"`. Допустимые формы: `"226 Age of Chaos"`, `"c. 226 Age of Chaos"` (примерно), `"Age of Chaos"` (только эпоха), `"Unknown"`. Эпохи по порядку: Age of Creation → Age of History → Age of Chaos, год в каждой начинается с 1. Другой формат — билд упадёт с понятной ошибкой.
   - `date_added` — дата загрузки на сайт, `2026-10-13` (без кавычек). По ней работает сортировка «новые сверху» и фильтр «Uploaded»
   - `place`, `era`, `culture`, `politics`, `religion` — все **массивы wikilinks** `["[[Aethlir]]"]`
   - `tags` — тоже массив wikilinks (теперь = ссылки на статьи Themes)
   - `related_images: ["[[Image-Slug]]"]`
   - `publish: true`
3. После frontmatter пиши текст в Markdown. Можно ссылаться на статьи: `[[Aethlir]]` в теле текста → ссылка на энциклопедию.

**Правило:** каждый wikilink в фасетах и tags должен соответствовать статье в `Articles/`. Если статьи нет — её нужно создать (можно сначала пустой stub с `publish: false`).

---

## Добавить изображение

1. Положи файл в `assets/` (в `public/assets/` он скопируется сам при `npm run dev` / `npm run build`)
   - Скрипт `npm run gen-thumbs` (нужен Python + Pillow: `pip3 install Pillow`) создаёт из оригинала две облегчённые копии: `assets/thumbs/` (600 px, карточки галереи) и `assets/display/` (до 2400 px, картинка на странице изображения). Оригинал не меняется — на странице есть ссылка «Open full resolution».
   - Если копий нет, страница просто покажет оригинал (работает, но тяжёлые карты грузятся медленно). Сгенерированные копии надо закоммитить вместе с оригиналом.
2. Скопируй `Templates/Image.md` → сохрани в `Images/Название.md`
3. Заполни frontmatter:
   - `title`, `subtype` — строго одно из: `map | artifact | book page | illustration | portrait | scene | symbol` (список задаётся в `src/lib/archive.ts`, новый тип добавлять туда)
   - `date_added` — дата загрузки на сайт, `2026-10-13`
   - `image_file` — имя файла из `assets/`
   - `caption` — подпись
   - 5 фасетов + `tags` — массивы wikilinks (как в Text)
   - `related_texts: ["[[Text-Slug]]"]`
   - `publish: true`

---

## Добавить автора

1. Скопируй `Templates/Author.md` → сохрани в `Authors/Имя-Автора.md`
2. Заполни frontmatter:
   - `title` — полное имя (то же, что в `author:` текста)
   - `era`, `culture` — массивы wikilinks на статьи энциклопедии
   - `description` — 1-3 предложения
   - `portrait` — опционально, файл из `assets/`
   - `publish: true`

---

## Опубликовать

```
cd ~/Documents/Udroth-Website
npm run build      # упадёт, если wikilink ссылается на несуществующую статью
git add .
git commit -m "Add: Название нового материала"
git push
```

Во время работы — `npm run dev` → `localhost:4321`.

---

## Связи

- `[[Name]]` в любом поле фасета или tags → автоматическая ссылка на `/encyclopedia/<категория>/<slug>`
- `[[Name]]` в теле markdown текста → резолвится через `/wiki/<slug>` и редиректит на статью/текст/изображение/автора
- `related_articles` у статьи — перекрёстные ссылки (`[[Other Article]]`)
- На странице статьи автоматически появляется *Mentioned in texts* / *Related images* — это обратные ссылки

Имена в `[[двойных скобках]]` должны точно совпадать с `title` целевого файла.

---

## Фильтры, сортировка и поиск

- **Texts** — фильтры: имя, автор, эпоха (+ диапазон лет внутри эпохи), месяц загрузки. Сортировка: дата загрузки, внутримировая дата, имя, автор (в обе стороны).
- **Gallery** — фильтры: имя, тип, месяц загрузки. Сортировка: дата загрузки, имя, тип.
- Состояние фильтров попадает в адрес страницы (`/texts?age=Age+of+Chaos&sort=inworld:asc`) — такой вид можно отправить ссылкой.
- **Search** (`/search`) — полнотекстовый поиск Pagefind по текстам, изображениям и энциклопедии. Индекс строится при `npm run build`; в `npm run dev` поиск не работает — это нормально.
