export const convertResponseToAudio = async (text: string) => {
    try{
        const options = {
            method: 'POST',
            headers: {
                'xi-api-key': 'sk_7b4df1a00e8f54b787763d76f80f748d3a6d0a497554c29c',
                'Content-Type': 'application/json'
            },
            body: `{"text":"${text}","model_id":"eleven_multilingual_v2","voice_settings":{"stability":1,"similarity_boost":1}}`
        };
        const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', options);
        console.log("rs ",res);
        const audioData = await res.blob();
        console.log('audioData ',audioData);
        return audioData;
    } catch (error) {
        console.log('error has occured in elevenlabs audio conversion', error);
    }
    return null;
};