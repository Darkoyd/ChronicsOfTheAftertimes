<template>
    <div class="flex flex-row font-mono">
        <ContentDoc :path="args[0]"/>
    </div>

</template>
<script setup lang="ts">
const props = defineProps<{
    command: string,
    args: string[]
}>()
</script>