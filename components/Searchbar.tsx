"use client";
import { spcrapeAndStoreProduct } from "@/lib/actions";
import { error } from "console";
import React, { FormEvent, useState } from "react";

const isValidAmazonProductURL = (productUrl: string) => {
  try {
    const parsedURL = new URL(productUrl);
    const hostname = parsedURL.hostname;

    if (
      hostname.includes("amazon.com") ||
      hostname.includes("amazon.in") ||
      hostname.includes("amazon.") ||
      hostname.endsWith("amazon")
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
};

const Searchbar = () => {
  const [searchPromt, setSearchPromt] = useState("");
  const [isloading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValidLink = isValidAmazonProductURL(searchPromt);

    // alert(isValidLing? "valid link" :"invalid link")
    if (!isValidLink) return alert("Please Provide Valid Link");

    try {

        setIsLoading(true)

        //Scraping the prdoduct
        const product = await spcrapeAndStoreProduct(searchPromt)
    } catch (error) {
        console.log(error)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchPromt}
        onChange={(e) => setSearchPromt(e.target.value)}
        placeholder="Enter product link"
        className="searchbar-input"
      />
      <button type="submit" className="searchbar-btn"
      disabled = {isloading}>
        
        {isloading? 'Searching...' : 'Search'}
      </button>
    </form>
  );
};

export default Searchbar;
