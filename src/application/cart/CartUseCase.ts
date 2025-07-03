import { CartRepository } from "../../domain/cart/CartRepository";
import { CartItem } from "../../domain/cart/CartItem";
import { v4 as uuidv4 } from "uuid";

export class CartUseCase {
  constructor(private readonly cartRepository: CartRepository) { }

  async addToCart(userId: string, productId: string, quantity: number): Promise<CartItem> {
    const cartItem = new CartItem(userId, productId, quantity);
    return await this.cartRepository.addToCart(cartItem);
  }

  async removeFromCart(cartItemId: string): Promise<void> {
    await this.cartRepository.removeFromCart(cartItemId);
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    return await this.cartRepository.getCartItems(userId);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepository.clearCart(userId);
  }
}
