<script setup lang="ts">
interface TableItem {
  name: string
  type: string
  default: string
  description: string
}

withDefaults(
  defineProps<{
    props?: TableItem[]
    slots?: TableItem[]
    events?: TableItem[]
  }>(),
  {
    props: () => [],
    slots: () => [],
    events: () => [],
  },
)
</script>

<template>
  <div>
    <table v-if="props.length" class="prop-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prop in props" :key="prop.name">
          <td><code>{{ prop.name }}</code></td>
          <td><code>{{ prop.type }}</code></td>
          <td><code>{{ prop.default }}</code></td>
          <td>{{ prop.description }}</td>
        </tr>
      </tbody>
    </table>

    <table v-if="slots.length" class="prop-table">
      <thead>
        <tr>
          <th>Slot</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="slot in slots" :key="slot.name">
          <td><code>{{ slot.name }}</code></td>
          <td><code>{{ slot.type }}</code></td>
          <td><code>{{ slot.default }}</code></td>
          <td>{{ slot.description }}</td>
        </tr>
      </tbody>
    </table>

    <table v-if="events.length" class="prop-table">
      <thead>
        <tr>
          <th>Event</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="event in events" :key="event.name">
          <td><code>{{ event.name }}</code></td>
          <td><code>{{ event.type }}</code></td>
          <td><code>{{ event.default }}</code></td>
          <td>{{ event.description }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
