'use client';
import { useEffect, useState } from 'react';
import {
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import {  useSearchParams } from 'next/navigation';
import { Users, LayoutList, MessageCircleCode } from 'lucide-react';
import { StreamChat } from 'stream-chat'
import { Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window } from 'stream-chat-react';
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
import Translate from './Translate';
import { CustomScreenShareButton } from './screenSharing';
import { CustomRecordCallButton } from './recording';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = ({ meetingId, user,language,gender }: { meetingId: string | string[], user: any,language:string,gender:string }) => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();



  const callingState = useCallCallingState();
  const [messageClient, setMessageClient] = useState<any>();
  const [messageChannel, setmessageChannel] = useState<any>();
  const [showMessages,setShowMessages] = useState(false);
  useEffect(() => {
    if (!user?.id) return;

    (async function run() {
      const messageClient = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);
      setMessageClient(messageClient);
      await messageClient.connectUser(
        {
          id: user?.id,
          name: user?.username || user?.id,
          image: user?.imageUrl,
        },
        tokenProvider
      )
      const messageChannel = messageClient.channel('livestream', `${meetingId as string}-messages`, {
        name: 'Messages',
      });

      await messageChannel.watch();
      setmessageChannel(messageChannel);
    })();

    return () => {
      messageClient?.disconnectUser();
      setMessageClient(undefined);
    }

  }, [user.id]);
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
        <div className="fixed bottom-5 flex w-full items-center justify-center gap-5">
          <Translate meetingId={meetingId} user={user} language={language} gender={gender}/>
          <CustomScreenShareButton/>
          <CustomRecordCallButton/>
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
      {showMessages && <div className='w-[30%] min-w-[300px] bg-yellow-1 h-screen'>
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
