import {
    eventsStore,
    loadedMonthsStore,
    availableMonthsStore,
    isLoadingPastStore,
    isLoadingFutureStore,
    earliestVisibleDateStore
} from "./appState";

import type { Show } from "../types/models";

function mergeEvents(existing: Show[], incoming: Show[]) {
    const map = new Map<string, Show>();
    for (const e of existing) map.set(e.id, e);
    for (const e of incoming) map.set(e.id, e);
    return Array.from(map.values());
}

export async function loadMonth(monthKey: string) {
    if (loadedMonthsStore.get().includes(monthKey) || isLoadingPastStore.get() || isLoadingFutureStore.get()) return false;

    const isPast = loadedMonthsStore.get().length > 0 && monthKey < loadedMonthsStore.get()[0];
    if (isPast) isLoadingPastStore.set(true);
    else isLoadingFutureStore.set(true);

    let success = false;
    try {
        const res = await fetch(`/data/events/${monthKey}.json`);
        if (res.ok) {
            const data = await res.json();
            eventsStore.set(mergeEvents(eventsStore.get(), data));
            loadedMonthsStore.set([...loadedMonthsStore.get(), monthKey].sort());
            success = true;
        }
    } catch (err) {
        console.error(`Failed to load ${monthKey}`, err);
    }

    isLoadingPastStore.set(false);
    isLoadingFutureStore.set(false);
    return success;
}

export async function fetchOlderMonth() {
    const loadedMonths = loadedMonthsStore.get();
    const availableMonths = availableMonthsStore.get();

    if (loadedMonths.length === 0 || availableMonths.length === 0) return false;

    const earliestLoaded = loadedMonths[0];

    // Step 1: Just push the visible floor back to the first of the earliest loaded month
    // if we haven't done that yet.
    const currentFloor = earliestVisibleDateStore.get();
    const earliestLoadedFloor = `${earliestLoaded}-01`;
    if (currentFloor > earliestLoadedFloor) {
        earliestVisibleDateStore.set(earliestLoadedFloor);
        // Announce to screen reader
        announceToScreenReader(`Showing events starting from ${new Date(earliestLoadedFloor).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
        return true; // we revealed more shows without network
    }

    // Step 2: If we are already at the floor of the earliest loaded month, fetch the previous month
    const index = availableMonths.indexOf(earliestLoaded);
    if (index > 0) {
        const prevMonth = availableMonths[index - 1];
        const success = await loadMonth(prevMonth);
        if (success) {
            earliestVisibleDateStore.set(`${prevMonth}-01`);
            announceToScreenReader(`Loaded older events from ${new Date(`${prevMonth}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
            return true;
        }
    }
    return false;
}

function announceToScreenReader(message: string) {
    // Check if announcer div exists, if not create it
    let announcer = document.getElementById("a11y-announcer");
    if (!announcer) {
        announcer = document.createElement("div");
        announcer.id = "a11y-announcer";
        announcer.setAttribute("aria-live", "polite");
        announcer.className = "sr-only";
        document.body.appendChild(announcer);
    }
    announcer.textContent = message;
}

export async function fetchNewerMonth() {
    const loadedMonths = loadedMonthsStore.get();
    const availableMonths = availableMonthsStore.get();

    if (loadedMonths.length === 0 || availableMonths.length === 0) return false;

    const latestLoaded = loadedMonths[loadedMonths.length - 1];
    const index = availableMonths.indexOf(latestLoaded);

    if (index !== -1 && index < availableMonths.length - 1) {
        const nextMonth = availableMonths[index + 1];
        return loadMonth(nextMonth);
    }
    return false;
}

export async function loadSpecificMonths(months: string[]) {
    const loaded = loadedMonthsStore.get();
    const monthsToLoad = months.filter(m => !loaded.includes(m));

    if (monthsToLoad.length === 0) return;

    isLoadingFutureStore.set(true);

    try {
        const fetches = monthsToLoad.map(m => fetch(`/data/events/${m}.json`));
        const responses = await Promise.all(fetches);

        let newEvents: any[] = [];
        let successfullyLoaded: string[] = [];

        for (let i = 0; i < responses.length; i++) {
            if (responses[i].ok) {
                const data = await responses[i].json();
                newEvents = newEvents.concat(data);
                successfullyLoaded.push(monthsToLoad[i]);
            }
        }

        if (newEvents.length > 0) {
            eventsStore.set(mergeEvents(eventsStore.get(), newEvents));
            loadedMonthsStore.set([...loadedMonthsStore.get(), ...successfullyLoaded].sort());
        }
    } catch (err) {
        console.error(`Failed to load specific months`, err);
    } finally {
        isLoadingFutureStore.set(false);
    }
}

export async function ensureDateRangeLoaded(fromIso: string, toIso: string) {
    const available = availableMonthsStore.get();
    let loaded = loadedMonthsStore.get();

    if (available.length === 0) return;

    const fromMonth = fromIso.substring(0, 7);
    const toMonth = toIso.substring(0, 7);

    const monthsToLoad = available.filter(
        (m) => m >= fromMonth && m <= toMonth && !loaded.includes(m)
    );

    if (monthsToLoad.length === 0) return;

    isLoadingFutureStore.set(true);

    try {
        const fetches = monthsToLoad.map(m => fetch(`/data/events/${m}.json`));
        const responses = await Promise.all(fetches);

        let newEvents: any[] = [];
        let successfullyLoaded: string[] = [];

        for (let i = 0; i < responses.length; i++) {
            if (responses[i].ok) {
                const data = await responses[i].json();
                newEvents = newEvents.concat(data);
                successfullyLoaded.push(monthsToLoad[i]);
            }
        }

        if (newEvents.length > 0) {
            eventsStore.set(mergeEvents(eventsStore.get(), newEvents));
            loadedMonthsStore.set([...loadedMonthsStore.get(), ...successfullyLoaded].sort());
        }
    } catch (err) {
        console.error(`Failed to bulk load months`, err);
    } finally {
        isLoadingFutureStore.set(false);
    }
}
