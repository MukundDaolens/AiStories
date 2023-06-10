import express from 'express';
import axios from 'axios';
import Constants from './constants.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(express.json());

const url = 'https://api.openai.com/v1/chat/completions';

app.get('/', (req, res) => res.send('works'));

app.post('/tell-a-story', async (request, response) => {

    const { character } = request.body;
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_KEY}`
        };

        const messages = [
            {
                "role": "system", "content": Constants.storyTellerSystemMessage
            },
            {
                "role": "user", "content": `This is the character "${character}".`
            }
        ];

        const payload = {
            model: "gpt-4",
            messages,
            stream: true
        };

        const completion = await axios.post(url, payload, {
            headers,
            responseType: 'stream'
        });

        const res = completion.data;

        res.on('data', (dataBuf) => {

            let datas = dataBuf.toString().split("\n");
            datas = datas.map((line) => line.replace(/^data: /, '').trim()).filter((line) => line !== '');

            for (let data of datas) {
                if (data === '[DONE]') {
                    return response.end();
                }
                try {
                    data = JSON.parse(`${data}`);
                    const text = data.choices[0].delta.content;
                    if (text) {
                        response.write(text);
                    }
                } catch (error) {
                    console.log(data);
                    console.log(error);
                }
            }
        });
    } catch (error) {
        console.log(error);
        return response.status(500).send(error);
    }
});


app.post('/question', async (request, response) => {

    const { story, question } = request.body;

    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_KEY}`
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
            model: "gpt-4",
            messages,
            stream: true
        };

        const completion = await axios.post(url, payload, {
            headers,
            responseType: 'stream'
        });

        const res = completion.data;

        res.on('data', (dataBuf) => {

            let datas = dataBuf.toString().split("\n");
            datas = datas.map((line) => line.replace(/^data: /, '').trim()).filter((line) => line !== '');

            for (let data of datas) {
                if (data === '[DONE]') {
                    return response.end();
                }
                try {
                    data = JSON.parse(`${data}`);
                    const text = data.choices[0].delta.content;
                    if (text) {
                        response.write(text);
                    }
                } catch (error) {
                    console.log(data);
                    console.log(error);
                }
            }
        });

    } catch (error) {
        console.log('Error', error);
        return response.status(500).send(error);
    }
});

async function sleep(seconds) {
    await new Promise(resolve => setTimeout(resolve, seconds));
}

app.listen(4000, () => {
    console.log(`Server listening on port 4000`);
});
