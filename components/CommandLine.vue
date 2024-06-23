<template>
    <div class="flex flex-col font-mono" v-for="cmd in commands">
        <div class="flex flex-row">
            <p class="text-green-600">user@host:~$</p>
            <div class="pl-2">{{ cmd.command }} {{ cmd.args.join(" ") }}</div>
        </div>
        <CommandResponse :command="cmd.command" :args="cmd.args"/>
    </div>
    <div class="flex flex-row font-mono">
        <p class="text-green-600">user@host:~$</p> <input class="ml-2 bg-black outline-none" v-model="newCommand" 
        @keyup.enter="addCommand()" @keyup.up="retrieveFromHistory(historyIndex--)" autofocus onblur="this.focus()">
    </div>
</template>

<script setup lang="ts">

const historyIndex = ref(0)

const commands = ref([])

const newCommand = ref("")

const addCommand = () => {
    let line = newCommand.value.split(" ")
    let cmd = line.shift()
    let newLine = {
        command: cmd || "",
        args: line
    }
    if (cmd === "clear") {
        commands.value = []
        newCommand.value = ""
        historyIndex.value = 0
        return
    }
    commands.value.push(newLine)
    historyIndex.value = commands.value.length-1
    newCommand.value = ""
}

const retrieveFromHistory = (index: number) => {
    if (index < 0 || index >= commands.value.length) return
    newCommand.value = commands.value[index].command + " " + commands.value[index].args.join(" ")
}



</script>

<style>
h1 {
    color: red
}
</style>