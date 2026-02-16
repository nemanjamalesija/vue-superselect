<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useSelectContext } from 'vue-superselect'

const ctx = useSelectContext<unknown>()

const showPipeline = ref(false)
const showLog = ref(true)
const showPropGetters = ref(false)

const totalCount = computed(() => ctx.orderedItems.value.length)
const filteredCount = computed(() => ctx.filteredItems.value.length)
const visibleCount = computed(() => ctx.visibleItems.value.length)

const activeLabel = computed(() => {
  if (!ctx.activeId.value) return 'none'
  const label = resolveLabel(ctx.activeId.value)
  return `${label} (${ctx.activeId.value})`
})

// --- Label cache ---

const labelCache = new Map<string, string>()
const valueLabelCache = new Map<unknown, string>()

watch(
  () => ctx.orderedItems.value,
  (items) => {
    for (const item of items) {
      labelCache.set(item.id, item.label)
      valueLabelCache.set(item.value, item.label)
    }
  },
  { immediate: true },
)

function resolveLabel(id: string | null): string {
  if (!id) return 'none'
  const live = ctx.orderedItems.value.find((i) => i.id === id)
  if (live) return live.label
  return labelCache.get(id) ?? id
}

function resolveLabelByValue(val: unknown): string {
  const live = ctx.orderedItems.value.find((i) => Object.is(i.value, val))
  if (live) return live.label
  const cached = valueLabelCache.get(val)
  if (cached) return cached
  if (!ctx.multiple && ctx.query.value !== '') return ctx.query.value
  return String(val)
}

// --- Event log with causality chains ---

interface LogEntry {
  id: number
  time: string
  source: string
  action: string
  detail: string
  trigger: string     // DOM event that initiated this change (e.g. "mousedown", "ArrowDown")
  depth: number       // 0 = root cause (user action), 1 = reactive consequence
  groupId: number     // entries in the same chain share a groupId
}

let logId = 0
let currentGroupId = 0
let groupStartTime = 0
const GROUP_WINDOW = 10 // ms — events within this window are part of the same chain

const log = ref<LogEntry[]>([])
const logEl = ref<HTMLElement | null>(null)

const MAX_LOG = 80

// --- "Why?" annotation tracking for computed log entries ---
// Sync-flushed ref watchers push causes; pre-flushed computed watchers read them.
// Cleared after each render cycle via nextTick.

interface CauseEntry { ref: string; detail: string }
const pendingCauses: CauseEntry[] = []
let causeFlushScheduled = false

function trackCause(refName: string, detail: string) {
  pendingCauses.push({ ref: refName, detail })
  if (!causeFlushScheduled) {
    causeFlushScheduled = true
    nextTick(() => {
      pendingCauses.length = 0
      causeFlushScheduled = false
    })
  }
}

function findCause(...preferred: string[]): string {
  for (const name of preferred) {
    const match = pendingCauses.find(c => c.ref === name)
    if (match) return match.detail
  }
  return pendingCauses[0]?.detail ?? ''
}

// Snapshot fallbacks for debounced filter changes
let querySnapshot = ctx.query.value
let collectionSizeSnapshot = ctx.orderedItems.value.length

// --- DOM event tracking ---
// Capture-phase listeners record the most recent user interaction so
// sync-flushed state watchers can annotate *which* event triggered the change.

let lastInteraction = ''
let lastInteractionTime = 0
const DIRECT_TRIGGER_WINDOW = 5 // ms — within this window the DOM event is the direct cause

function onDomEvent(e: Event) {
  lastInteractionTime = performance.now()
  if (e instanceof KeyboardEvent) {
    lastInteraction = e.key
  } else if (e.type === 'input') {
    const ie = e as InputEvent
    lastInteraction = ie.data ? `typed "${ie.data}"` : 'input'
  } else {
    lastInteraction = e.type
  }
}

const TRACKED_EVENTS = ['mousedown', 'click', 'keydown', 'input', 'mousemove'] as const

