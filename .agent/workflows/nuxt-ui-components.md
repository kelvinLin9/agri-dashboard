---
description: how to correctly use Nuxt UI components (v4) in this project
---

# Nuxt UI v4 Component Usage Guide

This project uses **Nuxt UI v4.2+**. Follow these patterns to avoid common mistakes.

## Form Components

### UFormField (NOT UFormGroup)

```vue
<!-- ✅ Correct -->
<UFormField label="Email" required>
  <UInput v-model="email" placeholder="Enter email" />
</UFormField>

<!-- ❌ Wrong - UFormGroup is deprecated -->
<UFormGroup label="Email">
  <UInput v-model="email" />
</UFormGroup>
```

### USelectMenu (Advanced) vs USelect (Basic)

Use `USelectMenu` for most cases (searchable, supports objects):

```vue
<script setup>
// Items should have 'label' and 'value' properties
const options = [
  { label: 'High (1080p)', value: 'high' },
  { label: 'Medium (720p)', value: 'medium' },
  { label: 'Low (480p)', value: 'low' },
]
const selected = ref('medium')
</script>

<!-- ✅ Correct - uses :items and value-key -->
<USelectMenu
  v-model="selected"
  :items="options"
  value-key="value"
  placeholder="Select quality"
/>

<!-- ❌ Wrong - :options is v2 syntax -->
<USelect
  v-model="selected"
  :options="options"
/>
```

## Button Colors

```vue
<!-- ✅ Correct v4 colors -->
<UButton color="primary" />
<UButton color="error" />     <!-- NOT 'red' -->
<UButton color="success" />   <!-- NOT 'green' -->
<UButton color="warning" />   <!-- NOT 'yellow' -->
<UButton color="neutral" />   <!-- NOT 'gray' -->

<!-- ❌ Wrong - old color names -->
<UButton color="red" />
<UButton color="gray" />
```

## UCard Slots

```vue
<UCard>
  <template #header>
    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Title</h3>
  </template>

  <!-- Default slot for body content -->
  <p>Content goes here</p>

  <template #footer>
    <div class="flex justify-end gap-2">
      <UButton label="Cancel" color="neutral" variant="soft" />
      <UButton label="Save" />
    </div>
  </template>
</UCard>
```

## Dark Mode Pattern

Always use light/dark variants:

```vue
<!-- ✅ Correct - supports both modes -->
<div class="bg-gray-100 dark:bg-gray-900">
  <h1 class="text-gray-900 dark:text-white">Title</h1>
  <p class="text-gray-600 dark:text-gray-400">Description</p>
</div>

<!-- ❌ Wrong - hardcoded dark colors -->
<div class="bg-gray-900">
  <h1 class="text-white">Title</h1>
</div>
```

## References

- [Nuxt UI Documentation](https://ui.nuxt.com/docs)
- Use the `nuxt-ui` MCP tool for component details
