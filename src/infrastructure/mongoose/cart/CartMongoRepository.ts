import { CartRepository } from "../../../domain/cart/CartRepository";
import { CartItem } from "../../../domain/cart/CartItem";
import { CartItemModel } from "./CartItemSchema";
import { Types } from "mongoose";
import { Product } from "../../../domain/product/Product";

export class CartMongoRepository implements CartRepository {

  async addToCart(cartItem: CartItem): Promise<CartItem> {
    const cartItemData = {
      userId: cartItem.userId,
      productId: cartItem.productId, // Use UUID directly
      quantity: cartItem.quantity,
      addedAt: cartItem.addedAt
    };

    if (cartItem.id) {
      // Update existing cart item
      const updated = await CartItemModel.findByIdAndUpdate(
        cartItem.id,
        cartItemData,
        { new: true, runValidators: true }
      );
      
      if (!updated) {
        throw new Error('Cart item not found');
      }
      
      return this.mapToCartItem(updated);
    } else {
      // Create new cart item
      const created = await CartItemModel.create(cartItemData);
      return this.mapToCartItem(created);
    }
  }


  async getCartItems(userId: string): Promise<CartItem[]> {
    const items = await CartItemModel.find({ userId }).lean();

    try {
      return items.map((item) => this.mapToCartItem(item));
    } catch (error) {
      console.error("❌ Error al mapear items:", error);
      throw new Error("Error al mapear items del carrito");
    }
  }

  async removeFromCart(cartItemId: string): Promise<void> {
    await CartItemModel.findByIdAndDelete(cartItemId);
  }

  async clearCart(userId: string): Promise<void> {
    await CartItemModel.deleteMany({ userId });
  }

  private mapToCartItem(doc: any): CartItem {
    const data = doc.toObject ? doc.toObject() : doc;
    return new CartItem(
      data.userId,
      data.productId,
      data.quantity,
      data.addedAt,
      data._id.toString()
    );
  }
}