onMounted(() => {
  for (const evt of TRACKED_EVENTS) document.addEventListener(evt, onDomEvent, true)
})

onUnmounted(() => {
  for (const evt of TRACKED_EVENTS) document.removeEventListener(evt, onDomEvent, true)
})

// Sources that represent direct user actions (root causes)
const ROOT_SOURCES = new Set([
  'SelectInput',
  'SelectOption',
  'SelectClear',
  'SelectTag',
])

function now() {
  const d = new Date()
  return `${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`
}

function addLog(source: string, action: string, detail: string) {
  const timestamp = performance.now()
  const isRoot = ROOT_SOURCES.has(source)
  const elapsed = timestamp - groupStartTime

  // Start a new group if: this is a root cause, OR enough time has passed since the last group
  if (isRoot || elapsed > GROUP_WINDOW) {
    currentGroupId++
    groupStartTime = timestamp
  }

  const depth = (isRoot || elapsed > GROUP_WINDOW) ? 0 : 1

  log.value = [
    ...log.value.slice(-(MAX_LOG - 1)),
    {
      id: ++logId,
      time: now(),
      source,
      action,
      detail,
      trigger: (timestamp - lastInteractionTime < DIRECT_TRIGGER_WINDOW)
        ? ((lastInteractionTime = 0), lastInteraction)
        : '',
      depth,
      groupId: currentGroupId,
    },
  ]
  nextTick(() => {
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
  })
}

function clearLog() {
  log.value = []
}

// Check if an entry is the first in its group (for rendering the separator)
function isGroupStart(index: number): boolean {
  if (index === 0) return true
  const prev = log.value[index - 1]
  const curr = log.value[index]
  return prev !== undefined && curr !== undefined && prev.groupId !== curr.groupId
}

function formatValue(val: unknown): string {
  if (val === null) return 'null'
  if (Array.isArray(val)) return `[${val.map(String).join(', ')}]`
  return String(val)
}

// --- Watchers ---

let tickValueChanged = false

// value changes
watch(
  () => ctx.value.value,
  (val, oldVal) => {
    tickValueChanged = true

    if (ctx.multiple) {
      const prevArr = Array.isArray(oldVal) ? oldVal : []
      const nextArr = Array.isArray(val) ? val : []

      if (nextArr.length === 0 && prevArr.length > 0) {
        addLog('SelectClear', 'onClick', `value = []  (cleared ${prevArr.length} items)`)
        trackCause('value', 'value cleared')
      } else if (nextArr.length > prevArr.length) {
        const added = nextArr.filter((v: unknown) => !prevArr.some((p: unknown) => Object.is(p, v)))
        const label = added.length === 1
          ? resolveLabelByValue(added[0])
          : `${added.length} items`
        addLog('SelectOption', 'selectItem', `value += ${label}  → ${formatValue(val)}`)
        trackCause('value', `${label} selected`)
      } else if (nextArr.length < prevArr.length) {
        const removed = prevArr.filter((v: unknown) => !nextArr.some((n: unknown) => Object.is(n, v)))
        const label = removed.length === 1
          ? resolveLabelByValue(removed[0])
          : `${removed.length} items`
        const source = ctx.query.value === '' ? 'SelectTag' : 'SelectOption'
        addLog(source, 'removeItem', `value -= ${label}  → ${formatValue(val)}`)
        trackCause('value', `${label} deselected`)
      }
    } else {
      if (val === null && oldVal !== null) {
        addLog('SelectClear', 'onClick', `value = null  (was ${resolveLabelByValue(oldVal)})`)
        trackCause('value', 'value cleared')
      } else if (val !== null) {
        const label = resolveLabelByValue(val)
        addLog('SelectOption', 'selectItem', `value = ${label}`)
        trackCause('value', `${label} selected`)
      }
    }
  },
  { flush: 'sync' },
)

