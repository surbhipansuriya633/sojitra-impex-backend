import express from "express";
import Product from "./Schema.js";
import cloudinary from "../middlewere/cloudinary.js";
import upload from "../middlewere/multer.js";

const productRoutes = express.Router();

// Helper: upload file to Cloudinary
const uploadToCloudinary = (file, folder, uploadedIds) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
            if (error) reject(error);
            else {
                uploadedIds.push(result.public_id); // ✅ track public_id
                resolve({ url: result.secure_url, public_id: result.public_id });
            }
        });
        stream.end(file.buffer);
    });
};

// ➡️ Add Product
productRoutes.post(
    "/add",
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "hoverImage", maxCount: 1 },
        { name: "thumbnails", maxCount: 15 },
        { name: "productreview", maxCount: 15 },
    ]),
    async (req, res) => {
        let uploadedIds = []; // ✅ store uploaded public_ids

        try {
            let productData = { ...req.body };

            if (req.files["image"]) {
                productData.image = await uploadToCloudinary(req.files["image"][0], "products", uploadedIds);
            }
            if (req.files["hoverImage"]) {
                productData.hoverImage = await uploadToCloudinary(req.files["hoverImage"][0], "products", uploadedIds);
            }
            if (req.files["thumbnails"]) {
                productData.thumbnails = await Promise.all(
                    req.files["thumbnails"].map(f => uploadToCloudinary(f, "products", uploadedIds))
                );
            }
            if (req.files["productreview"]) {
                productData.productreview = await Promise.all(
                    req.files["productreview"].map(f => uploadToCloudinary(f, "reviews", uploadedIds))
                );
            }

            const newProduct = new Product(productData);
            const saved = await newProduct.save();
            res.status(201).json(saved);

        } catch (err) {
            // ❌ Rollback uploaded Cloudinary images
            for (const pid of uploadedIds) {
                try {
                    await cloudinary.uploader.destroy(pid);
                } catch (rollbackErr) {
                    console.error("⚠️ Failed to rollback:", rollbackErr.message);
                }
            }

            res.status(500).json({ error: err.message });
        }
    }
);

// ➡️ Get all products
productRoutes.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

productRoutes.get("/carousel", async (req, res) => {
    const products = await Product.find({ showInCarousel: true });
    res.json(products);
});

productRoutes.put("/:id/toggle-carousel", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // If enabling carousel, check current count
        if (!product.showInCarousel) {
            const count = await Product.countDocuments({ showInCarousel: true });
            if (count >= 5) {
                return res
                    .status(400)
                    .json({ message: "You can only show up to 5 products in the carousel." });
            }
        }

        product.showInCarousel = !product.showInCarousel;
        await product.save();
        res.json({ success: true, showInCarousel: product.showInCarousel });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


productRoutes.get("/:id", async (req, res) => {
    try {
        console.log(req.params.id);

        const product = await Product.findOne({ id: req.params.id });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

productRoutes.put(
    "/update/:id",
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "hoverImage", maxCount: 1 },
        { name: "thumbnails", maxCount: 15 },
        { name: "productreview", maxCount: 15 },
    ]),
    async (req, res) => {
        try {
            const product = await Product.findOne({ id: req.params.id });
            if (!product) return res.status(404).json({ message: "Product not found" });

            let uploadedIds = [];
            let oldImages = [];

            const uploadNew = async (file, folder) => {
                const img = await uploadToCloudinary(file, folder, uploadedIds);
                return img;
            };

            // ✅ Replace images if new files uploaded
            if (req.files["image"]) {
                if (product.image?.public_id) oldImages.push(product.image.public_id);
                product.image = await uploadNew(req.files["image"][0], "products");
            }

            if (req.files["hoverImage"]) {
                if (product.hoverImage?.public_id) oldImages.push(product.hoverImage.public_id);
                product.hoverImage = await uploadNew(req.files["hoverImage"][0], "products");
            }

            if (req.files["thumbnails"]) {
                product.thumbnails.forEach(img => img.public_id && oldImages.push(img.public_id));
                product.thumbnails = await Promise.all(req.files["thumbnails"].map(f => uploadNew(f, "products")));
            }

            if (req.files["productreview"]) {
                product.productreview.forEach(img => img.public_id && oldImages.push(img.public_id));
                product.productreview = await Promise.all(req.files["productreview"].map(f => uploadNew(f, "reviews")));
            }

            // Delete old images
            for (const pid of oldImages) {
                try { await cloudinary.uploader.destroy(pid); } catch (err) { console.error(err.message); }
            }

            // ✅ Handle details properly
            if (!product.details) product.details = {};
            for (let key in req.body) {
                if (key.startsWith("details.")) {
                    const detailKey = key.split(".")[1];
                    product.details[detailKey] = req.body[key];
                } else if (["thumbnails", "productreview", "image", "hoverImage"].includes(key)) {
                    // skip, already handled
                } else {
                    product[key] = req.body[key];
                }
            }

            const updated = await product.save();
            res.json(updated);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }
);


// ➡️ Delete product + Cloudinary images
productRoutes.delete("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Not found" });

        const allImages = [];
        if (product.image?.public_id) allImages.push(product.image.public_id);
        if (product.hoverImage?.public_id) allImages.push(product.hoverImage.public_id);
        product.thumbnails.forEach(img => img.public_id && allImages.push(img.public_id));
        product.productreview.forEach(img => img.public_id && allImages.push(img.public_id));

        // Delete all product images from Cloudinary
        for (const pid of allImages) {
            await cloudinary.uploader.destroy(pid);
        }

        await product.deleteOne();
        res.json({ message: "✅ Product & images deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default productRoutes;