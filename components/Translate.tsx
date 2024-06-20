'use client';

import { CancelCallButton, ToggleAudioPublishingButton, ToggleVideoPublishingButton, useCall } from "@stream-io/video-react-sdk";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Languages, LayoutList, MicIcon, MicOffIcon, Settings, AtomIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { StreamChat } from "stream-chat";
import { tokenProvider } from "@/actions/stream.actions";
import { translateTextGroq, translateTextItranslate } from "@/lib/translate";
import { convertResponseToAudio } from "@/lib/getAudio";
import { cn } from "@/lib/utils";

const Translate = ({ meetingId, user }: { meetingId: string | string[], user: any }) => {
  const router = useRouter();
  const [client, setClient] = useState<any>();
  const [channel, setChannel] = useState<any>();
  const [language, setLanguage] = useState<string>('en');
  const [voiceMessages, setVoiceMessages] = useState<any>([]);
  const [currentVoice, setCurrentVoice] = useState({ playing: false, index: 0 });
  const [groq, setGroq] = useState(true);

  const speakingRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const voiceSocketRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<'normal' | "translate">("normal");
  const [tmute, setTMute] = useState(false);

  const call = useCall();
  function disableCallMicrophone() {
    call!.microphone.disable();
  }
  function enableCallMicrophone() {
    call!.microphone.enable();
  }


  useEffect(() => {
    if (!user?.id) return;

    (async function run() {
      const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);
      setClient(client);

      await client.connectUser(
        {
          id: user?.id,
          name: user?.username || user?.id,
          image: user?.imageUrl,
        },
        tokenProvider
      )

      const channel = client.channel('livestream', `${meetingId as string}`, {
        name: 'voice channel',
      });

      channel.on('message.new', async (event) => {
        if (event.user?.id != user?.id) {
          console.log("event mesg", event.user?.id);
          console.log("event mesg", user?.id);
          const senderMessage = event.message?.text as string;
          const senderlanguage = event.message?.language as string;
          const recieverLanguage = language as string;
          if (senderMessage && senderlanguage && recieverLanguage) {
            let translatedText;
            if (groq) {
              translatedText = await translateTextGroq(senderMessage, senderlanguage, recieverLanguage);
            } else {
              translatedText = await translateTextItranslate(senderMessage, senderlanguage, recieverLanguage);
            }
            console.log('translatedText',translatedText);
            if (translatedText) {
              const audioData = await convertResponseToAudio(translatedText);
              if (translatedText && audioData) {
                const audio = URL.createObjectURL(audioData);
                console.log("audioUrl",audio);
                setVoiceMessages((prev: any) => {
                  return (
                    [...prev, { audio, translatedText }]
                  )
                });

              }
            }
          }
        }
        const messageId = event.message?.id;
        if (user?.id == event.message?.user?.id) {
          await client.deleteMessage(messageId!, true);
        }
        console.log('received a new message', event);
        console.log(`Now have ${channel.state.messages.length} stored in local state`);
      });

      await channel.watch();


      setChannel(channel);
    })();

    return () => {
      client?.disconnectUser();
      setChannel(undefined);
    }

  }, [user.id]);

  useEffect(() => {
    if (voiceMessages.length > currentVoice.index && currentVoice.playing == false) {
      const firstAudio = voiceMessages[currentVoice.index];
      //console.log("this is first audio ",firstAudio);
      const audio = new Audio(firstAudio.audio);
      const displayText = firstAudio.translatedText;
      //console.log("this is displayText ", displayText);
      // setIncomingMessage(displayText);
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(firstAudio.audio);
        setCurrentVoice((obj) => {
          return ({
            playing: false,
            index: obj.index + 1
          })
        });
      });
      speakingRef.current = true;
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
      console.log("Now speak");
      speakingRef.current = false;
      setCurrentVoice((obj) => {
        return ({
          playing: false,
          index: 0
        })
      })
      setVoiceMessages([])
    }
  }, [voiceMessages, currentVoice])

  const languageRef = useRef('en');
  useEffect(()=>{
    languageRef.current = language;
  },[language])

  const startCalling = async () => {
    if (speakingRef.current == false) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        const currentLanguage = languageRef.current;
        voiceSocketRef.current = new WebSocket(`wss://api.deepgram.com/v1/listen?model=nova-2-general&punctuate=true&language=${currentLanguage}`, ['token', '0b7b597321b6483dd2e2098526a774944ca94dcf']);

        voiceSocketRef.current.onopen = () => {
          mediaRecorderRef?.current!?.addEventListener('dataavailable', event => {
            if (voiceSocketRef.current?.readyState === WebSocket.OPEN) {
              voiceSocketRef.current.send(event.data);
            }
          });
          mediaRecorderRef.current!.start(250);
        };

        voiceSocketRef.current.onmessage = async (message) => {
          const received = JSON.parse(message.data);
          const transcript = received?.channel?.alternatives[0]?.transcript;
          if (transcript) {
            console.log('transcript ', transcript);
            const response = await channel.sendMessage({
              text: transcript,
              language: currentLanguage
            });
            console.log("response of send message ", response);
          }
        };
      } catch (error) {
        console.error('Error accessing media devices.', error);
      }
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
  };
  return (
    <div className="flex gap-3">
      {
        state == "normal" ?
          <ToggleAudioPublishingButton />
          :
          <>
            {tmute ? <Button className='bg-[#dc433b] h-[40px] rounded-full' onClick={() => {
              disableCallMicrophone();
              setTMute(false);
              startCalling();
            }}><MicOffIcon className="text-white" /></Button>
              :
              <Button className='bg-[#dc433b] h-[40px] rounded-full' onClick={() => {
                setTMute(true);
                stopCalling();
              }}><MicIcon className="text-white" /></Button>}
          </>
      }
      <ToggleVideoPublishingButton />
      <CancelCallButton onLeave={() => router.push(`/connect`)} />
      <DropdownMenu>
        <div className="flex items-center">
          <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
            <Settings size={20} className="text-white" />
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
          {['normal', 'translate'].map((item, index) => (
            <div key={index}>
              <DropdownMenuItem
                className={cn({
                  "bg-white text-blue-950": (item == state),
                  "": true
                })}
                onClick={() => {
                  if (item == "normal") {
                    stopCalling();
                  } else {
                    disableCallMicrophone();
                    startCalling();
                  }
                  setState(item as "normal" | "translate")
                }
                }
              >
                {item}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="border-dark-1" />
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {state == "translate" && <DropdownMenu>
        <div className="flex items-center">
          <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
            <Languages size={20} className="text-white" />
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
          {[
            {
              value: "en",
              label: "English",
            },
            {
              value: "hi",
              label: "hindi",
            },
            {
              value: "de",
              label: "german"
            }].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  className={cn({
                    "bg-white text-blue-950": (item.value == language),
                    "": true
                  })}
                  onClick={() => {
                    setLanguage(item.value);
                  }
                  }
                >
                  {item.label}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1" />
              </div>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
      }
      <DropdownMenu>
        <div className="flex items-center">
          <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
            <AtomIcon size={20} className="text-white" />
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
          {['groq', 'iTranslate'].map((item, index) => (
            <div key={index}>
              <DropdownMenuItem
                className={cn({
                  "bg-white text-blue-950": (item == "iTranslate" && groq == false) || (item == "groq" && groq == true),
                  "": true
                })}
                onClick={() => {
                  if (item == 'groq') {
                    setGroq(true)
                  } else {
                    setGroq(false);
                  }
                }
                }
              >
                {item}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="border-dark-1" />
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  )
}

export default Translate
