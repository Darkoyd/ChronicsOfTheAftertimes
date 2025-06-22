const cmds = [
    'help [cmd]',
    'clear',
    'ls'     
]

export default (arg: string) => {
    if (!arg) {
        return `Chronics of the Aftertimes, version 0.0.1 (alpha) \n 
    These shell commands are defined internally. Type 'help' to see this list. \n 
    Type 'help name' to find out more about the function 'name'. \n \n
    ${cmds.map(cmd => `  ${cmd}`).join('\n')} \n`
    } else {
        switch (arg) {
            case 'clear':
                return 'clear \n Clears the terminal screen and scrollback buffer.'
            case 'ls':
                return 'ls \n Lists the contents of the content folder.'
        }
    }
}