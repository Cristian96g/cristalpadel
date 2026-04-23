import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "Admin",
        trim: true,
        maxlength: 40,
    },
    lastName: {
        type: String,
        default: "",
        trim: true,
        maxlength: 40,
    },
    email: { type: String, unique: true, lowercase: true, trim: true, maxlength: 120 },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
});

export default mongoose.model("User", userSchema);
