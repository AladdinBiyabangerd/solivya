"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import {
  AZ_LOCATIONS,
  customNodesForParent,
  formatZonePath,
  locationParentKey,
  matchesSearch,
  normalizeSearch,
  resolveZoneSelection,
  type CustomLocation,
  type LocationNode,
} from "@/lib/azerbaijan-locations";
import { addOwnerCustomLocation } from "../property-actions";
import styles from "../admin.module.css";

type Props = {
  name?: string;
  defaultValue?: string;
  ownerKey?: string;
  initialCustoms?: CustomLocation[];
  onZoneChange?: (zonePath: string) => void;
};

type LevelKey = "city" | "rayon" | "nishangah";

const CUSTOM_PREFIX = "custom-";

function levelLabel(level: LevelKey): string {
  if (level === "city") return "Şəhər / rayon";
  if (level === "rayon") return "Rayon";
  return "Nişangah";
}

function levelPlaceholder(level: LevelKey): string {
  if (level === "city") return "Şəhər və ya rayon seçin";
  if (level === "rayon") return "Rayon seçin";
  return "Nişangah / qəsəbə seçin";
}

function searchPlaceholder(level: LevelKey): string {
  if (level === "city") return "Şəhər / rayon axtar…";
  if (level === "rayon") return "Rayon axtar…";
  return "Nişangah axtar…";
}

function storageKey(ownerKey: string) {
  return `solivya:custom-locations:${ownerKey || "anon"}`;
}

function readLocalCustoms(ownerKey: string): CustomLocation[] {
  if (typeof window === "undefined" || !ownerKey) return [];
  try {
    const raw = window.localStorage.getItem(storageKey(ownerKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CustomLocation =>
        !!item &&
        typeof item === "object" &&
        typeof (item as CustomLocation).id === "string" &&
        typeof (item as CustomLocation).parentKey === "string" &&
        typeof (item as CustomLocation).name === "string",
    );
  } catch {
    return [];
  }
}

function writeLocalCustoms(ownerKey: string, list: CustomLocation[]) {
  if (typeof window === "undefined" || !ownerKey) return;
  try {
    window.localStorage.setItem(storageKey(ownerKey), JSON.stringify(list));
  } catch {
    /* ignore quota */
  }
}

function mergeCustoms(a: CustomLocation[], b: CustomLocation[]): CustomLocation[] {
  const map = new Map<string, CustomLocation>();
  for (const c of [...a, ...b]) {
    const key = `${c.parentKey}::${normalizeSearch(c.name)}`;
    if (!map.has(key)) map.set(key, c);
  }
  return [...map.values()];
}

function SearchableSelect({
  level,
  options,
  valueId,
  disabled,
  onSelect,
  onAddCustom,
  customPending,
}: {
  level: LevelKey;
  options: LocationNode[];
  valueId: string;
  disabled?: boolean;
  onSelect: (node: LocationNode) => void;
  onAddCustom: (name: string) => Promise<LocationNode | null>;
  customPending?: boolean;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(valueId);
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customError, setCustomError] = useState("");

  function openCustom() {
    setQuery("");
    setCustomText("");
    setCustomError("");
    setCustomMode(true);
    setOpen(true);
  }

  const selected = options.find((o) => o.id === valueId);
  const filtered = useMemo(
    () => options.filter((o) => matchesSearch(o.name, query)),
    [options, query],
  );

  useEffect(() => {
    if (!open) {
      setCustomMode(false);
      return;
    }
    setQuery("");
    setActiveId(valueId || filtered[0]?.id || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || customMode) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, customMode]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open || !activeId || customMode) return;
    optionRefs.current.get(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId, open, filtered, customMode]);

  useEffect(() => {
    if (!customMode) return;
    const t = window.setTimeout(() => customInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [customMode]);

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

  async function submitCustom() {
    const name = customText.trim();
    if (!name) {
      setCustomError("Ad yazın");
      return;
    }
    setCustomError("");
    const node = await onAddCustom(name);
    if (!node) {
      setCustomError("Əlavə edilmədi — yenidən yoxlayın");
      return;
    }
    commit(node);
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
        disabled={disabled}
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
          {customMode ? (
            <div className={styles.zoneCustomForm}>
              <p className={styles.zoneCustomHint}>
                Siyahıda yoxdursa özünüz yazın — yalnız sizin hesabınızda
                saxlanır.
              </p>
              <input
                ref={customInputRef}
                className={styles.zoneSelectSearch}
                type="text"
                value={customText}
                placeholder={
                  level === "city"
                    ? "Məs: Ağstafa"
                    : level === "rayon"
                      ? "Məs: rayon adı"
                      : "Məs: qəsəbə / nişangah"
                }
                autoComplete="off"
                spellCheck={false}
                disabled={customPending}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void submitCustom();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setCustomMode(false);
                  }
                }}
              />
              {customError ? (
                <p className={styles.zoneCustomError}>{customError}</p>
              ) : null}
              <div className={styles.zoneCustomActions}>
                <button
                  type="button"
                  className={styles.zoneCustomCancel}
                  disabled={customPending}
                  onClick={() => setCustomMode(false)}
                >
                  Geri
                </button>
                <button
                  type="button"
                  className={styles.zoneCustomSave}
                  disabled={customPending}
                  onClick={() => void submitCustom()}
                >
                  {customPending ? "Saxlanır…" : "Əlavə et"}
                </button>
              </div>
            </div>
          ) : (
            <>
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
                aria-activedescendant={
                  activeId ? `${listId}-${activeId}` : undefined
                }
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={onSearchKeyDown}
              />
              <button
                type="button"
                className={styles.zoneCustomTrigger}
                onClick={() => setCustomMode(true)}
              >
                Siyahıda yoxdur — özüm yazım
              </button>
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
                    const isCustom = opt.id.startsWith(CUSTOM_PREFIX);
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
                          {isCustom ? (
                            <span className={styles.zoneSelectCustomTag}>
                              sizin
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </>
          )}
        </div>
      ) : null}

      {!disabled ? (
        <button
          type="button"
          className={styles.zoneCustomLink}
          onClick={openCustom}
        >
          Siyahıda yoxdur? Özünüz yazın
        </button>
      ) : null}
    </div>
  );
}

