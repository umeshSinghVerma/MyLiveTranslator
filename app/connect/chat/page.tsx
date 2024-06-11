'use client'
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import clsx from 'clsx';
import { use, useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'


const fetchAndPlayAudio = async (text: string, language: string) => {
    const DEEPGRAM_URL = `https://api.deepgram.com/v1/speak?model=aura-asteria-en`;
    const DEEPGRAM_API_KEY = "0b7b597321b6483dd2e2098526a774944ca94dcf";

    try {
        const response = await fetch(DEEPGRAM_URL, {
            method: 'POST',
            headers: {
                Authorization: `Token ${DEEPGRAM_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        return audioUrl;

    } catch (error) {
        console.error('Failed to fetch and play audio:', error);
    }

};
const fetchAndPlayAudioHindi = async (text: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';

        const audioContext = new AudioContext();
        const destination = audioContext.createMediaStreamDestination();
        const mediaRecorder = new MediaRecorder(destination.stream);

        const chunks: BlobPart[] = [];
        mediaRecorder.ondataavailable = (event: BlobEvent) => {
            chunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
            const audioUrl = URL.createObjectURL(blob);
            resolve(audioUrl);
        };

        utterance.onstart = () => {
            mediaRecorder.start();
        };

        utterance.onend = () => {
            mediaRecorder.stop();
        };

        const oscillator = audioContext.createOscillator();
        oscillator.connect(destination);
        oscillator.start();
        oscillator.stop();

        synth.speak(utterance);
    });
};



const serverUrl = 'https://mylivtranslatorserver.onrender.com'
// const serverUrl = 'http://localhost:8080'

const Page = () => {
    const user = useUser();
    const username = user?.user?.username;
    const fullName = user?.user?.fullName;
    const hasImage = user?.user?.hasImage;
    const email = user?.user?.primaryEmailAddress?.emailAddress;
    const imageUrl = user?.user?.imageUrl;
    const [activeUsers, setActiveUsers] = useState<{ [key: string]: any }>({});
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const [incomingMessage, setIncomingMessage] = useState("");
    const [outgoingMessage,setOutgoingMessage]=useState("");

    const [voiceMessages, setVoiceMessages] = useState<any>([]);
    const [currentVoice, setCurrentVoice] = useState({ playing: false, index: 0 });
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const voiceSocketRef = useRef<WebSocket | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [call, setCall] = useState<{ callActive: boolean, state: 'incoming' | 'outgoing' | 'busy' | "missed", senderId: string, recieverId: string, senderUserName: string, senderImage: string | null } | null>(null)


    const socket = useMemo(() => {
        const url = serverUrl + `?username=${username}&imageUrl=${imageUrl}`
        return io(url);
    }, []);
    const sendMessageRef = useRef<HTMLInputElement | null>(null);

    const languageRef = useRef(selectedLanguage);
    const ringingRef = useRef(call);
    const selectedUserRef = useRef(null);
    useEffect(() => {
        if (selectedUser) {
            selectedUserRef.current = selectedUser?.socketId
        }
    }, [selectedUser])
    useEffect(() => {
        languageRef.current = selectedLanguage;
    }, [selectedLanguage]);

    useEffect(() => {
        ringingRef.current = call;
    }, [call])

    async function getTranslatedText(sourceLanguage: string, message: string) {
        console.log("inside getTranslatedText ", languageRef.current);
        try {
            const response = await axios.post(`${serverUrl}/translate`, {
                message: message,
                targetLanguage: languageRef.current,
                currentLanguage: sourceLanguage
            })
            if (response.status == 200) {
                return response.data;
            } else {
                return null;
            }

        } catch (e) {
            console.log('error during translation', e);
            return null;
        }
    }

    useEffect(() => {
        if (selectedUser) {
            if (!activeUsers[selectedUser?.socketId]) {
                setSelectedUser(null);
            }
        }
    }, [activeUsers])



    useEffect(() => {
        socket.on('users', (activeUsers) => {
            setActiveUsers(activeUsers);
        })
        socket.on('message', async (message) => {
            console.log('incomingMessage ', message.text);
            const translatedText = await getTranslatedText(message.language, message.text);
            console.log("translated text", translatedText)
            if (translatedText) {
                if (languageRef.current == 'hi') {
                    const audio = await fetchAndPlayAudioHindi(translatedText);
                    setVoiceMessages((voices: any) => [...voices, { translatedText, audio }]);
                } else {
                    const audio = await fetchAndPlayAudio(translatedText, languageRef.current);
                    setVoiceMessages((voices: any) => [...voices, { translatedText, audio }]);
                }
            }
        })


        socket.on('initiateCall', (request) => {
            const senderId = request.senderId;
            const senderUserName = request.senderUserName;
            const senderImage = request.senderImage || null;
            console.log('initiateCall', request);
            console.log("call", ringingRef.current);
            if (ringingRef.current == null) {
                setCall({
                    state: 'incoming',
                    senderId: senderId,
                    recieverId: socket.id!,
                    senderImage: senderImage,
                    senderUserName: senderUserName,
                    callActive: false
                })
            } else {
                console.log('sending busy')
                socket.emit('busy', {
                    senderId: senderId
                })
            }
        })

        socket.on('onGoingEndCall', () => {
            console.log("I came in ongoing call end");
            setCall((prev: any) => {
                return {
                    ...prev,
                    state: "missed"
                }
            })
            setTimeout(() => {
                setCall(null);
            }, 1000)
        })
        socket.on('acceptcall', () => {
            console.log("I am accepting");
            startCalling(selectedUserRef.current);
            setCall((prev: any) => {
                return {
                    ...prev,
                    callActive: true
                }
            })
        })
        socket.on('endCall', () => {
            stopCalling();
            setCall(null);
        })

        socket.on('busy', () => {
            setCall((prev: any) => {
                console.log("this is busy prev", prev);
                return {
                    ...prev,
                    state: "busy"
                }
            })

            setTimeout(() => {
                setCall(null);
            }, 1000)
        })

        return () => {
            endCall();
            socket.disconnect();
        }
    }, [])

    useEffect(() => {
        if (voiceMessages.length > currentVoice.index && currentVoice.playing == false) {
            const firstAudio = voiceMessages[currentVoice.index];
            const audio = new Audio(firstAudio.audio);
            setIncomingMessage(firstAudio.translatedText)
            audio.addEventListener('ended', () => {
                URL.revokeObjectURL(firstAudio.audio);
                setCurrentVoice((obj) => {
                    return ({
                        playing: false,
                        index: obj.index + 1
                    })
                });
            });
            audio.play();
            setCurrentVoice((obj) => {
                return (
                    {
                        playing: true,
                        index: obj.index
                    }
                )
            })
        }
        else if (voiceMessages.length > 0 && currentVoice.index == voiceMessages.length) {
            setCurrentVoice((obj) => {
                return ({
                    playing: false,
                    index: 0
                })
            })
            setVoiceMessages([])
        }
    }, [voiceMessages, currentVoice])


    function requestCall(selectedUser: any) {
        if (selectedUser) {
            socket.emit('initiateCall', {
                senderId: socket.id,
                senderUserName: username,
                senderImageUrl: imageUrl || null,
                recieverId: selectedUser?.socketId
            })
            setCall({
                senderId: selectedUser?.socketId,
                recieverId: socket.id!,
                state: 'outgoing',
                senderUserName: username!,
                senderImage: imageUrl!,
                callActive: false
            })
        }
    }


    const startCalling = async (selectedUser: any) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            const currentLanguage = languageRef.current;;
            console.log('current lang in startCalling', currentLanguage);
            voiceSocketRef.current = new WebSocket(`wss://api.deepgram.com/v1/listen?model=nova-2-general&punctuate=true&language=${currentLanguage}`, ['token', '0b7b597321b6483dd2e2098526a774944ca94dcf']);

            voiceSocketRef.current.onopen = () => {
                mediaRecorderRef.current!.addEventListener('dataavailable', event => {
                    if (voiceSocketRef.current?.readyState === WebSocket.OPEN) {
                        voiceSocketRef.current.send(event.data);
                    }
                });
                mediaRecorderRef.current!.start(250);
            };

            voiceSocketRef.current.onmessage = (message) => {
                const received = JSON.parse(message.data);
                const transcript = received?.channel?.alternatives[0]?.transcript;
                console.log("transcript I am taking ", transcript);
                setOutgoingMessage(transcript)
                if (transcript) {
                    socket.emit('sendMessage', {
                        message: transcript,
                        to: selectedUser,
                        language: languageRef.current
                    });
                }
            };

            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing media devices.', error);
        }
    };

    const stopCalling = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }

        if (voiceSocketRef.current && voiceSocketRef.current.readyState === WebSocket.OPEN) {
            voiceSocketRef.current.close();
        }

        mediaRecorderRef.current = null;
        mediaStreamRef.current = null;
        voiceSocketRef.current = null;

        setIsRecording(false);
    };

    const onGoingEndCall = () => {
        socket.emit('onGoingEndCall', {
            senderId: call?.senderId
        })
        setCall(null);
    }

    const rejectCall = () => {
        socket.emit('busy', {
            senderId: call?.senderId
        })
        setCall(null);
    }


    const pickCall = () => {
        startCalling(call?.senderId)
        socket.emit('acceptcall', {
            senderId: call?.senderId
        })
        setCall((prev: any) => {
            return {
                ...prev,
                callActive: true
            }
        })
    }

    const endCall = () => {
        socket.emit('endCall', {
            senderId: call?.senderId
        })
        setCall(null);
    }


    return (
        <div className='h-full w-full flex'>
            <div className='flex flex-col min-w-[300px] items-center p-8 bg-dark-1 rounded-3xl m-5'>
                <p className='text-white text-2xl font-bold'>Active Users</p>
                <div className='w-full overflow-y-auto h-full flex flex-col py-2'>
                    {
                        Object.keys(activeUsers).map((user, key: number) => {
                            if (activeUsers[user].username == username) {
                                return null;
                            }
                            return (
                                <div key={key} onClick={() => {
                                    setSelectedUser({ ...activeUsers[user], socketId: user })
                                }}>
                                    <div className={clsx({
                                        " bg-gray-600": selectedUser?.socketId === user,
                                        "text-white flex gap-3 items-center w-full py-4 px-2 cursor-pointer rounded-md": true
                                    })}>
                                        <img className='rounded-full h-8 w-8' src={activeUsers[user].imageUrl} />
                                        <p>{activeUsers[user].username}</p>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className='flex flex-col gap-5 min-w-[300px] p-8 bg-dark-1 rounded-3xl m-5 w-full'>
                <div className='flex gap-2'>
                    <Combobox disabled={isRecording} value={selectedLanguage} setValue={setSelectedLanguage} />
                    {selectedUser &&
                        <div>
                            <Button disabled={call != null} onClick={() => {
                                requestCall(selectedUser);
                            }}>Call</Button>
                        </div>
                    }
                </div>
                <div className='flex gap-2 text-white'>
                    <div className='w-full'>
                        <p className='text-2xl font-bold'>Your Speech</p>
                        <p>
                            {outgoingMessage}
                        </p>
                    </div>
                    <div className='w-full'>
                        <p className='text-2xl font-bold'>Remote Speech</p>
                        <p>
                            {incomingMessage}
                        </p>
                    </div>
                </div>
                {
                    call &&
                    <div className='absolute top-[100px] right-5 m-5 p-5 bg-gray-600 rounded-lg'>
                        {
                            <div>
                                <p>{call.state}</p>
                                {call.state == 'outgoing' && <div className='flex gap-3 my-2'>
                                    <img src={selectedUser.imageUrl} title={selectedUser.username} className='h-8 w-8 rounded-full' />
                                    <p>{selectedUser.username}</p>
                                </div>}
                                {call.state == 'incoming' && activeUsers[call.senderId] && <div className='flex gap-3 my-2'>
                                    {
                                        <img src={activeUsers[call.senderId].imageUrl} title={activeUsers[call.senderId].username} className='h-8 w-8 rounded-full' />
                                    }
                                    <p>{activeUsers[call.senderId].username}</p>
                                </div>}
                                {!call.callActive ?
                                    <div>
                                        <div>
                                            {
                                                call.state == "outgoing" && <Button onClick={onGoingEndCall}>End Call</Button>
                                            }
                                        </div>
                                        <div>
                                            {
                                                call.state == "incoming" &&
                                                <div className='flex gap-2'>
                                                    <Button onClick={pickCall}>Answer</Button>
                                                    <Button onClick={rejectCall}>Reject</Button>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    :
                                    <div className='flex gap-2'>
                                        <Button>Mute</Button>
                                        <Button onClick={endCall}>End Call</Button>
                                    </div>
                                }
                            </div>
                        }
                    </div>
                }
            </div>
        </div>
    )
}

export default Page
