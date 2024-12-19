import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY ?? '',
});

class QjsAi {
    constructor(model, stream = false) {
        this.model = model
        this.stream = stream
    }

    async ask(question) {
        try {
            const response = await openai.chat.completions.create({
                messages: [
                    { role: "user", content: question }
                ],
                model: this.model ?? "gpt-3.5-turbo",
                stream: this.stream,
            });

            if (this.stream) {
                return response; // Returns a Stream object to be processed by the caller
            }

            return response.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw error;
        }
    }
}

export default QjsAi;