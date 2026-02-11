const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {name:String,
    email : String
    },
    {timeStamps : true}
)

module.export = mongoose.model("user", userSchema);