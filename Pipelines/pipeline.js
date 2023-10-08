class Pipeline {
    constructor() {
        this.filters = [];
    }

    use(filter) {
        this.filters.push(filter)
    }

    async run(input) {
        let result = input;
        for (const filter of this.filters) {
            result = await filter(result);
        }
        return result;
    }
}

module.exports = { Pipeline };