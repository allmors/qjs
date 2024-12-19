import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

class QjsAi {
    static async ask(payload = {}) {
        try {
            const response = await openai.createCompletion({
                prompt: payload.question,
                model: payload.model ?? "text-davinci-003",
                temperature: 0.7,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0.5,
                presence_penalty: 0.5,
                stream: payload.stream,
            });
            return payload.stream ? response.data : response.data.choices[0].text;
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw error;
        }
    }
}

export default QjsAi;