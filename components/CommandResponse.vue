<template>
    <div class="flex flex-row font-mono whitespace-pre-wrap">
        {{ parseCommand() }}
    </div>

</template>
<script setup lang="ts">
const props = defineProps<{
    command: string,
    args: string[]
}>()

const parseCommand = () => {
    switch (props.command) {
        case "help":
            return help(props.args[0])
        default:
            return props.command + ": command not found"
    }
}
</script>