// isOpen changes
watch(
  () => ctx.isOpen.value,
  (val, oldVal) => {
    if (val && !oldVal) {
      addLog('SelectInput', 'open()', 'isOpen = true')
      trackCause('isOpen', 'SelectContent rendered (isOpen → true)')
    } else if (!val && oldVal) {
      const cause = tickValueChanged ? 'selectItem closed dropdown' : 'Escape or blur'
      addLog('useKeyboard', 'close()', `isOpen = false  (${cause})`)
      trackCause('isOpen', 'SelectContent unmounted children (isOpen → false)')
    }

    tickValueChanged = false
  },
  { flush: 'sync' },
)

// query changes
watch(
  () => ctx.query.value,
  (val, oldVal) => {
    if (val !== '' && val !== oldVal) {
      if (!ctx.multiple && ctx.value.value !== null && val === resolveLabelByValue(ctx.value.value)) {
        addLog('selectItem', 'set query', `query = "${val}"  (synced to selected label)`)
        trackCause('query', `query synced to "${val}"`)
      } else {
        addLog('SelectInput', 'onInput', `query = "${val}"`)
        trackCause('query', `query changed to "${val}"`)
      }
    } else if (val === '' && oldVal !== '') {
      addLog('(reset)', 'query cleared', 'query = ""')
      trackCause('query', 'query cleared')
    }
  },
  { flush: 'sync' },
)

// activeId changes
watch(
  () => ctx.activeId.value,
  (val, oldVal) => {
    if (val === null && oldVal !== null) {
      addLog('useKeyboard', 'reset', `activeId = none  (was ${resolveLabel(oldVal)})`)
    } else if (val !== null && val !== oldVal) {
      const label = resolveLabel(val)
      addLog('useKeyboard', 'move/hover', `activeId → ${label}`)
    }
  },
)

// Collection size changes
watch(
  () => ctx.orderedItems.value.length,
  (val, oldVal) => {
    if (val > oldVal) {
      const diff = val - oldVal
      const why = findCause('isOpen')
      const annotation = why ? `  ← ${why}` : ''
      addLog('SelectOption', `registerItem ×${diff}`, `collection: ${oldVal} → ${val} items${annotation}`)
      trackCause('collection', 'collection resized')
    } else if (val < oldVal) {
      const diff = oldVal - val
      const why = findCause('isOpen')
      const annotation = why ? `  ← ${why}` : ''
      addLog('SelectOption', `unregisterItem ×${diff}`, `collection: ${oldVal} → ${val} items${annotation}`)
      trackCause('collection', 'collection resized')
    }
  },
)

// Filtered count changes
watch(filteredCount, (val, oldVal) => {
  if (val === oldVal) return
  const collectionSize = ctx.orderedItems.value.length

  // Determine "why?" — prefer pending causes from sync watchers, fall back to snapshots
  let why = findCause('query', 'collection')
  if (!why) {
    const currentQuery = ctx.query.value
    if (currentQuery !== querySnapshot) {
      why = currentQuery === '' ? 'query cleared' : `query changed to "${currentQuery}"`
    } else if (collectionSize !== collectionSizeSnapshot) {
      why = 'collection resized'
    }
  }
  querySnapshot = ctx.query.value
  collectionSizeSnapshot = collectionSize

  // Propagate cause so visibleItems can reference it
  if (why) trackCause('filteredItems', why)

  if (val === collectionSize && oldVal !== collectionSize) return

  const annotation = why ? `  ← ${why}` : ''
  addLog('useFilter', 'recompute', `filteredItems: ${oldVal} → ${val}${annotation}`)
})

// Visible count changes
watch(visibleCount, (val, oldVal) => {
  if (val === oldVal) return
  if (val !== filteredCount.value) {
    const why = findCause('value', 'filteredItems', 'query')
    const annotation = why ? `  ← ${why}` : ''
    addLog('useSelectState', 'recompute', `visibleItems: ${oldVal} → ${val}  (hideSelected active)${annotation}`)
  }
})

// --- Pipeline ---

