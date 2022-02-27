import mongoose from "mongoose"

export const mongo = () => {
    try {
        mongoose.connect(process.env.MONGO_URL)
        console.log("Mongodb connected")
    }
    catch (err) {
        process.exit()
    }
}