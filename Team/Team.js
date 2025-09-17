import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
    {
        id: { type: String, unique: true, required: true }, // unique string ID
        name: { type: String, required: true },
        role: {
            type: String,
            enum: ["Design Team Lead", "Developer", "Manager", "Other"], // limited roles
            required: true,
        },
        description: { type: String },
        image: {
            url: String,
            public_id: String,
        },
        showOnWebsite: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
export default Team;