const pipeline = computed(() => {
  const ordered = ctx.orderedItems.value
  const filtered = ctx.filteredItems.value
  const visible = ctx.visibleItems.value

  return ordered.map((item) => {
    const inFiltered = filtered.some((f) => f.id === item.id)
    const inVisible = visible.some((v) => v.id === item.id)
    const isActive = ctx.activeId.value === item.id
    const isSelected = ctx.multiple
      ? Array.isArray(ctx.value.value) && ctx.value.value.some((v: unknown) => Object.is(v, item.value))
      : ctx.value.value !== null && Object.is(ctx.value.value, item.value)

    return {
      id: item.id,
      label: item.label,
      disabled: item.disabled,
      inFiltered,
      inVisible,
      isActive,
      isSelected,
    }
  })
})

// --- Prop getter output ---
// Shows what each prop getter produces right now, connecting refs → HTML attributes.

type PropEntry = { key: string; value: string; source: string }

const ATTR_SOURCES: Record<string, string> = {
  'role': 'useA11y',
  'aria-expanded': 'useA11y ← isOpen',
  'aria-controls': 'useA11y ← baseId',
  'aria-activedescendant': 'useA11y ← activeId',
  'aria-autocomplete': 'useA11y',
  'aria-multiselectable': 'useA11y ← multiple',
  'aria-selected': 'useA11y ← isSelected()',
  'aria-disabled': 'useA11y ← item.disabled',
  'id': 'useA11y ← baseId',
  'value': 'useSelectState ← query',
  'data-state': 'useSelect ← isOpen',
  'data-selected': 'useSelect ← isSelected()',
  'data-highlighted': 'useSelect ← activeId',
  'data-disabled': 'useSelect ← disabled || isAtMax',
}

function formatAttrValue(val: unknown): string {
  if (val === undefined) return 'undefined'
  if (val === null) return 'null'
  if (typeof val === 'function') return 'fn()'
  if (typeof val === 'boolean') return String(val)
  return String(val)
}

function propsToEntries(obj: Record<string, unknown>): PropEntry[] {
  return Object.entries(obj)
    .filter(([, v]) => typeof v !== 'function')
    .map(([key, value]) => ({
      key,
      value: formatAttrValue(value),
      source: ATTR_SOURCES[key] ?? '',
    }))
}

const inputPropsEntries = computed<PropEntry[]>(() => {
  const props = ctx.getInputProps({ type: 'text' })
  return propsToEntries(props)
})

const listboxPropsEntries = computed<PropEntry[]>(() => {
  const props = ctx.getListboxProps()
  return propsToEntries(props)
})

const activeOptionPropsEntries = computed<PropEntry[]>(() => {
  if (!ctx.activeId.value) return []
  const item = ctx.orderedItems.value.find((i) => i.id === ctx.activeId.value)
  if (!item) return []
  const props = ctx.getOptionProps(item)
  return propsToEntries(props)
})

const activeOptionLabel = computed(() => {
  if (!ctx.activeId.value) return null
  return resolveLabel(ctx.activeId.value)
})

// --- Flash effect ---

const flashing = ref<Record<string, boolean>>({})

function flash(key: string) {
  flashing.value[key] = true
  setTimeout(() => {
    flashing.value[key] = false
  }, 400)
}

watch(() => ctx.value.value, () => flash('value'))
watch(() => ctx.isOpen.value, () => flash('isOpen'))
watch(() => ctx.query.value, () => flash('query'))
watch(() => ctx.activeId.value, () => flash('activeId'))
watch(filteredCount, () => flash('filtered'))
watch(visibleCount, () => flash('visible'))
</script>

