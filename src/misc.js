
const PINO_LVL = {
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60
}
Object.entries(PINO_LVL).forEach(([name, level])=>{
    PINO_LVL[level] = name
})

module.exports = {
    PINO_LVL
}
