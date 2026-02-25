<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectTag,
} from 'vue-superselect'

const selected = ref<string[]>([])

interface TeamMember {
  id: string
  name: string
  role: string
  initials: string
}

const members: TeamMember[] = [
  { id: 'alice', name: 'Alice Chen', role: 'Lead', initials: 'AC' },
  { id: 'bob', name: 'Bob Martinez', role: 'Senior', initials: 'BM' },
  { id: 'carol', name: 'Carol Davis', role: 'Mid', initials: 'CD' },
  { id: 'dave', name: 'Dave Kim', role: 'Senior', initials: 'DK' },
  { id: 'eve', name: 'Eve Johnson', role: 'Junior', initials: 'EJ' },
]
</script>

<template>
  <div class="cs-demo">
    <SelectRoot
      v-model="selected"
      multiple
      :items="members"
      label-key="name"
      value-key="id"
    >
      <SelectControl v-slot="{ selectedItems, removeItem }" class="cs-control">
        <SelectTag
          v-for="item in selectedItems"
          :key="String(item.value)"
          :value="item.value"
          :label="item.label"
          @remove="removeItem"
          v-slot="{ label, remove }"
          class="cs-tag"
        >
          <span class="cs-tag-avatar">{{ members.find(m => m.id === item.value)?.initials }}</span>
          <span>{{ label }}</span>
          <button class="cs-tag-remove" @click="remove">&times;</button>
        </SelectTag>
        <SelectInput placeholder="Add team members..." class="cs-input" />
      </SelectControl>
      <SelectContent class="cs-content">
        <SelectOption
          v-for="member in members"
          :key="member.id"
          :value="member.id"
          :label="member.name"
          v-slot="{ selected: isSelected, active }"
          class="cs-option"
          :class="{
            'cs-option--selected': isSelected,
            'cs-option--active': active,
          }"
        >
          <span class="cs-avatar">{{ member.initials }}</span>
          <span class="cs-member-info">
            <span class="cs-member-name">{{ member.name }}</span>
            <span class="cs-member-role">{{ member.role }}</span>
          </span>
          <span v-if="isSelected" class="cs-check">&#10003;</span>
        </SelectOption>
      </SelectContent>
    </SelectRoot>
    <p class="demo-note">This styling is for demos only — the library ships zero CSS</p>
  </div>
</template>

<style scoped>
.cs-demo {
  max-width: 400px;
  position: relative;
}

.cs-control {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.375rem 0.5rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
  min-height: 40px;
}

.cs-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.cs-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.125rem 0.375rem;
  background: var(--vp-c-brand-soft);
  border-radius: 4px;
  font-size: 0.8125rem;
  color: var(--vp-c-brand-1);
}

.cs-tag-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: white;
  font-size: 0.5625rem;
  font-weight: 700;
}

.cs-tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  border-radius: 2px;
  font-size: 0.875rem;
  line-height: 1;
}

.cs-tag-remove:hover {
  background: var(--vp-c-brand-1);
  color: white;
}

.cs-input {
  flex: 1;
  min-width: 100px;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
  padding: 0.125rem 0.25rem;
}

.cs-input::placeholder {
  color: var(--vp-c-text-3);
}

.cs-content {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  max-height: 240px;
  overflow-y: auto;
  z-index: 50;
  padding: 4px;
}

.cs-option {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.cs-option--active {
  background-color: var(--vp-c-brand-soft);
}

.cs-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.cs-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--vp-c-bg-soft);
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}

.cs-member-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.cs-member-name {
  font-size: 0.9375rem;
  line-height: 1.25;
}

.cs-member-role {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  line-height: 1.25;
}

.cs-check {
  font-size: 0.875rem;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
</style>