<template>
  <div class="select-debug">
    <div class="debug-section">
      <div class="debug-header">Refs (writable state)</div>

      <div class="debug-row" :class="{ flash: flashing['isOpen'] }">
        <span class="debug-label">isOpen</span>
        <span class="debug-value" :class="ctx.isOpen.value ? 'val-true' : 'val-false'">
          {{ ctx.isOpen.value }}
        </span>
      </div>

      <div class="debug-row" :class="{ flash: flashing['value'] }">
        <span class="debug-label">value</span>
        <span class="debug-value">
          {{ ctx.multiple ? JSON.stringify(ctx.value.value) : (ctx.value.value ?? 'null') }}
        </span>
      </div>

      <div class="debug-row" :class="{ flash: flashing['query'] }">
        <span class="debug-label">query</span>
        <span class="debug-value">
          {{ ctx.query.value === '' ? '""' : `"${ctx.query.value}"` }}
        </span>
      </div>

      <div class="debug-row" :class="{ flash: flashing['activeId'] }">
        <span class="debug-label">activeId</span>
        <span class="debug-value">{{ activeLabel }}</span>
      </div>
    </div>

    <div class="debug-section">
      <div class="debug-header">Computeds (derived state)</div>

      <div class="debug-row" :class="{ flash: flashing['filtered'] }">
        <span class="debug-label">filteredItems</span>
        <span class="debug-value">{{ filteredCount }} / {{ totalCount }}</span>
      </div>

      <div class="debug-row" :class="{ flash: flashing['visible'] }">
        <span class="debug-label">visibleItems</span>
        <span class="debug-value">{{ visibleCount }} / {{ totalCount }}</span>
      </div>

      <div class="debug-row">
        <span class="debug-label">activeIndex</span>
        <span class="debug-value">{{ ctx.activeIndex.value === -1 ? 'none' : ctx.activeIndex.value }}</span>
      </div>

      <div v-if="ctx.multiple" class="debug-row">
        <span class="debug-label">isAtMax</span>
        <span class="debug-value" :class="ctx.isAtMax.value ? 'val-true' : 'val-false'">
          {{ ctx.isAtMax.value }}
        </span>
      </div>
    </div>

    <div class="debug-section">
      <div class="debug-header-row">
        <div class="debug-header">Prop getters (refs → DOM attributes)</div>
        <button class="debug-toggle-sm" @click="showPropGetters = !showPropGetters">
          {{ showPropGetters ? 'hide' : 'show' }}
        </button>
      </div>

      <div v-if="showPropGetters" class="prop-getters">
        <div class="getter-block">
          <div class="getter-title">
            <span class="getter-name">getInputProps()</span>
            <span class="getter-consumer">→ SelectInput</span>
          </div>
          <div v-for="entry in inputPropsEntries" :key="entry.key" class="getter-row">
            <span class="getter-key">{{ entry.key }}</span>
            <span class="getter-val">{{ entry.value }}</span>
            <span v-if="entry.source" class="getter-source">{{ entry.source }}</span>
          </div>
        </div>

        <div class="getter-block">
          <div class="getter-title">
            <span class="getter-name">getListboxProps()</span>
            <span class="getter-consumer">→ SelectContent</span>
          </div>
          <div v-for="entry in listboxPropsEntries" :key="entry.key" class="getter-row">
            <span class="getter-key">{{ entry.key }}</span>
            <span class="getter-val">{{ entry.value }}</span>
            <span v-if="entry.source" class="getter-source">{{ entry.source }}</span>
          </div>
        </div>

        <div class="getter-block">
          <div class="getter-title">
            <span class="getter-name">getOptionProps()</span>
            <span class="getter-consumer">
              → {{ activeOptionLabel ? `SelectOption (${activeOptionLabel})` : 'no active option' }}
            </span>
          </div>
          <template v-if="activeOptionPropsEntries.length > 0">
            <div v-for="entry in activeOptionPropsEntries" :key="entry.key" class="getter-row">
              <span class="getter-key">{{ entry.key }}</span>
              <span class="getter-val">{{ entry.value }}</span>
              <span v-if="entry.source" class="getter-source">{{ entry.source }}</span>
            </div>
          </template>
          <div v-else class="debug-empty">
            No active option — open dropdown and hover/arrow to an option
          </div>
        </div>
      </div>
    </div>

    <div class="debug-section">
      <div class="debug-header-row">
        <div class="debug-header">Event log</div>
        <div class="debug-actions">
          <button class="debug-toggle-sm" @click="clearLog">clear</button>
          <button class="debug-toggle-sm" @click="showLog = !showLog">
            {{ showLog ? 'hide' : 'show' }}
          </button>
        </div>
      </div>

      <div v-if="showLog" ref="logEl" class="event-log">
        <div v-if="log.length === 0" class="debug-empty">
          Interact with the select to see events...
        </div>
        <template v-for="(entry, index) in log" :key="entry.id">
          <div v-if="isGroupStart(index) && index > 0" class="log-separator" />
          <div
            class="log-entry"
            :class="{
              'log-root': entry.depth === 0,
              'log-consequence': entry.depth > 0,
            }"
          >
            <span v-if="entry.depth > 0" class="log-arrow">↳</span>
            <span class="log-source">{{ entry.source }}</span>
            <span class="log-action">{{ entry.action }}</span>
            <span class="log-detail">{{ entry.detail }}</span>
            <span v-if="entry.depth === 0 && entry.trigger" class="log-trigger">{{ entry.trigger }}</span>
          </div>
        </template>
      </div>
    </div>

    <button class="debug-toggle" @click="showPipeline = !showPipeline">
      {{ showPipeline ? 'Hide' : 'Show' }} data pipeline
    </button>

    <div v-if="showPipeline" class="debug-pipeline">
      <div v-if="pipeline.length === 0" class="debug-empty">
        Collection empty — dropdown is closed, options not mounted
      </div>
      <template v-else>
        <div class="pipeline-header">
          <span class="pipe-col pipe-col-label">item</span>
          <span class="pipe-col">collected</span>
          <span class="pipe-col">filtered</span>
          <span class="pipe-col">visible</span>
          <span class="pipe-col">active</span>
          <span class="pipe-col">selected</span>
        </div>
        <div
          v-for="item in pipeline"
          :key="item.id"
          class="pipeline-row"
          :class="{ 'row-dimmed': !item.inVisible }"
        >
          <span class="pipe-col pipe-col-label" :title="item.id">
            {{ item.label }}
            <span v-if="item.disabled" class="item-badge">off</span>
          </span>
          <span class="pipe-col pipe-dot val-true">●</span>
          <span class="pipe-col pipe-dot" :class="item.inFiltered ? 'val-true' : 'val-false'">
            {{ item.inFiltered ? '●' : '○' }}
          </span>
          <span class="pipe-col pipe-dot" :class="item.inVisible ? 'val-true' : 'val-false'">
            {{ item.inVisible ? '●' : '○' }}
          </span>
          <span class="pipe-col pipe-dot" :class="item.isActive ? 'val-active' : 'val-false'">
            {{ item.isActive ? '●' : '○' }}
          </span>
          <span class="pipe-col pipe-dot" :class="item.isSelected ? 'val-selected' : 'val-false'">
            {{ item.isSelected ? '●' : '○' }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.select-debug {
  margin-top: 12px;
  margin-bottom: 16px;
  border: 1px solid #e0e7ff;
  border-radius: 8px;
  background: #f8f9ff;
  padding: 10px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  display: grid;
  gap: 4px;
}

.debug-section {
  display: grid;
  gap: 4px;
}

.debug-section + .debug-section {
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px solid #e0e7ff;
}

.debug-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.debug-header {
  font-weight: 600;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6366f1;
  margin-bottom: 2px;
}

.debug-actions {
  display: flex;
  gap: 4px;
}

.debug-toggle-sm {
  border: 1px solid #e0e7ff;
  border-radius: 4px;
  background: #fff;
  padding: 1px 6px;
  font-family: inherit;
  font-size: 0.68rem;
  cursor: pointer;
  color: #6366f1;
}

.debug-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 6px;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.debug-row.flash {
  background: rgba(99, 102, 241, 0.12);
}

.debug-label {
  color: #6b7280;
}

.debug-value {
  color: #111;
  font-weight: 500;
}

.val-true { color: #059669; }
.val-false { color: #d1d5db; }
.val-active { color: #6366f1; }
.val-selected { color: #0b6cff; }

/* Prop getters */
.prop-getters {
  display: grid;
  gap: 8px;
}

.getter-block {
  border: 1px solid #e0e7ff;
  border-radius: 6px;
  background: #fff;
  padding: 6px 8px;
  display: grid;
  gap: 2px;
}

.getter-title {
  display: flex;
  gap: 6px;
  align-items: baseline;
  margin-bottom: 2px;
}

.getter-name {
  font-weight: 600;
  color: #6366f1;
  font-size: 0.74rem;
}

.getter-consumer {
  color: #9ca3af;
  font-size: 0.68rem;
}

.getter-row {
  display: flex;
  gap: 8px;
  align-items: baseline;
  padding: 1px 4px;
  font-size: 0.72rem;
}

.getter-key {
  color: #6b7280;
  min-width: 150px;
  flex-shrink: 0;
}

.getter-val {
  color: #111;
  font-weight: 500;
  min-width: 80px;
}

.getter-source {
  color: #d1d5db;
  font-size: 0.65rem;
  margin-left: auto;
}

/* Event log */
.event-log {
  height: 260px;
  overflow-y: auto;
  display: grid;
  gap: 0;
  align-content: start;
  border: 1px solid #e0e7ff;
  border-radius: 6px;
  background: #fff;
  padding: 6px;
}

.log-separator {
  height: 1px;
  background: #e0e7ff;
  margin: 4px 0;
}

.log-entry {
  display: flex;
  gap: 8px;
  padding: 3px 4px;
  border-radius: 3px;
  font-size: 0.72rem;
  line-height: 1.4;
  align-items: baseline;
}

.log-root {
  font-weight: 500;
}

.log-consequence {
  padding-left: 16px;
  opacity: 0.75;
}

.log-arrow {
  color: #d1d5db;
  flex-shrink: 0;
  font-size: 0.8rem;
}

.log-time {
  color: #d1d5db;
  flex-shrink: 0;
  font-size: 0.68rem;
}

.log-source {
  color: #6366f1;
  font-weight: 600;
  flex-shrink: 0;
  min-width: 100px;
}

.log-consequence .log-source {
  color: #9ca3af;
}

.log-action {
  color: #059669;
  flex-shrink: 0;
  min-width: 110px;
}

.log-detail {
  color: #6b7280;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-trigger {
  color: #a78bfa;
  font-size: 0.62rem;
  flex-shrink: 0;
  margin-left: auto;
  padding: 0 4px;
  border: 1px solid #e9e5ff;
  border-radius: 3px;
  background: #f5f3ff;
}

.debug-toggle {
  margin-top: 6px;
  border: 1px solid #e0e7ff;
  border-radius: 6px;
  background: #fff;
  padding: 4px 8px;
  font-family: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  color: #6366f1;
}

.debug-empty {
  color: #9ca3af;
  font-style: italic;
  padding: 4px 0;
  font-size: 0.72rem;
}

/* Pipeline */
.debug-pipeline {
  margin-top: 4px;
  border-top: 1px solid #e0e7ff;
  padding-top: 8px;
  display: grid;
  gap: 2px;
}

.pipeline-header {
  display: flex;
  gap: 4px;
  padding: 2px 6px;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
}

.pipeline-row {
  display: flex;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
}

.row-dimmed {
  opacity: 0.45;
}

.pipe-col {
  width: 60px;
  text-align: center;
  flex-shrink: 0;
}

.pipe-col-label {
  flex: 1;
  text-align: left;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #374151;
}

.pipe-dot {
  font-size: 0.9rem;
}

.item-badge {
  font-size: 0.6rem;
  text-transform: uppercase;
  color: #ef4444;
  margin-left: 4px;
}
</style>
