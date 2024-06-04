<template>
    <div class="flex flex-col font-mono" v-for="cmd in commands">
        <div class="flex flex-row">
            <p class="text-green-600">user@host:~$</p>
            <div class="pl-2">{{ cmd.command }} {{ cmd.args.join(" ") }}</div>
        </div>
        <CommandResponse :command="cmd.command" :args="cmd.args"/>
    </div>
    <div class="flex flex-row font-mono">
        <p class="text-green-600">user@host:~$</p> <input class="ml-2 bg-black outline-none" v-model="newCommand" @keyup.enter="addCommand()" autofocus onblur="this.focus()">
    </div>
</template>

<script setup lang="ts">
const commands = ref([{
    command: "cat",
    args: ["test"]
}])

const newCommand = ref("")

const addCommand = () => {
    let line = newCommand.value.split(" ")
    let cmd = line.shift()
    let newLine = {
        command: cmd || "",
        args: line
    }
    commands.value.push(newLine)
    console.log(newLine)
    newCommand.value = ""
}



</script>

<style>
h1 {
    color: red
}
</style>