import { useCallStateHooks } from '@stream-io/video-react-sdk';
import { ScreenShare, ScreenShareOff } from 'lucide-react';

export const CustomScreenShareButton = () => {
  const { useScreenShareState, useHasOngoingScreenShare } = useCallStateHooks();
  const { screenShare, isMute: isScreenSharing } = useScreenShareState();

  // determine, whether somebody else is sharing their screen
  const isSomeoneScreenSharing = useHasOngoingScreenShare();
  return (
    <button
      // disable the button in case I'm not the one sharing the screen
      className='cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] '
      disabled={!isScreenSharing && isSomeoneScreenSharing}
      onClick={() => screenShare.toggle()}
    >
      {isScreenSharing ? (
        <ScreenShare size={20}/>
      ) : (
        <ScreenShareOff size={20}/>
      )}
    </button>
  );
};