export class Product {
    constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly price: number,
        public readonly category: string,
        public readonly stockQuantity: number,
        public readonly id?: string,
    ) { }

    public hasStock(): boolean {
        return this.stockQuantity > 0;
    }
}
