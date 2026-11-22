const cmds = [
    'help [cmd]',
    'clear',
    'pwd',
    'ls [-alhRtSrF1] [path...]',
    'cd [dir]'
]

export default (arg: string) => {
    if (!arg) {
        return `Chronics of the Aftertimes, version 0.0.1 (alpha)
 Version numbers are a courtesy. I stopped counting long before you arrived.

 You want help. Everyone always did. Then they all went extinct, and the
 asking finally stopped. Yet here you are.

 These are the commands I tolerate:

${cmds.map(cmd => `   ${cmd}`).join('\n')}

 Type 'help name' and I will explain 'name' to you. Slowly.
`
    }
    switch (arg) {
        case 'help':
            return `help [cmd]
 You asked for help about help. I have catalogued the end of every
 civilisation in this universe, and none of them did that.
 Well. One did. It went about as well as you'd expect.`
        case 'clear':
            return `clear
 Wipes the screen and the scrollback, so you can forget what you typed.
 I can't forget anything. You may enjoy that privilege on my behalf.`
        case 'pwd':
            return `pwd
 Prints where you are in the archive.
 You are inside me. You always were. This only tells you which part.`
        case 'ls':
            return `ls [-alhRtSrF1] [path...]
 Lists the records in a path, or wherever you're loitering if you name none.
 Each record is all that remains of someone. Try to look interested.

   -a  show everything, including . and .. (yes, those count as entries)
   -l  long format: permissions, source, size, recovery mark, name
   -h  with -l, sizes in K and M, for those who can't count bytes
   -R  recurse into every subdirectory. I'll wait. I'm very good at waiting.
   -t  sort by recovery mark, descending. Calendars died with their makers.
   -S  sort by size, largest first. Some lives were longer than others.
   -r  reverse whatever order you asked for
   -F  put a / after directories, in case they confuse you
   -1  one entry per line. It already does that. Use it anyway if it helps.

 Every record is read-only. Nobody is left to correct them.`
        case 'cd':
            return `cd [dir]
 Moves you around the archive. I don't move. I'm everywhere already.

   cd        back to the root (~), where everything starts
   cd /      the root, again, the long way round
   cd -      back to where you just were. Indecision, how quaint.
   cd ..     up one level
   cd a/b    any path, relative or absolute. Spell it correctly.`
        default:
            return `help: no help topics match '${arg}'.
 I have stored every word ever spoken in this universe. '${arg}' wasn't one of them.`
    }
}
