import { FC, useState, useEffect, useRef } from "react";
import { Layout } from "../components/Layout";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { Ngram } from "../utils/ngram";

const socket = io('http://192.168.29.18:3001');
const ngram = new Ngram();

export const ChatPage: FC = () => {
    type Message = { msg: string, img: string, sender: string };
    const [messageq, setmessageq] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState<string>("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const { state } = useLocation();
    const { id } = state;
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleExpand = () => {
        if (isExpanded) {
            socket.emit("send_message", { message: "Summarization completed", name: id });
        }
        setIsExpanded(!isExpanded);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    useEffect(() => {
        ngram.loadModelFromJson(id);
        const interval = setInterval(() => {
            ngram.saveModelToJson(id);
        }, 600000); // 60000 milliseconds = 1 minute

        return () => {
            clearInterval(interval);
        };
    }, [id]);

    useEffect(() => {
        socket.on("receieve_message", (data) => {
            setmessageq((prev) => [...prev, { msg: data.message, sender: data.name, img: "" }]);
        });

        socket.on("download", (data) => {
            setmessageq((prev) => [...prev, { msg: "", sender: data.name, img: data.data }]);
        });

        return () => {
            socket.off("receieve_message");
            socket.off("download");
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messageq]);

    function uploadhandler(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = e.target?.result as string;
                socket.emit("upload", { data: file, name: id });
                setmessageq((prev) => [...prev, { msg: "Image uploaded", sender: id, img }]);
            };
            reader.readAsDataURL(file);
        }
    }

    function submithandler(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formElements = form.elements as typeof form.elements & {
            textmessage: { value: string },
        };
        const userMessage = formElements.textmessage.value;
        setmessageq((prev) => [...prev, { msg: userMessage, sender: id, img: "" }]);

        ngram.buildModel([userMessage]);
        socket.emit("send_message", { message: userMessage, name: id });
        formElements.textmessage.value = "";
        setInputValue("");
        setSuggestions([]);
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const newValue = event.target.value;
        setInputValue(newValue);
        const words = newValue.trim().split(" ");
        const lastWord = words[words.length - 1];

        const ngramSuggestions = ngram.getSuggestions(lastWord);
        setSuggestions(ngramSuggestions.slice(0, 5));
    }

    function handleSuggestionClick(suggestion: string) {
        const words = inputValue.trim().split(" ");
        words[words.length - 1] = words[words.length - 1] + " " + suggestion;
        const newInputValue = words.join(" ") + " ";
        setInputValue(newInputValue);
        setSuggestions([]);
    }

    return (
        <Layout>
            <div className={`h-screen w-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <header className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} shadow-md`}>
                    <h1 className="mt-10 text-xl font-semibold">Hi {id}!</h1>
                    <button
                        onClick={toggleDarkMode}
                        className={`mt-10 p-2 rounded-full ${isDarkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-600 text-white'}`}
                    >
                        {isDarkMode ? <SunIcon /> : <MoonIcon />}
                    </button>
                </header>

                <div className="flex-grow flex flex-col overflow-hidden">
                    <div className="relative">
                        <button
                            onClick={toggleExpand}
                            className={`
                                absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50
                                transition-all duration-300 ease-in-out
                                ${isExpanded 
                                    ? 'mt-10 w-40 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg'
                                    : 'mt-2 w-14 h-7 bg-purple-600 rounded-full flex items-center justify-center shadow-md'
                                }
                            `}
                        >
                            {isExpanded ? (
                                <>
                                    <StarIcon className="w-4 h-4 mr-2" />
                                    <span>Summarize</span>
                                </>
                            ) : (
                                <span className="text-white text-xs">✨</span>
                            )}
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                        {messageq.map((txt, index) => (
                            <div 
                                key={index} 
                                className={`flex ${txt.sender === id ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`
                                    max-w-xs p-3 rounded-2xl shadow-md
                                    ${txt.sender === 'summary' ? 'bg-purple-600 text-white' : 
                                      txt.sender === id ? 
                                        (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : 
                                        (isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-800')}
                                `}>
                                    <p className="font-semibold mb-1">{txt.sender}</p>
                                    <p>{txt.msg}</p>
                                    {txt.img && (
                                        <img src={txt.img} alt="Uploaded" className="mt-2 rounded-lg max-w-full h-auto" />
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <form onSubmit={submithandler} className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                    <div className="flex items-center space-x-2">
                        <div className="flex-1 relative">
                            {suggestions.length > 0 && (
                                <div className={`absolute bottom-full left-0 mb-1 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-lg rounded-lg overflow-hidden`}>
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <input
                                id="textmessage"
                                name="textmessage"
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder="Type your message here..."
                                className={`w-full p-3 rounded-full ${isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-800 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </div>
                        <label className="flex items-center justify-center w-10 h-10 bg-violet-500 rounded-full cursor-pointer hover:bg-violet-600 transition-colors shadow-md">
                            <UploadIcon className="w-5 h-5 text-white" />
                            <input
                                id="upload"
                                name="upload"
                                type="file"
                                accept="image/png, image/gif, image/jpeg, image/jpg"
                                className="hidden"
                                onChange={uploadhandler}
                            />
                        </label>
                        <button
                            type="submit"
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-full transition-colors shadow-md"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    )
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
    )
}

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    )
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    )
}