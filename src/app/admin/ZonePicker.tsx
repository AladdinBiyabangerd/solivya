"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  AZ_LOCATIONS,
  formatZonePath,
  matchesSearch,
  normalizeSearch,
  resolveZoneSelection,
  type LocationNode,
} from "@/lib/azerbaijan-locations";
import styles from "./admin.module.css";

type Props = {
  name?: string;
  defaultValue?: string;
};

type LevelKey = "city" | "rayon" | "zona";

function levelLabel(level: LevelKey): string {
  if (level === "city") return "Şəhər";
  if (level === "rayon") return "Rayon";
  return "Zona";
}

function levelPlaceholder(level: LevelKey): string {
  if (level === "city") return "Şəhər seçin";
  if (level === "rayon") return "Rayon / zona seçin";
  return "Zona seçin";
}

function searchPlaceholder(level: LevelKey): string {
  if (level === "city") return "Şəhər axtar…";
  if (level === "rayon") return "Rayon axtar…";
  return "Zona axtar…";
}

function SearchableSelect({
  level,
  options,
  valueId,
  disabled,
  onSelect,
}: {
  level: LevelKey;
  options: LocationNode[];
  valueId: string;
  disabled?: boolean;
  onSelect: (node: LocationNode) => void;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(valueId);

  const selected = options.find((o) => o.id === valueId);
  const filtered = useMemo(
    () => options.filter((o) => matchesSearch(o.name, query)),
    [options, query],
  );

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveId(valueId || filtered[0]?.id || "");
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
    // Only reset when panel opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open || !activeId) return;
    optionRefs.current.get(activeId)?.scrollIntoView({
      block: "nearest",
    });
  }, [activeId, open, filtered]);

  function moveActive(delta: number) {
    if (filtered.length === 0) return;
    const idx = filtered.findIndex((o) => o.id === activeId);
    const next =
      filtered[(idx < 0 ? 0 : idx + delta + filtered.length) % filtered.length];
    setActiveId(next.id);
  }

  function commit(node: LocationNode) {
    onSelect(node);
    setOpen(false);
    setQuery("");
  }

  function onSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const hit = filtered.find((o) => o.id === activeId) ?? filtered[0];
      if (hit) commit(hit);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  function onQueryChange(next: string) {
    setQuery(next);
    const still = options.filter((o) => matchesSearch(o.name, next));
    const q = normalizeSearch(next);
    const starts = q
      ? still.find((o) => normalizeSearch(o.name).startsWith(q))
      : still[0];
    setActiveId((starts ?? still[0])?.id ?? "");
  }

  return (
    <div
      className={`${styles.zoneSelect} ${disabled ? styles.zoneSelectDisabled : ""}`}
      ref={rootRef}
    >
      <span className={styles.zoneSelectLabel}>{levelLabel(level)}</span>
      <button
        type="button"
        className={styles.zoneSelectTrigger}
        disabled={disabled || options.length === 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={selected ? undefined : styles.zoneSelectPlaceholder}>
          {selected?.name ?? levelPlaceholder(level)}
        </span>
        <span className={styles.zoneSelectChevron} aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div className={styles.zoneSelectPanel} role="presentation">
          <input
            ref={searchRef}
            className={styles.zoneSelectSearch}
            type="search"
            value={query}
            placeholder={searchPlaceholder(level)}
            autoComplete="off"
            spellCheck={false}
            aria-label={searchPlaceholder(level)}
            aria-controls={listId}
            aria-activedescendant={activeId ? `${listId}-${activeId}` : undefined}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onSearchKeyDown}
          />
          <ul
            id={listId}
            className={styles.zoneSelectList}
            role="listbox"
            aria-label={levelLabel(level)}
          >
            {filtered.length === 0 ? (
              <li className={styles.zoneSelectEmpty}>Nəticə yoxdur</li>
            ) : (
              filtered.map((opt) => {
                const active = opt.id === activeId;
                const chosen = opt.id === valueId;
                return (
                  <li key={opt.id} role="presentation">
                    <button
                      type="button"
                      id={`${listId}-${opt.id}`}
                      role="option"
                      aria-selected={chosen}
                      className={`${styles.zoneSelectOption}${
                        active ? ` ${styles.zoneSelectOptionActive}` : ""
                      }${chosen ? ` ${styles.zoneSelectOptionChosen}` : ""}`}
                      ref={(el) => {
                        if (el) optionRefs.current.set(opt.id, el);
                        else optionRefs.current.delete(opt.id);
                      }}
                      onMouseEnter={() => setActiveId(opt.id)}
                      onClick={() => commit(opt)}
                    >
                      {opt.name}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function ZonePicker({ name = "zone", defaultValue = "" }: Props) {
  const initial = resolveZoneSelection(defaultValue);

  const [cityId, setCityId] = useState(initial?.cityId ?? "");
  const [rayonId, setRayonId] = useState(initial?.rayonId ?? "");
  const [zonaId, setZonaId] = useState(initial?.zonaId ?? "");

  const city = AZ_LOCATIONS.find((c) => c.id === cityId);
  const rayons = city?.children ?? [];
  const rayon = rayons.find((r) => r.id === rayonId);
  const zonas = rayon?.children ?? [];
  const zona = zonas.find((z) => z.id === zonaId);

  const needsRayon = rayons.length > 0;
  const needsZona = Boolean(rayon?.children?.length);
  /** Second level is "rayon" only when any child has nested zones (Bakı-style). */
  const secondLevel: LevelKey = rayons.some((r) => r.children?.length)
    ? "rayon"
    : "zona";

  const labels: string[] = [];
  if (city) labels.push(city.name);
  if (rayon) labels.push(rayon.name);
  if (zona) labels.push(zona.name);

  const complete =
    Boolean(city) &&
    (!needsRayon || Boolean(rayon)) &&
    (!needsZona || Boolean(zona));

  const zoneValue = complete ? formatZonePath(labels) : "";

  return (
    <div className={styles.zonePicker}>
      <input type="hidden" name={name} value={zoneValue} />

      <SearchableSelect
        level="city"
        options={AZ_LOCATIONS}
        valueId={cityId}
        onSelect={(node) => {
          setCityId(node.id);
          setRayonId("");
          setZonaId("");
        }}
      />

      {needsRayon ? (
        <SearchableSelect
          level={secondLevel}
          options={rayons}
          valueId={rayonId}
          disabled={!cityId}
          onSelect={(node) => {
            setRayonId(node.id);
            setZonaId("");
          }}
        />
      ) : null}

      {needsZona ? (
        <SearchableSelect
          level="zona"
          options={zonas}
          valueId={zonaId}
          disabled={!rayonId}
          onSelect={(node) => setZonaId(node.id)}
        />
      ) : null}

      {zoneValue ? (
        <p className={styles.zonePickerSummary}>
          Seçim: <strong>{zoneValue}</strong>
        </p>
      ) : cityId ? (
        <p className={styles.fieldHint}>
          {needsRayon && !rayonId
            ? secondLevel === "rayon"
              ? "Rayon seçin"
              : "Zona seçin"
            : needsZona && !zonaId
              ? "Zona seçin"
              : null}
        </p>
      ) : (
        <p className={styles.fieldHint}>Əvvəlcə şəhəri seçin</p>
      )}
    </div>
  );
}
