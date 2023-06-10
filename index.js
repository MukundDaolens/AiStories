import express from 'express';
import axios from 'axios';
import Constants from './constants.js';
const app = express();

app.use(express.json());

app.get('/', (req, res) => res.send('works'));

app.post('/tell-a-story', async (request, response) => {

    const { character } = request.body;
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Constants.apiKey}`
        };

        const messages = [
            {
                "role": "system", "content": Constants.questionSystemMessage
            },
            {
                "role": "user", "content": `This is the character ${character}`
            }
        ];

        const payload = {
            model: "gpt-3.5-turbo",
            messages
        };

        const completion = await axios.post(url, payload, {
            headers
        });

        const res = completion.data.choices[0].message.content;

        return response.send(res);
    } catch (error) {
        return response.sendStatus(500).send(error);
    }
});


app.post('/question', async (request, response) => {

    const { story, question } = request.body;

    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Constants.apiKey}`
        };

        const messages = [
            {
                "role": "system", "content": Constants.questionSystemMessage
            },
            {
                "role": "user", "content": `Answer the question on this story: "${story}"
The question is: ${question}`
            }
        ];

        const payload = {
            model: "gpt-3.5-turbo",
            messages
        };

        const completion = await axios.post(url, payload, {
            headers
        });

        const res = completion.data.choices[0].message.content;

        return response.send(res);

    } catch (error) {
        console.log('Error', error);
        return response.sendStatus(500).send(error);
    }
});

async function sleep(seconds) {
    await new Promise(resolve => setTimeout(resolve, seconds));
}

app.listen(4000, () => {
    console.log(`Server listening on port 4000`);
});