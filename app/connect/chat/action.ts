"use server";

export async function sendPusherEvent(username:string){
    "use server";
    const Pusher = require("pusher")
    const pusher = new Pusher({
        appId:process.env.PUSHER_APP_ID,
        key:process.env.NEXT_PUBLIC_PUSHER_KEY,
        secret:process.env.PUSHER_SECRET,
        cluster:'mt1',
        useTLS:true
    })

    pusher.trigger('my-channel',username,{
        message:`this is the message from pusher`
    })
}