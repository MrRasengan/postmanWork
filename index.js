const express = require('express');
const fs = require('fs');
const path = require('path');
const Joi = require('joi');

const app = express();

let uniqueID = 1;

const usersSchema = Joi.object({
    firstName: Joi.string().min(2).max(30).required(),
    secondName: Joi.string().min(3).required(),
    age: Joi.number().min(0).required(),
    city: Joi.string().min(2)
});

const usersListPath = path.join(__dirname, 'users.json');

// Чтение данных из файла при запуске сервера
let usersData = [];
try {
    const usersJson = fs.readFileSync(usersListPath, 'utf-8');
    usersData = JSON.parse(usersJson);
} catch (error) {
    console.error('Ошибка чтения файла пользователей:', error);
}

app.use(express.json());

// Получить всех пользователей
app.get('/users', (req, res) => {
    res.send({ users: usersData });
});

// Получить конкретного пользователя
app.get('/users/:id', (req, res) => {
    const user = usersData.find((user) => user.id === Number(req.params.id));

    if (user) {
        res.send({ user });
    } else {
        res.status(404).send({
            user: null,
            message: "Пользователь не найден"
        });
    }
});

// Создание нового пользователя
app.post('/users', (req, res) => {
    const validateData = usersSchema.validate(req.body);
    if (validateData.error) {
        return res.status(400).send({ error: validateData.error.details });
    }

    uniqueID += 1;
    const newUser = {
        id: uniqueID,
        ...req.body
    };
    usersData.push(newUser);

    fs.writeFileSync(usersListPath, JSON.stringify(usersData));

    res.send({ id: uniqueID });
});

// Обновление пользователя
app.put('/users/:id', (req, res) => {
    const validateData = usersSchema.validate(req.body);
    if (validateData.error) {
        return res.status(400).send({ error: validateData.error.details });
    }

    const userIndex = usersData.findIndex((user) => user.id === Number(req.params.id));

    if (userIndex !== -1) {
        usersData[userIndex] = {
            id: usersData[userIndex].id,
            ...req.body
        };

        fs.writeFileSync(usersListPath, JSON.stringify(usersData));

        res.send({ user: usersData[userIndex] });
    } else {
        res.status(404).send({
            user: null,
            message: "Пользователь не найден"
        });
    }
});

// Удаление пользователя
app.delete('/users/:id', (req, res) => {
    const userIndex = usersData.findIndex((user) => user.id === Number(req.params.id));

    if (userIndex !== -1) {
        usersData.splice(userIndex, 1);
        fs.writeFileSync(usersListPath, JSON.stringify(usersData));

        res.send({ message: 'Пользователь успешно удален!' });
    } else {
        res.status(404).send({ message: 'Пользователь не найден!' });
    }
});

// Обработка несуществующих роутов
app.use((req, res) => {
    res.status(404).send({
        message: 'URL not found'
    });
});

app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});
