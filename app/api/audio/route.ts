import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, response: Response) {
    try {
        const body = await req.json();
        console.log('translate body ', body);
        const message = body.message;
        const options = {
            method: 'POST',
            headers: {
                'xi-api-key': 'sk_7b4df1a00e8f54b787763d76f80f748d3a6d0a497554c29c',
                'Content-Type': 'application/json'
            },
            body: `{"text":"${message}","model_id":"eleven_multilingual_v2","voice_settings":{"stability":1,"similarity_boost":1}}`
        };

        const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', options)
        const audioData = await res.blob();
        console.log('res ',res);
        return NextResponse.json({data:res},{status:200})

    } catch (error) {
        console.log('error during translation ', error);
        return NextResponse.json(error, { status: 400 })
    }
}