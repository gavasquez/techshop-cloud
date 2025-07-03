import { CartItem } from "./CartItem";

export interface CartRepository {
    addToCart(cartItem: CartItem): Promise<CartItem>;
    removeFromCart(cartItemId: string): Promise<void>;
    getCartItems(userId: string): Promise<CartItem[]>;
    clearCart(userId: string): Promise<void>;
}
