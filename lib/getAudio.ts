export const convertResponseToAudio = async (text: string) => {
    //console.log("text incoming in conversion of audio ",text);
    const options = {
        method: 'POST',
        headers: {
            'xi-api-key': 'sk_6f11c21aadbd26339f8da001d1c80797fecc245faccdd1da',
            'Content-Type': 'application/json'
        },
        body: `{"text":"${text}","model_id":"eleven_multilingual_v2","voice_settings":{"similarity_boost":1,"stability":1}}`
    };

    try {
        const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream', options);
        const audioData = await res.blob();
        //console.log("this is audioData",audioData);
        const audioUrl = URL.createObjectURL(audioData);
        //console.log('audio url ', audioUrl);
        // const audio = new Audio(audioUrl);
        // audio.play();
        return audioUrl;
    } catch (error) {
        //console.log('error has occured in elevenlabs audio conversion',error);
    }
    return null;
};