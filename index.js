const express = require('express');
const { UserModel, TodoModel } = require('./db');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, auth } = require('./auth');
const bcrypt = require('bcrypt');
const { z } = require('zod');

mongoose.connect('mongodb+srv://admin:MonAsh123@cluster0.ybt6c.mongodb.net/todo_zod');

const app = express();

app.use(express.json());

app.post('/signup', async (req, res) => {
    const requiredBody = z.object({
        name: z.string().min(3).max(100),
        email: z.string().min(3).max(100).email(),
        password: z.string().min(3).max(100)
    })

    const parsedDataWithSuccess = requiredBody.safeParse(req.body);

    if (!parsedDataWithSuccess.success) {
        res.json({
            msg: "Incorrect format!",
            error: parsedDataWithSuccess.error
        })
        return;
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    let errorThrown = false;
    try {
        const hashedPassword = await bcrypt.hash(password, 5);

        await UserModel.create({
            email,
            password: hashedPassword,
            name
        })

    } catch (e) {
        res.json({
            msg: "User already exists!"
        })
        errorThrown = true;
    }

    if(!errorThrown) {
        res.json({
            msg: "you are signed up!"
        })
    }
})

app.post('/signin', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const response = await UserModel.findOne({
        email
    })

    if (!response) {
        res.status(403).json({
            msg: "User doesn't exist!"
        })
        return;
    }

    const passwordMatch = await bcrypt.compare(password, response.password);

    if (!passwordMatch) {
        res.status(403).json({
            msg: "Invalid Credentials!"
        })
        return;
    }

    const token = jwt.sign({
        id: response._id.toString()
    }, JWT_SECRET)

    res.json({
        token
    })
})

app.post('/todo', auth, async (req, res) => {
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;

    await TodoModel.create({
        userId,
        title,
        done
    })

    res.json({
        msg: "Todo created!"
    })
})

app.get('/todos', auth, async (req, res) => {
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId
    })

    res.json({
        todos
    })
})

app.post('/done', (req, res) => {

})

app.listen(3000);