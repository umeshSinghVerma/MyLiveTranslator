'use client'
import { useCallback, useEffect, useState } from 'react';
import {
    LoadingIndicator,
    useCall,
    useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { ReceiptPoundSterling, VideoIcon, VideoOffIcon } from 'lucide-react';

export const CustomRecordCallButton = () => {
    const call = useCall();
    const { useIsCallRecordingInProgress } = useCallStateHooks();

    const isCallRecordingInProgress = useIsCallRecordingInProgress();
    const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

    useEffect(() => {
        // we wait until call.recording_started/stopped event to flips the
        // `isCallRecordingInProgress` state variable.
        // Once the flip happens, we remove the loading indicator
        setIsAwaitingResponse((isAwaiting) => {
            if (isAwaiting) return false;
            return isAwaiting;
        });
    }, [isCallRecordingInProgress]);

    const toggleRecording = useCallback(async () => {
        try {
            setIsAwaitingResponse(true);
            if (isCallRecordingInProgress) {
                await call?.stopRecording();
            } else {
                await call?.startRecording();
            }
        } catch (e) {
            console.error(`Failed start recording`, e);
        }
    }, [call, isCallRecordingInProgress]);

    return (
        <>
            {isAwaitingResponse ? (
                <LoadingIndicator
                    tooltip={
                        isCallRecordingInProgress
                            ? 'Waiting for recording to stop... '
                            : 'Waiting for recording to start...'
                    }
                />
            ) : (
                <button disabled={!call} className='cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] ' onClick={toggleRecording}>
                    {isCallRecordingInProgress ? (
                        <div  title="Stop recording">
                            <VideoOffIcon color='red' size={20} />
                        </div>
                    ) : (
                        <div title="Record call">
                            <VideoIcon size={20} />
                        </div>
                    )}
                </button>
            )}
        </>
    );
};