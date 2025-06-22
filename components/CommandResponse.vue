<template>
    <div class="flex flex-row font-mono whitespace-pre-wrap">
        {{ response }}
    </div>

</template>
<script setup lang="ts">
const props = defineProps<{
    command: string,
    args: string[]
}>()

const response = ref('')

const parseCommand = async () => {
    switch (props.command) {
        case "help":
            return help(props.args[0])
        case "ls":
            return await ls()
        default:
            return props.command + ": command not found"
    }
}

onMounted(async () => {
    response.value = await parseCommand()
})
</script>