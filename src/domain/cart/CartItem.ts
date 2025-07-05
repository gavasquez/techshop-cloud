import { Product } from "../product/Product";

export class CartItem {
    constructor(
        public readonly userId: string,
        public readonly productId: string,
        public quantity: number,
        public readonly addedAt: Date = new Date(),
        public readonly id: string = '', // Empty string for new cart items, MongoDB will generate _id
        public readonly product?: Product 
    ) { }
}
