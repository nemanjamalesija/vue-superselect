<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectControl,
  SelectTag,
  SelectEmpty,
  SelectLiveRegion,
} from 'vue-superselect'

/**
 * Example: Custom SelectTag slot rendering.
 *
 * Why this exists:
 * - Demonstrates full tag markup control while preserving tag behavior.
 * - Shows how to keep remove action accessible in custom chip UIs.
 */

type Option = {
  id: string
  label: string
}

const options: Option[] = [
  { id: 'owner', label: 'Owner' },
  { id: 'admin', label: 'Admin' },
  { id: 'editor', label: 'Editor' },
  { id: 'viewer', label: 'Viewer' },
]

const values = ref<string[]>(['owner', 'editor'])
</script>

<template>
  <section class="card">
    <header>
      <h2>Tag slot override</h2>
      <p>
        `SelectTag` can render fully custom chip content through its slot while
        keeping remove behavior in the library contract.
      </p>
    </header>

    <SelectRoot id="playground-tag-slot-override" v-model="values" multiple>
      <SelectControl v-slot="{ selectedItems, removeItem }" class="control control-with-tags">
        <SelectTag
          v-for="item in selectedItems"
          :key="String(item.value)"
          :value="item.value"
          :label="item.label"
          class="custom-tag"
          @remove="removeItem"
        >
          <template #default="{ label, remove }">
            <span class="custom-tag-label">{{ label }}</span>
            <button
              type="button"
              class="custom-tag-remove"
              :aria-label="`Remove ${label}`"
              @click="remove"
            >
              remove
            </button>
          </template>
        </SelectTag>

        <SelectInput class="input input-inline" placeholder="Search roles" />
      </SelectControl>

      <SelectContent class="content">
        <SelectOption
          v-for="option in options"
          :id="`slot-${option.id}`"
          :key="option.id"
          :value="option.id"
          :label="option.label"
          class="option"
        >
          {{ option.label }}
        </SelectOption>
        <SelectEmpty class="empty">No matching role</SelectEmpty>
      </SelectContent>

      <SelectLiveRegion />
    </SelectRoot>

    <div class="meta">
      <div>Values: {{ JSON.stringify(values) }}</div>
    </div>
  </section>
</template>

<style scoped>
.custom-tag {
  background: #141414;
  border: 1px solid #1f1f1f;
  border-radius: 999px;
  color: #f5f5f5;
  padding: 3px 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.custom-tag-label {
  color: green;
  font-size: 0.82rem;
}

.custom-tag-remove {
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: inherit;
  border-radius: 999px;
  font-size: 0.72rem;
  line-height: 1;
  padding: 2px 6px;
  cursor: pointer;
  color: red;
}

.custom-tag-remove:hover {
  border-color: rgba(255, 255, 255, 0.6);
}
</style>
