import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Welcome to Chat GPT Lite',
    });
})

app.post('/', async (req, res) => {
    try {
        const query = req.body.query;

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${query}`,
            temperature: 0, // Higher temperature values means model will take more risk
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });

        res.status(200).send({
            bot: response.data.choices[0].text,
        })
    } catch (error) {
        res.status(500).send({ error });
    }
});

app.listen(5000, () => {
    console.log('Server is running....');
})