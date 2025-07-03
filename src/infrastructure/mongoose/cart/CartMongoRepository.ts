import { CartRepository } from "../../../domain/cart/CartRepository";
import { CartItem } from "../../../domain/cart/CartItem";
import { CartItemModel } from "./CartItemSchema";
import { Types } from "mongoose";
import { Product } from "../../../domain/product/Product";

export class CartMongoRepository implements CartRepository {

  async addToCart(cartItem: CartItem): Promise<CartItem> {
    const created = await CartItemModel.create({
      userId: cartItem.userId,
      productId: new Types.ObjectId(cartItem.productId), // ← conversión
      quantity: cartItem.quantity,
      addedAt: cartItem.addedAt
    });

    return new CartItem(
      created.userId,
      created.productId.toString(),
      created.quantity,
      created.addedAt,
      created.id.toString()
    );
  }


  async getCartItems(userId: string): Promise<CartItem[]> {
    const items = await CartItemModel.find({ userId })
      .populate("productId")
      .lean();

    try {
      return items.map((item) => {
        const product = item.productId as any;

        const productEntity = new Product(
          product.name,
          product.description,
          product.price,
          product.category,
          product.stockQuantity,
          product._id.toString()
        );

        return new CartItem(
          item.userId,
          product._id.toString(),
          item.quantity,
          item.addedAt,
          item._id.toString(),
          productEntity
        );
      });
    } catch (error) {
      console.error("❌ Error al mapear items:", error);
      throw new Error("Error al mapear items del carrito");
    }
  }


  async removeFromCart(cartItemId: string): Promise<void> {
    await CartItemModel.deleteOne({ id: cartItemId });
  }

  async clearCart(userId: string): Promise<void> {
    await CartItemModel.deleteMany({ userId });
  }
}
