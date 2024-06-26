import axios from 'axios';
export const translateTextGroq = async (message: any, messageLanguage: any, targetLanguage: any) => {
    try {
        const GROQ_API_KEY = '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';
        const url = "https://api.groq.com/openai/v1/chat/completions";
        const data = {
            messages: [
                {
                    role: "system",
                    content: "You are helpful translator, You will be provided a message, the language of the message (messageLanguage) and the language in which you have to translate the message (targetLanguage). You need to translate the message in the given language. You have to only provide the translated message, not any other message like here is your translated message or something else, only give the translated text",
                },
                {
                    role: "user",
                    content: `message=${message}; messageLanguage:${messageLanguage}; targetLanguage:${targetLanguage}`
                }
            ],
            model: "llama3-8b-8192",
        };

        const res = await axios.post(url, data, {
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            }
        })
        const translatedData = res.data;
        if (translatedData) {
            ////console.log(translatedData.choices[0].message.content)
            return translatedData.choices[0].message.content;
        } else {
            return null;
        }
    } catch (error) {
        ////console.log('error occured in grok translation', error);
        return null;
    }
}

export async function translateTextItranslate(message: string, messageLanguage: string, targetLanguage: string) {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    try {
        const response = await axios.post(`${serverUrl}/translate`, {
            message: message,
            targetLanguage: targetLanguage,
            currentLanguage: messageLanguage
        })
        if (response.status == 200) {
            console.log("response ", response);
            return response.data;
        } else {
            return "null";
        }

    } catch (e) {
        ////console.log('error during translation', e);
        return null;
    }
}
export async function translateTextOpenAi(message: string, messageLanguage: string, targetLanguage: string) {
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/openAi`, {
            text: message,
            targetLanguage: targetLanguage,
            currentLanguage: messageLanguage
        })
        if (response.status == 200) {
            console.log("response ", response);
            return response.data.message;
        } else {
            return "null";
        }

    } catch (e) {
        ////console.log('error during translation', e);
        return null;
    }
}
