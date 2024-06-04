<template>
    <div class="flex flex-row font-mono">
        <ContentDoc path="/test 2.md"/>
    </div>

</template>
<script setup lang="ts">
const props = defineProps<{
    command: string,
    args: string[]
}>()
</script>