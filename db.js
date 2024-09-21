const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const User = new Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
})

const Todo = new Schema({
    title: String,
    done: Boolean,
    userId: Schema.ObjectId
})

const UserModel = mongoose.model('user', User);
const TodoModel = mongoose.model('todo', Todo);

module.exports = {
    UserModel,
    TodoModel
}