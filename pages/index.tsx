import {AnimatePresence, motion} from "framer-motion";
import type {NextPage} from "next";
import Head from "next/head";
import Image from "next/image";
import {useState} from "react";
import {toast, Toaster} from "react-hot-toast";
import DropDown from "../components/DropDown";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import ResizablePanel from "../components/ResizablePanel";

const Home: NextPage = () => {
    const [loading, setLoading] = useState(false);
    const [bio, setBio] = useState("");
    const [vibe, setVibe] = useState<"Professional" | "Casual" | "Funny">(
        "Professional"
    );
    const [generatedBios, setGeneratedBios] = useState<String>("");

    const prompt =
        vibe === "Funny"
            ? `Generate 2 funny Linkedin bios with no hashtags and clearly labeled "1." and "2.". Make sure there is a joke in there and it's a little ridiculous. Make sure each generated bio is at max 20 words and base it on this context: ${bio}${
                bio.slice(-1) === "." ? "" : "."
            }`
            : `Generate 2 ${vibe} Linkedin bios with no hashtags and clearly labeled "1." and "2.". Make sure each generated bio is at least 14 words and at max 20 words and base them on this context: ${bio}${
                bio.slice(-1) === "." ? "" : "."
            }`;

    const generateBio = async (e: any) => {
        e.preventDefault();
        setGeneratedBios("");
        setLoading(true);
        const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
            }),
        });


        if (!response.ok) {
            throw new Error(response.statusText);
        }

        // This data is a ReadableStream
        const data = response.body;
        if (!data) {
            return;
        }

        const reader = data.getReader();
        const decoder = new TextDecoder();

        let done = false;
        let tempState = "";

        while (!done) {
            const {value, done: doneReading} = await reader.read();
            done = doneReading;

            const newValue = decoder
                .decode(value)
                .replaceAll("data: ", "")
                .split("\n\n")
                .filter(Boolean);
            if (tempState) {
                newValue[0] = tempState + newValue[0];
                tempState = "";
            }

            newValue.forEach((newVal) => {
                if (newVal === "[DONE]") {
                    return;
                }

                try {
                    const json = JSON.parse(newVal) as {
                        id: string;
                        object: string;
                        created: number;
                        choices?: {
                            text: string;
                            index: number;
                            logprobs: null;
                            finish_reason: null | string;
                        }[];
                        model: string;
                    };

                    if (!json.choices?.length) {
                        throw new Error("Something went wrong.");
                    }



                    const choice = json.choices[0];
                    setGeneratedBios((prev) => prev + choice.text);
                } catch (error) {
                    tempState = newVal;
                }
            });
        }

        setLoading(false);
    };

    return (
        <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
            <Head>
                <title>Linkedin Bio Generator</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <Header/>
            <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">

                <h1 className="sm:text-6xl text-4xl max-w-2xl font-bold text-slate-900">
                    Generate your next Linkedin bio in seconds
                </h1>
                <div className="max-w-xl">
                    <div className="flex mt-10 items-center space-x-3">
                        <Image
                            src="/1-black.png"
                            width={30}
                            height={30}
                            alt="1 icon"
                            className="mb-5 sm:mb-0"
                        />
                        <p className="text-left font-medium">
                            Copy your current bio{" "}
                            <span className="text-slate-500">
                (or write a few sentences about yourself)
              </span>
                            .
                        </p>
                    </div>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
                        placeholder={
                            "e.g. Senior Developer Advocate @linkedin. Traveling around the world, Footie, and React / Next.js. Writing blogs at me.blog.com."
                        }
                    />
                    <div className="flex mb-5 items-center space-x-3">
                        <Image src="/2-black.png" width={30} height={30} alt="1 icon"/>
                        <p className="text-left font-medium">Select your vibe.</p>
                    </div>
                    <div className="block">
                        <DropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)}/>
                    </div>

                    {!loading && (
                        <button
                            className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
                            onClick={(e) => generateBio(e)}
                        >
                            Generate your bio &rarr;
                        </button>
                    )}
                    {loading && (
                        <button
                            className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
                            disabled
                        >
                            <LoadingDots color="white" style="large"/>
                        </button>
                    )}
                </div>
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    toastOptions={{duration: 2000}}
                />
                <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700"/>
                <ResizablePanel>
                    <AnimatePresence mode="wait">
                        <motion.div className="space-y-10 my-10">
                            {generatedBios && !loading && (
                                <>
                                    <div>
                                        <h2 className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto">
                                            Your generated bios
                                        </h2>
                                    </div>
                                    <div
                                        className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                                        {generatedBios
                                            .substring(generatedBios.indexOf("1") + 3)
                                            .split("2.")
                                            .map((generatedBio) => {
                                                return (
                                                    <div
                                                        className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(generatedBio);
                                                            toast("Bio copied to clipboard", {
                                                                icon: "✂️",
                                                            });
                                                        }}
                                                        key={generatedBio}
                                                    >
                                                        <p>{generatedBio}</p>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </ResizablePanel>
            </main>
            <Footer/>
        </div>
    );
};

export default Home;
