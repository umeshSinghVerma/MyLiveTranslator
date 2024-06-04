import Features from "@/components/Features"
import Footer from "@/components/Footer"
import Hero from "@/components/Hero"
import Pricing from "@/components/Pricing"
import Stats from "@/components/Stats"
import FAQ from "@/components/ui/FAQs"

export default function Home() {

    // Replace # path with your path
    const navigation = [
        { title: "Customers", path: "#" },
        { title: "Careers", path: "#" },
    ]

    return (
        <>

            <Hero />
            <Features />
            <Pricing />
            <FAQ />
            <Stats />
            <Footer />
        </>
    )
}
