export const convertResponseToAudioFrontend = async (text: string) => {
    try {
        const options = {
            method: 'POST',
            headers: {
                'xi-api-key': 'sk_7b4df1a00e8f54b787763d76f80f748d3a6d0a497554c29c',
                'Content-Type': 'application/json'
            },
            body: `{"text":"${text}","model_id":"eleven_multilingual_v2","voice_settings":{"stability":1,"similarity_boost":1}}`
        };
        const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', options);
        console.log("rs ", res);
        const audioData = await res.blob();
        console.log('audioData ', audioData);
        return audioData;
    } catch (error) {
        console.log('error has occured in elevenlabs audio conversion', error);
    }
    return null;
};
export async function convertResponseToAudio(text:string,senderGender:string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/getAudio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({text,senderGender})
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const audioBlob = await response.blob();
        return audioBlob;
        // const audioUrl = URL.createObjectURL(audioBlob);
        // const audio = new Audio(audioUrl);
        // audio.play();
    } catch (error) {
        console.error('Error fetching audio:', error);
        return null;
    }
}
export async function speak() {
    const text = "Hii I am sonu singh verma";
    const voiceId = '21m00Tcm4TlvDq8ikWAM';
    const apiKey = 'sk_7b4df1a00e8f54b787763d76f80f748d3a6d0a497554c29c';
    const headers = new Headers();
    headers.append('Accept', 'audio/mpeg');
    headers.append('xi-api-key', apiKey);
    headers.append('Content-Type', 'application/json');

    const body = JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
        }
    });

    fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: headers,
        body: body
    })
        .then(response => {
            if (response.ok) {
                console.log('\nSpeech successfully generated!');
                return response.blob();
            } else {
                throw new Error('Error: ' + response.statusText);
            }
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.play();
            audio.onended = () => {
                console.log('\nAudio has finished playing!');
            };
        })
        .catch(error => {
            console.error('Error:', error);
            console.log('\nError: ' + error.message);
        });
}

// const textToSpeech = async (language: string, text: string) => {
//     const speechSynthesis = window.speechSynthesis;
//     const voice = speechSynthesis.getVoices().find((voice) => voice.lang === language);
//     if (!voice) {
//       throw new Error(`No voice found for language ${language}`);
//     }
  
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.voice = voice;
//     utterance.lang = language;
  
//     const audioData = await new Promise((resolve, reject) => {
//       utterance.onend = () => {
//         const audioBlob = new Blob([utterance.audioBuffer], { type: 'audio/wav' });
//         const audioUrl = URL.createObjectURL(audioBlob);
//         resolve(audioUrl);
//       };
//       utterance.onerror = (event) => {
//         reject(event.error);
//       };
//       speechSynthesis.speak(utterance);
//     });
  
//     return audioData;
//   };