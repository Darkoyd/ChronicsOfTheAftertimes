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
            return await ls(props.args)
        case "cd":
            return await cd(props.args)
        case "pwd":
            return useDirectory().getCurrentDirectory()
        default:
            return props.command
                ? `${props.command}: command not found\nEvery language ever spoken is in my memory, and none of them had that word.`
                : "" // a bare Enter is not an error, merely a pause
    }
}

onMounted(async () => {
    response.value = await parseCommand()
})
</script>