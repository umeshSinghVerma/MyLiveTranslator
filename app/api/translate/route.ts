import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const body = await req.json();
        console.log('translate body ', body);
        const message = body.message;
        const targetLanguage = body.targetLanguage;
        const currentLanguage = body.currentLanguage;
        const response = await axios.post('https://dev-api.itranslate.com/translation/v2/', {
            source: {
                dialect: currentLanguage,
                text: message
            },
            target: {
                dialect: targetLanguage
            }
        }, {
            headers: {
                'Authorization': 'Bearer 603160b7-cee1-4c13-bcd7-37420b55211d',
                'Content-Type': 'application/json'
            }
        })

        const translatedText = response.data.target.text;
        NextResponse.json(translatedText,{status:200})

    } catch (error) {
        console.log('error during translation ', error);
        NextResponse.json(error,{status:400})
    }
}