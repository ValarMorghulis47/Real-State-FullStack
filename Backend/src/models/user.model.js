import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
    },
    avatarPublicId: {
        type: String,
        required: true,
        default: "12345"
    },
    avatar: {
        type: String, // Cloudinary URL
        required: true,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUhvgMYGOcSZXmbHOuSP4a84MTXAYC_vzD6-0-d9exhg&s"
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    passwordRefreshToken: {
        type: String,
    },
    passwordResetTokenExpiry: {
        type: Date
    }
    // refreshToken: {
    //     type: String,
    // },
    // refreshTokenExpiry: {
    //     type: String,
    //     expires: process.env.REFRESH_TOKEN_EXPIRY, // Token expiration in MongoDB
    //     // Don't include in query results
    // },
}, {
    timestamps: true
})
//we want the "this" reference that's why we used function not callback function like arrow function and since it is a middleware we have to use the next flag
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
        next()
    }
    else {
        return next();
    }
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generatePasswordRefreshToken = function () {
    const Token = crypto.randomBytes(20).toString("hex")
    // for converting into readable String
    const cryptoToken = crypto.createHash("sha256").update(Token).digest("hex");
    this.passwordRefreshToken = cryptoToken;
    this.passwordResetTokenExpiry = Date.now() + 15 * 60 * 1000; //only valid for 15 minutes
    return cryptoToken;
}
export const User = mongoose.model("User", userSchema)