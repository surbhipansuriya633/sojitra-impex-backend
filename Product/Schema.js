import mongoose from "mongoose";

const detailSchema = new mongoose.Schema({
    fabric: String,
    blouse: String,
    pattern: String,
    border: String,
    netQuantity: String,
    sareeLength: String,
    blouseLength: String,
    origin: String,
});

const productSchema = new mongoose.Schema(
    {
        id: { type: String, unique: true, required: true }, // unique auto-generated id
        name: { type: String, required: true },
        description: String,
        BrandName: {
            type: String,
            enum: ["VT Trading", "XYZ Fashion", "Classic Sarees"], // ✅ only 3 options
            required: true,
        },
        price: Number,
        originalPrice: Number,
        discount: String,
        dealTime: String,
        rating: Number,
        reviews: Number,
        freeDelivery: Boolean,
        size: String,
        details: detailSchema, // ✅ your details schema
        image: {
            url: String,
            public_id: String,
        },
        hoverImage: {
            url: String,
            public_id: String,
        },
        thumbnails: [
            {
                url: String,
                public_id: String,
            },
        ],
        category: {
            type: String,
            enum: ["Saree", "Kurti", "jwellery"],
            required: true
        },
        meesholink: String,
        flipkartlink: String,
        showInCarousel: { type: Boolean, default: false },
        trending: { type: Boolean, default: false },
        productreview: [
            {
                url: String,
                public_id: String,
            },
        ],
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);


export default Product;
