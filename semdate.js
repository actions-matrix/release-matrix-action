const semdate = {
    /**
     * Match YYYY-MM-DD date range
     * @param {*} date Date string to match
     * @param {*} range Range pattern for date
     * @returns {boolean} True if date matches range
     * 
     * @example
     * satisfies("2021-01-01", ">=2021-01-01") // true
     * satisfies("2021-01-01", "<2021-01-01") // false
     * satisfies("2021-01-01", ">=2021-02-01") // false
     * satisfies("2021-01-01", "<2021-02-01") // true
     * 
     * TODO: Implement range pattern for date
     * satisfies("2021-01-01", ">=2021-01-01 <2021-02-01") // true
     */
    satisfies(date = "", range = "") {
        const [operator, value] = range.split(/(>=|<=|>|<|=)/).filter(Boolean)
        const target = new Date(date)
        const compare = new Date(value)

        switch (operator) {
            case ">=":
                return target >= compare
            case "<=":
                return target <= compare
            case ">":
                return target > compare
            case "<":
                return target < compare
            case "=":
                return target === compare
            default:
                return false
        }
    }
}

module.exports = semdate;
