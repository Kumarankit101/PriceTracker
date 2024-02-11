"use server";

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDb } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function spcrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    connectToDb();
    const scrapedProduct = await scrapeAmazonProduct(productUrl);
    if (!scrapedProduct) return;

    let product = scrapedProduct;
    const existingProduct = await Product.findOne({
      productUrl: scrapedProduct.productUrl,
    });

    if (existingProduct) {
      const updatedPriceHistry: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistry,
        lowestPrice: getLowestPrice(updatedPriceHistry),
        highestPrice: getHighestPrice(updatedPriceHistry),
        averagePrice: getAveragePrice(updatedPriceHistry),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { productUrl: scrapedProduct.productUrl },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`);
  }
}

export async function getProduct(productId: string) {
  try {
    connectToDb();
    const product = await Product.findOne({ _id: productId });
    if (!product) return null;

    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllProducts() {
  try {
    connectToDb();
    const product = await Product.find();
    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getSimilarProduct(productId: string) {
  try {
    connectToDb();
    const product = await Product.findById(productId);
    if (!product) return null;

    const similarProducts = await Product.find({ _id: {$ne: productId}}).limit(3);
    return similarProducts;
  } catch (error) {
    console.log(error);
  }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try {
    connectToDb
    const product =await Product.findById( productId);
    if(!product) return;

    const userExists = await product.users.some((user: User) => user.email === userEmail);
    if(!userExists){
      product.users.push({email:userEmail})
      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME")

      await sendEmail(emailContent, [userEmail]);
    }



  } catch (error) {
    console.log(error)
    
  }

  
}