function withOrphan(
  options: LocationNode[],
  id: string,
  name: string | undefined,
): LocationNode[] {
  if (!id || !name) return options;
  if (options.some((o) => o.id === id)) return options;
  return [...options, { id, name }];
}

export function ZonePicker({
  name = "zone",
  defaultValue = "",
  ownerKey = "",
  initialCustoms = [],
  onZoneChange,
}: Props) {
  const [customs, setCustoms] = useState<CustomLocation[]>(initialCustoms);
  const [pending, startTransition] = useTransition();
  const [cityId, setCityId] = useState("");
  const [rayonId, setRayonId] = useState("");
  const [nishangahId, setNishangahId] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const seededRef = useRef(false);
  const defaultRef = useRef(defaultValue);

  useEffect(() => {
    const local = readLocalCustoms(ownerKey);
    setCustoms(mergeCustoms(initialCustoms, local));
  }, [ownerKey, initialCustoms]);

  useEffect(() => {
    if (defaultRef.current !== defaultValue) {
      defaultRef.current = defaultValue;
      seededRef.current = false;
    }
    const resolved = resolveZoneSelection(defaultValue, customs);
    const apply = (
      next: NonNullable<ReturnType<typeof resolveZoneSelection>>,
    ) => {
      setCityId(next.cityId);
      setRayonId(next.rayonId);
      setNishangahId(next.nishangahId);
      setLabels(next.labels);
    };

    if (!seededRef.current) {
      seededRef.current = true;
      if (!resolved) {
        setCityId("");
        setRayonId("");
        setNishangahId("");
        setLabels([]);
        return;
      }
      apply(resolved);
      return;
    }

    // When owner customs load, map orphan path segments onto saved customs
    if (
      resolved &&
      (cityId.startsWith("orphan:") ||
        rayonId.startsWith("orphan:") ||
        nishangahId.startsWith("orphan:")) &&
      (!resolved.cityId.startsWith("orphan:") ||
        !resolved.rayonId.startsWith("orphan:") ||
        !resolved.nishangahId.startsWith("orphan:"))
    ) {
      apply(resolved);
    }
  }, [defaultValue, customs, cityId, rayonId, nishangahId]);

  const systemCity = AZ_LOCATIONS.find((c) => c.id === cityId);
  const systemRayons = systemCity?.children ?? [];
  const systemNish =
    systemCity?.children?.find((r) => r.id === rayonId)?.children ?? [];

  const isCustomCity =
    cityId.startsWith(CUSTOM_PREFIX) || cityId.startsWith("orphan:");
  const isBakıStyle =
    systemRayons.some((r) => (r.children?.length ?? 0) > 0) || isCustomCity;

  const cityOptions = useMemo(
    () => [...AZ_LOCATIONS, ...customNodesForParent(customs, "")],
    [customs],
  );

  const cityName = labels[0];
  const city =
    cityOptions.find((c) => c.id === cityId) ??
    (cityId && cityName ? { id: cityId, name: cityName } : undefined);

  const rayonOptions = useMemo(() => {
    if (!cityId) return [];
    if (isCustomCity) return customNodesForParent(customs, cityId);
    return [...systemRayons, ...customNodesForParent(customs, cityId)];
  }, [cityId, customs, isCustomCity, systemRayons]);

  const rayonName = labels[1];
  const rayon =
    rayonOptions.find((r) => r.id === rayonId) ??
    (rayonId && rayonName ? { id: rayonId, name: rayonName } : undefined);

  const nishParent =
    city && rayon ? locationParentKey([city.id, rayon.id]) : "";
  const nishangahOptions = useMemo(() => {
    if (!city || !rayon) return [];
    if (
      rayonId.startsWith(CUSTOM_PREFIX) ||
      rayonId.startsWith("orphan:")
    ) {
      return customNodesForParent(customs, nishParent);
    }
    return [...systemNish, ...customNodesForParent(customs, nishParent)];
  }, [city, rayon, rayonId, customs, nishParent, systemNish]);

  const nishName = labels[2];
  const nishangah =
    nishangahOptions.find((z) => z.id === nishangahId) ??
    (nishangahId && nishName
      ? { id: nishangahId, name: nishName }
      : undefined);

  const nishRequired = systemNish.length > 0;
  const showNish = Boolean(rayon) && (nishRequired || isBakıStyle);

  const savedValue =
    city && rayon && (!nishRequired || nishangah)
      ? formatZonePath(
          [city.name, rayon.name, nishangah?.name].filter(
            (x): x is string => Boolean(x),
          ),
        )
      : "";

  useEffect(() => {
    onZoneChange?.(savedValue);
    // Parent setter is stable enough; avoid re-firing on callback identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedValue]);

  function persistCustoms(next: CustomLocation[]) {
    setCustoms(next);
    writeLocalCustoms(ownerKey, next);
  }

  function addCustom(
    parentKey: string,
    customName: string,
  ): Promise<LocationNode | null> {
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await addOwnerCustomLocation(parentKey, customName);
        if (result.location) {
          persistCustoms(mergeCustoms(customs, [result.location]));
          resolve(result.location);
          return;
        }
        const local: CustomLocation = {
          id: `custom-${crypto.randomUUID()}`,
          parentKey,
          name: customName.trim(),
        };
        persistCustoms(mergeCustoms(customs, [local]));
        resolve(local);
      });
    });
  }

  return (
    <div className={styles.zonePicker}>
      <input type="hidden" name={name} value={savedValue} />

      <SearchableSelect
        level="city"
        options={cityOptions}
        valueId={cityId}
        customPending={pending}
        onSelect={(node) => {
          setCityId(node.id);
          setRayonId("");
          setNishangahId("");
          setLabels([node.name]);
        }}
        onAddCustom={(n) => addCustom("", n)}
      />

      {city ? (
        <SearchableSelect
          level={isBakıStyle ? "rayon" : "nishangah"}
          options={withOrphan(rayonOptions, rayonId, rayon?.name)}
          valueId={rayonId}
          customPending={pending}
          onSelect={(node) => {
            setRayonId(node.id);
            setNishangahId("");
            setLabels([city.name, node.name]);
          }}
          onAddCustom={(n) => addCustom(cityId, n)}
        />
      ) : null}

      {showNish ? (
        <SearchableSelect
          level="nishangah"
          options={withOrphan(nishangahOptions, nishangahId, nishangah?.name)}
          valueId={nishangahId}
          customPending={pending}
          onSelect={(node) => {
            setNishangahId(node.id);
            setLabels([city!.name, rayon!.name, node.name]);
          }}
          onAddCustom={(n) =>
            addCustom(locationParentKey([cityId, rayonId]), n)
          }
        />
      ) : null}

      {savedValue ? (
        <p className={styles.zonePickerSummary}>
          Seçim: <strong>{savedValue}</strong>
        </p>
      ) : city ? (
        <p className={styles.fieldHint}>
          {!rayon
            ? isBakıStyle
              ? "Rayon seçin və ya özünüz yazın"
              : "Nişangah seçin və ya özünüz yazın"
            : nishRequired && !nishangah
              ? "Nişangah / qəsəbə seçin və ya özünüz yazın"
              : null}
        </p>
      ) : (
        <p className={styles.fieldHint}>Əvvəlcə şəhər və ya rayon seçin</p>
      )}
    </div>
  );
}
