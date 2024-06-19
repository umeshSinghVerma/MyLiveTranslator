'use client';
import { useEffect, useRef, useState } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
  CancelCallButton,
  SpeakingWhileMutedNotification,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList, MicIcon, MicOffIcon, Languages, Settings, MessageCircleCode } from 'lucide-react';
import { StreamChat } from 'stream-chat'
import { useCreateChatClient, Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';
import { tokenProvider } from '@/actions/stream.actions';
import { Button } from './ui/button';
import { convertResponseToAudio } from '@/lib/getAudio';
import { translateTextGroq, translateTextItranslate, translateTextItranslatet } from '@/lib/translate';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = ({ meetingId, user }: { meetingId: string | string[], user: any }) => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();
  const [client, setClient] = useState<any>();
  const [channel, setChannel] = useState<any>();

  const [messageClient, setMessageClient] = useState<any>();
  const [messageChannel, setmessageChannel] = useState<any>();

  const languageRef = useRef<string>('en');
  const [voiceMessages, setVoiceMessages] = useState<any>([]);
  const [currentVoice, setCurrentVoice] = useState({ playing: false, index: 0 });

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


  useEffect(() => {
    if (!user?.id) return;

    (async function run() {
      const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);
      const messageClient = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);
      setClient(client);
      setMessageClient(messageClient);

      await client.connectUser(
        {
          id: user?.id,
          name: user?.username || user?.id,
          image: user?.imageUrl,
        },
        tokenProvider
      )
      await messageClient.connectUser(
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
      const messageChannel = client.channel('livestream', `${meetingId as string}-messages`, {
        name: 'Messages',
      });

      channel.on('message.new', async (event) => {
        if (event.user?.id != user?.id) {
          console.log("event mesg", event.user?.id);
          console.log("event mesg", user?.id);
          const senderMessage = event.message?.text as string;
          const senderlanguage = event.message?.language as string;
          const recieverLanguage = languageRef.current as string;
          if (senderMessage && senderlanguage && recieverLanguage) {
            let audio: string | null;
            // const translatedText = await translateTextGroq(senderMessage, senderlanguage, recieverLanguage);
            const translatedText = await translateTextItranslate(senderMessage, senderlanguage, recieverLanguage);
            console.log("translated text", translatedText);
            if (translatedText) {
              audio = await convertResponseToAudio(translatedText);
              if (translatedText && audio) {
                setVoiceMessages((prev: any) => {
                  return (
                    [...prev, { audio, translatedText }]
                  )
                });

              }
            }
          }
          const messageId = event.message?.id;
          if (user?.id == event.message?.user?.id) {
            await client.deleteMessage(messageId!, true);
          }
          console.log('received a new message', event);
          console.log(`Now have ${channel.state.messages.length} stored in local state`);
        }
      });

      await channel.watch();
      await messageChannel.watch();


      setChannel(channel);
      setmessageChannel(messageChannel);
    })();

    return () => {
      client?.disconnectUser();
      messageClient?.disconnectUser();
      setChannel(undefined);
      setMessageClient(undefined);
    }

  }, [user.id]);

  useEffect(() => {
    if (voiceMessages.length > currentVoice.index && currentVoice.playing == false) {
      const firstAudio = voiceMessages[currentVoice.index];
      const audio = new Audio(firstAudio.audio);
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
          mediaRecorderRef?.current!?.start(250);
        };

        voiceSocketRef.current.onmessage = async (message) => {
          const received = JSON.parse(message.data);
          const transcript = received?.channel?.alternatives[0]?.transcript;
          if (transcript) {
            console.log('transcript ', transcript);
            const response = await channel.sendMessage({
              text: transcript,
              language: languageRef.current
            });
            console.log("response of send message ", response);
          }
        };
      } catch (error) {
        console.error('Error accessing media devices.', error);
      }
    }
  };
  const [showMessages, setShowMessages] = useState(false);

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

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <div className='flex'>
      <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
        <div className="relative flex size-full items-center justify-center">
          <div className=" flex size-full max-w-[1000px] items-center">
            <CallLayout />
          </div>
          <div
            className={cn('h-[calc(100vh-86px)] hidden ml-2', {
              'show-block': showParticipants,
            })}
          >
            <CallParticipantsList onClose={() => setShowParticipants(false)} />
          </div>
        </div>
        {/* video layout and call controls */}
        <div className="fixed bottom-5 flex w-full items-center justify-center gap-5">
          {/* <CallControls onLeave={() => router.push(`/`)} /> */}
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
          <CancelCallButton onLeave={() => router.push(`/`)} />
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
                      onClick={() =>
                        languageRef.current = item.value
                      }
                    >
                      {item.label}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="border-dark-1" />
                  </div>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>}
          <DropdownMenu>
            <div className="flex items-center">
              <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
                <LayoutList size={20} className="text-white" />
              </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
              {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
                <div key={index}>
                  <DropdownMenuItem
                    onClick={() =>
                      setLayout(item.toLowerCase() as CallLayoutType)
                    }
                  >
                    {item}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="border-dark-1" />
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setShowMessages(!showMessages)}><MessageCircleCode size={24} /></Button>
          <CallStatsButton />
          <button onClick={() => setShowParticipants((prev) => !prev)}>
            <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
              <Users size={20} className="text-white" />
            </div>
          </button>
          {!isPersonalRoom && <EndCallButton />}
        </div>
      </section >
      {showMessages && <div className='w-[30%] min-w-[300px] bg-yellow-1'>
        <Chat client={messageClient}>
          <Channel channel={messageChannel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>}
    </div>
  );
};

export default MeetingRoom;
