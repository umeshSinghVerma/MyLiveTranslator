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
    const serverUrl = 'https://mylivtranslatorserver.onrender.com'
    // const serverUrl = 'http://localhost:8080'
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
export async function translateTextItranslatet(message: string, messageLanguage: string, targetLanguage: string) {
    try {
        fetch("https://web-api.itranslateapp.com/v3/texts/translate", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Accept-Language": "en-US,en;q=0.9,hi;q=0.8,he;q=0.7",
                "Api-Key": "d2aefeac9dc661bc98eebd6cc12f0b82",
                "Content-Type": "application/json",
                "Origin": "https://itranslate.com",
                "Referer": "https://itranslate.com/",
                "Sec-Ch-Ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
                "Sec-Ch-Ua-Mobile": "?1",
                "Sec-Ch-Ua-Platform": "\"Android\"",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "cross-site",
                "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36"
            },
            body: JSON.stringify({
                source: {
                    dialect: messageLanguage,
                    text: message,
                    with: ["synonyms"]
                },
                target: {
                    dialect: targetLanguage
                }
            })
        })
            .then(response => response.json())
            .then((data) => {
                const translatedText = data.target.text;
                return translatedText;
            }
            )
            .catch(error => {
                return "";
            });
    } catch (error) {
        return "";
    }
} 