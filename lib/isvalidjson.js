module.exports = s => {
    try {
        JSON.parse(s)
        return true
    } catch (e) {
        return false
    }
}