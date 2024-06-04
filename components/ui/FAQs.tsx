// @ts-nocheck
'use client'
import { useRef, useState } from "react"

const FaqsCard = (props) => {

    const answerElRef = useRef()
    const [state, setState] = useState(false)
    const [answerH, setAnswerH] = useState('0px')
    const { faqsList, idx } = props

    const handleOpenAnswer = () => {
        const answerElH = answerElRef.current.childNodes[0].offsetHeight
        setState(!state)
        setAnswerH(`${answerElH + 20}px`)
    }

    return (
        <div
            className="space-y-3 mt-5 overflow-hidden border-b"
            key={idx}
            onClick={handleOpenAnswer}
        >
            <h4 className="cursor-pointer pb-5 flex items-center justify-between text-lg text-gray-300 font-medium">
                {faqsList.q}
                {
                    state ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    )
                }
            </h4>
            <div
                ref={answerElRef} className="duration-300"
                style={state ? { height: answerH } : { height: '0px' }}
            >
                <div>
                    <p className="text-gray-500">
                        {faqsList.a}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function FAQ() {

    const faqsList = [
        {
            q: "How does MyLivTranslator work?",
            a: "MyLivTranslator uses advanced AI algorithms to translate live audio, video, and text communications between users speaking different languages. It ensures seamless and real-time communication as if both parties were speaking the same language."
        },
        {
            q: "Is MyLivTranslator secure?",
            a: "Yes, all communications through MyLivTranslator are encrypted to ensure user privacy and data security. We adhere to international data protection standards to safeguard personal information and conversation details."
        },
        {
            q: "What languages are supported?",
            a: "MyLivTranslator supports a wide range of languages. Users can select their source and target languages from the app's extensive list, making it a versatile tool for global communication."
        },
        {
            q: "Can I use MyLivTranslator for business meetings?",
            a: "Absolutely! MyLivTranslator is designed to facilitate both personal and professional communications. It is especially useful for businesses looking to engage with international clients or teams in different languages."
        },
        {
            q: "What features are available in the free version?",
            a: "The free version of MyLivTranslator includes a limited number of live audio and video call hours, basic real-time translation, and standard security features. For more advanced features and unlimited usage, you can upgrade to our premium plans."
        },
        // Add 5 more FAQs here
        {
            q: "How accurate is the translation provided by MyLivTranslator?",
            a: "MyLivTranslator strives for high accuracy in translations, utilizing state-of-the-art AI technology. While translations are generally reliable, they may vary based on factors such as accent, background noise, and speech complexity."
        },
        {
            q: "Can I customize the translation settings in MyLivTranslator?",
            a: "Yes, users can customize their translation settings within the app. This includes choosing preferred languages, adjusting translation speed, and enabling or disabling transcription features during video calls."
        },
        {
            q: "Is there a limit to the number of languages I can translate between?",
            a: "No, MyLivTranslator supports translation between a wide variety of languages, and there is no limit to the number of language pairs you can use."
        },
        {
            q: "Can MyLivTranslator translate dialects or regional accents?",
            a: "MyLivTranslator is trained to recognize and translate various dialects and regional accents. However, accuracy may vary depending on the complexity of the dialect or accent."
        },
        {
            q: "Are there offline translation capabilities in MyLivTranslator?",
            a: "Yes, MyLivTranslator offers offline translation capabilities for certain languages. Users can download language packs for offline use, ensuring translation functionality even without an internet connection."
        }
    ];
    
    

    return (
        <section id="faq" className="leading-relaxed  px-4 md:px-8 relative lg:py-28 bg-gray-900">
            <div className="absolute inset-0 max-w-md mx-auto h-72 blur-[118px]" style={{ background: "linear-gradient(152.92deg, rgba(192, 132, 252, 0.2) 4.54%, rgba(232, 121, 249, 0.26) 34.2%, rgba(192, 132, 252, 0.1) 77.55%)" }}></div>
            <div className="space-y-3 text-center">
                <h1 className="text-3xl text-gray-300 font-semibold">
                    Frequently Asked Questions
                </h1>
                <p className="text-gray-300 max-w-lg mx-auto text-lg">
                    Answered all frequently asked questions, Still confused? feel free to contact us.
                </p>
            </div>
            <div className="mt-14 max-w-2xl mx-auto">
                {
                    faqsList.map((item, idx) => (
                        <FaqsCard
                            key={idx}
                            idx={idx}
                            faqsList={item}
                        />
                    ))
                }
            </div>
        </section>
    )
}