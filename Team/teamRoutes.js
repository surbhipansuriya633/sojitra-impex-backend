import express from "express";
import cloudinary from "../middlewere/cloudinary.js";
import Team from "./Team.js";
import upload from "../middlewere/multer.js";

const teamRoutes = express.Router();

// Helper to upload file to Cloudinary
const uploadToCloudinary = (file, folder, uploadedIds) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
            if (err) reject(err);
            else {
                uploadedIds.push(result.public_id);
                resolve({ url: result.secure_url, public_id: result.public_id });
            }
        });
        stream.end(file.buffer);
    });
};

// ➡️ Add Team Member
teamRoutes.post(
    "/add",
    upload.single("image"),
    async (req, res) => {
        const uploadedIds = [];
        try {
            const { id, name, role, description, showOnWebsite } = req.body;

            let image = {};
            if (req.file) {
                image = await uploadToCloudinary(req.file, "team", uploadedIds);
            }

            const member = new Team({
                id,
                name,
                role,
                description,
                showOnWebsite,
                image,
            });

            const saved = await member.save();
            res.status(201).json(saved);
        } catch (err) {
            for (const pid of uploadedIds) {
                try { await cloudinary.uploader.destroy(pid); } catch { }
            }
            res.status(500).json({ error: err.message });
        }
    }
);

// ➡️ Get All Members
teamRoutes.get("/", async (req, res) => {
    try {
        const members = await Team.find();
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ➡️ Get by ID
teamRoutes.get("/:id", async (req, res) => {
    try {
        const member = await Team.findOne({ id: req.params.id });
        if (!member) return res.status(404).json({ message: "Not found" });
        res.json(member);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ➡️ Update Member
teamRoutes.put(
    "/update/:id",
    upload.single("image"),
    async (req, res) => {
        const uploadedIds = [];
        try {
            const member = await Team.findOne({ id: req.params.id });
            if (!member) return res.status(404).json({ message: "Not found" });

            // Upload new image
            if (req.file) {
                if (member.image?.public_id) await cloudinary.uploader.destroy(member.image.public_id);
                member.image = await uploadToCloudinary(req.file, "team", uploadedIds);
            }

            // Update fields
            for (let key in req.body) {
                member[key] = req.body[key];
            }

            const updated = await member.save();
            res.json(updated);
        } catch (err) {
            for (const pid of uploadedIds) {
                try { await cloudinary.uploader.destroy(pid); } catch { }
            }
            res.status(500).json({ error: err.message });
        }
    }
);

// ➡️ Delete Member
teamRoutes.delete("/:id", async (req, res) => {
    try {
        const member = await Team.findOne({ id: req.params.id });
        if (!member) return res.status(404).json({ message: "Not found" });

        if (member.image?.public_id) {
            await cloudinary.uploader.destroy(member.image.public_id);
        }

        await member.deleteOne();
        res.json({ message: "✅ Member deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default teamRoutes;
