import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const messageArray = [
    {
        role: "system",
        content: "You are a helpful assistant. Your task is to convert the message into the given language."
    },
    {
        role: "user",
        content: "Please translate the following sentence from English to Hindi: 'My name is Umesh Singh Verma.'"
    },
    {
        role: "assistant",
        content: "मेरा नाम उमेश सिंह वर्मा है।"
    },
    {
        role: "user",
        content: "Please translate the following sentence from English to German: 'I am learning to code.'"
    },
    {
        role: "assistant",
        content: "Ich lerne zu programmieren."
    },
    {
        role: "user",
        content: "Please translate the following sentence from English to French: 'The weather is nice today.'"
    },
    {
        role: "assistant",
        content: "Le temps est agréable aujourd'hui."
    },
    {
        role: "user",
        content: "Please translate the following sentence from English to Russian: 'She is reading a book.'"
    },
    {
        role: "assistant",
        content: "Она читает книгу."
    }
]


async function getDataFromOpenAi(text: string,currentLanguage:string,targetLanguage:string) {
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant. Your task is to convert the message into the given language."
                },
                {
                    role: "user",
                    content: "Please translate the following sentence from English to Hindi: 'My name is Umesh Singh Verma.'"
                },
                {
                    role: "assistant",
                    content: "मेरा नाम उमेश सिंह वर्मा है।"
                },
                {
                    role: "user",
                    content: "Please translate the following sentence from English to German: 'I am learning to code.'"
                },
                {
                    role: "assistant",
                    content: "Ich lerne zu programmieren."
                },
                {
                    role: "user",
                    content: "Please translate the following sentence from English to French: 'The weather is nice today.'"
                },
                {
                    role: "assistant",
                    content: "Le temps est agréable aujourd'hui."
                },
                {
                    role: "user",
                    content: "Please translate the following sentence from English to Russian: 'She is reading a book.'"
                },
                {
                    role: "assistant",
                    content: "Она читает книгу."
                },
                {
                    role: "user",
                    content: `Please translate the following sentence from ${currentLanguage} to ${targetLanguage}: '${text}'`
                }
            ]
            ,
            model: "gpt-3.5-turbo-16k",
        });

        return completion.choices[0].message.content;

    } catch (e) {
        console.log("Some error has occurred in getting response from GPT", e);
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        console.log("Request Data:", data);

        const text = data.text;
        const targetLanguage=data.targetLanguage;
        const currentLanguage = data.currentLanguage;
        const gptResponse = await getDataFromOpenAi(text,currentLanguage,targetLanguage);
        console.log("gpt response", gptResponse)
        return NextResponse.json({ message: gptResponse }, { status: 200 });
    } catch (e: any) {
        console.log("Some error has occurred in getting response from GPT", e);
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}
