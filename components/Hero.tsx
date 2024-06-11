// @ts-nocheck
'use client'
import { SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
export default function Hero() {
    const { isSignedIn } = useUser();
    const [state, setState] = useState(false)

    // Replace # paths with your paths
    const navigation = [
        { title: "Features", path: "#features" },
        { title: "FAQs", path: "#faq" },
        { title: "Customers", path: "#stats" },
        { title: "Pricing", path: "#pricing" }
    ]

    useEffect(() => {
        document.onclick = (e) => {
            const target = e.target;
            if (!target.closest(".menu-btn")) setState(false);
        };
    }, [])


    const Brand = () => (
        <div className="flex items-center justify-between py-5 md:block">
            <Link href="/" className="flex items-center gap-3">
                <Image
                    src="/icons/logo.svg"
                    width={32}
                    height={32}
                    alt="My Liv Translator logo"
                    className="max-sm:size-10"
                />
                <p className="text-[26px] font-extrabold text-white max-sm:hidden">
                    My Liv Translator
                </p>
            </Link>
            <div className="md:hidden">
                <button className="menu-btn text-gray-400 hover:text-gray-300"
                    onClick={() => setState(!state)}
                >
                    {
                        state ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        )
                    }
                </button>
            </div>
        </div>
    )

    return (
        <div className="bg-gray-900">
            <header>
                <div className={`md:hidden ${state ? "mx-2 pb-5" : "hidden"}`}>
                    <Brand />
                </div>
                <nav className={`pb-5 md:text-sm ${state ? "absolute z-20 top-0 inset-x-0 bg-gray-800 rounded-xl mx-2 mt-2 md:mx-0 md:mt-0 md:relative md:bg-transparent" : ""}`}>
                    <div className="gap-x-14 items-center max-w-screen-xl mx-auto px-4 md:flex md:px-8">
                        <Brand />
                        <div className={`flex-1 items-center mt-8 md:mt-0 md:flex ${state ? 'block' : 'hidden'} `}>
                            <ul className="flex-1 justify-end items-center space-y-6 md:flex md:space-x-6 md:space-y-0">
                                {
                                    navigation.map((item, idx) => {
                                        return (
                                            <li key={idx} className="text-gray-300 hover:text-gray-400">
                                                <Link href={item.path} className="block">
                                                    {item.title}
                                                </Link>
                                            </li>
                                        )
                                    })
                                }
                                <li>
                                    {isSignedIn ? (<button className="flex items-center justify-center gap-x-1 py-2 px-4 text-white font-medium bg-sky-500 hover:bg-sky-400 active:bg-sky-600 duration-150 rounded-full md:inline-flex">
                                        <SignOutButton />
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                        </svg>
                                    </button>) : (
                                        <Link href="/sign-in" className="flex items-center justify-center gap-x-1 py-2 px-4 text-white font-medium bg-sky-500 hover:bg-sky-400 active:bg-sky-600 duration-150 rounded-full md:inline-flex">
                                            Log in
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </Link>
                                    )}
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>
            <section className="relative">

                <section className="lg:mt-24 mx-auto max-w-screen-xl pb-12 px-4 items-center lg:flex md:px-8">
                    <div className="space-y-4 flex-1 sm:text-center lg:text-left">
                        <h1 className="text-white font-bold text-3xl xl:text-4xl">
                            Break Language Barriers with
                            <div className="text-sky-400 my-2"> Real-Time Translation</div>
                        </h1>
                        <p className="text-gray-300 max-w-xl leading-relaxed sm:mx-auto lg:ml-0">
                            Seamlessly communicate in any language through live audio, video calls, and text chat.
                        </p>
                        <p className="text-gray-300 max-w-xl leading-relaxed sm:mx-auto lg:ml-0">
                            Experience effortless conversations with MyLivTranslator. Speak your language and let our advanced AI translate and adapt your words in real-time. Perfect for personal and professional use, our app ensures that you can connect with anyone, anywhere, without language constraints.
                        </p>
                        <div className="pt-10 font-semibold items-center justify-center space-y-3 sm:space-x-6 sm:space-y-0 sm:flex lg:justify-start">
                            <Link href={isSignedIn ? "/connect" : "/sign-in"} className="px-7 py-3 w-full bg-white text-gray-800 text-center rounded-md shadow-md block sm:w-auto">
                                Connect
                            </Link>
                            <Link href={isSignedIn ? "/connect/chat" : "/sign-in"} className="px-7 py-3 w-full bg-gray-700 text-gray-200 text-center rounded-md block sm:w-auto">
                                Chat
                            </Link>
                        </div>
                    </div>
                    <div>
                        <div className='flex-1 hidden md:block'>
                            <Image width={1000} height={1500} alt="desktop" src="/home.svg" className="max-w-xl" />
                        </div>
                    </div>
                </section>
            </section>
        </div>
    )
}