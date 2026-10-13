/* Client-side filtering + sorting for <FilterBar>. See FilterBar.astro for the data contract. */

type Control = HTMLInputElement | HTMLSelectElement;

const fold = (s: string) =>
  s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });

function compare(a: string, b: string): number {
  const na = Number(a), nb = Number(b);
  if (a !== "" && b !== "" && Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
  return collator.compare(a, b);
}

function initOne(bar: HTMLFormElement) {
  const list = document.getElementById(bar.dataset.target!);
  if (!list) return;
  const items = Array.from(list.querySelectorAll<HTMLElement>("[data-item]"));
  const controls = Array.from(bar.querySelectorAll<Control>("input[name], select[name]"));
  const byName = (n: string) => controls.find((c) => c.name === n);
  const countEl = bar.querySelector<HTMLElement>("[data-count]")!;
  const resetBtn = bar.querySelector<HTMLButtonElement>("[data-reset]")!;
  const fullText = bar.querySelector<HTMLAnchorElement>("[data-fulltext]");
  const yearBox = bar.querySelector<HTMLElement>("[data-year-range]");
  const empty = document.querySelector<HTMLElement>(`[data-empty-for="${list.id}"]`);
  const [one, many] = (bar.dataset.noun ?? "item|items").split("|");

  // Restore state from the URL
  const params = new URLSearchParams(location.search);
  for (const c of controls) {
    const v = params.get(c.name);
    if (v === null) continue;
    if (c instanceof HTMLSelectElement && !Array.from(c.options).some((o) => o.value === v)) continue;
    c.value = v;
  }

  function apply() {
    const q = fold(byName("q")?.value ?? "");
    const filters = controls
      .filter((c): c is HTMLSelectElement => c instanceof HTMLSelectElement && !!c.dataset.filter && c.value !== "")
      .map((c) => ({ key: c.dataset.filter!, value: c.value }));

    // Year range only applies once its age is chosen
    let from: number | null = null, to: number | null = null;
    if (yearBox) {
      const dep = byName(yearBox.dataset.dependsOn!);
      const active = !!dep && dep.value !== "";
      yearBox.toggleAttribute("data-disabled", !active);
      for (const inp of yearBox.querySelectorAll("input")) inp.disabled = !active;
      if (active) {
        const f = byName("from")!.value, t = byName("to")!.value;
        from = f === "" ? null : Number(f);
        to = t === "" ? null : Number(t);
      }
    }

    let shown = 0;
    for (const it of items) {
      let ok = !q || (it.dataset.name ?? "").includes(q);
      for (const f of filters) {
        if (!ok) break;
        const vals = (it.getAttribute(`data-f-${f.key}`) ?? "").split("|");
        ok = vals.includes(f.value);
      }
      if (ok && (from !== null || to !== null)) {
        const y = it.dataset.year;
        if (!y) ok = false;
        else {
          const n = Number(y);
          if (from !== null && n < from) ok = false;
          if (to !== null && n > to) ok = false;
        }
      }
      it.hidden = !ok;
      if (ok) shown++;
    }

    // Sort
    const sortSel = bar.querySelector<HTMLSelectElement>("[data-sort]")!;
    const [field, dir] = sortSel.value.split(":");
    const sign = dir === "desc" ? -1 : 1;
    const sorted = items.slice().sort((a, b) => {
      const va = a.getAttribute(`data-s-${field}`) ?? "";
      const vb = b.getAttribute(`data-s-${field}`) ?? "";
      if (va === "" && vb !== "") return 1; // empty values always last
      if (vb === "" && va !== "") return -1;
      const c = compare(va, vb) * sign;
      return c !== 0 ? c : collator.compare(a.dataset.name ?? "", b.dataset.name ?? "");
    });
    list!.append(...sorted);

    // Status line
    countEl.textContent =
      shown === items.length
        ? `${items.length} ${items.length === 1 ? one : many}`
        : `Showing ${shown} of ${items.length} ${items.length === 1 ? one : many}`;
    if (empty) empty.hidden = shown !== 0;

    // URL + reset button
    const out = new URLSearchParams();
    let changed = false;
    for (const c of controls) {
      if (c.disabled) continue;
      const v = c.value.trim();
      if (v !== (c.dataset.default ?? "")) {
        out.set(c.name, v);
        if (c.name !== "sort") changed = true;
      }
    }
    resetBtn.hidden = !changed;
    const qs = out.toString();
    history.replaceState(null, "", qs ? `${location.pathname}?${qs}` : location.pathname);
    if (fullText) {
      const raw = byName("q")?.value.trim();
      fullText.href = raw ? `/search?q=${encodeURIComponent(raw)}` : "/search";
    }
  }

  bar.addEventListener("input", apply);
  bar.addEventListener("change", apply);
  bar.addEventListener("submit", (e) => e.preventDefault());
  resetBtn.addEventListener("click", () => {
    for (const c of controls) if (c.name !== "sort") c.value = c.dataset.default ?? "";
    apply();
  });
  document.querySelectorAll<HTMLButtonElement>(`[data-reset-for="${list.id}"]`).forEach((b) =>
    b.addEventListener("click", () => resetBtn.click()),
  );

  bar.hidden = false; // only shown once JS is running
  apply();
}

export function initFilterBars() {
  document.querySelectorAll<HTMLFormElement>("form[data-filter-bar]").forEach(initOne);
}
