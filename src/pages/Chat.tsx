import { FC, useState } from "react";
import { Layout } from "../components/Layout";
import { useLocation } from "react-router-dom";
export const ChatPage: FC = () => {
    type Message = { msg: string, sender: string };
    const [messageq, setmessageq] = useState<Message[]>([]);
    const {state} = useLocation();
    const { id } = state;
    function submithandler(event: React.FormEvent<HTMLFormElement>)
	{
		event.preventDefault();
		const form = event.currentTarget
		const formElements = form.elements as typeof form.elements & {
			textmessage: {value: string}
		  }
        setmessageq([...messageq,{msg:formElements.textmessage.value,sender: id}])
        formElements.textmessage.value = "";
	}
	return (
		<Layout>
			<div className="h-screen overflow-scroll w-screen bg-gray-900 flex flex-col min-h-screen ">
                <h1 className="text-center text-white p-2 m-2 bg-green-900 rounded-lg ">Hi {id}!</h1>
                {messageq.map((txt)=>(
                    <h1 className={`text-center text-white p-2 m-2 rounded-lg ${txt.sender === id ? 'bg-blue-500' : 'bg-gray-500'} `}>{txt.sender}: {txt.msg}</h1>
                ))}
                <form action="" onSubmit={submithandler} className="flex justify-evenly items-center mt-auto p-2 mb-6">
                        <input id="textmessage" name="textmessage" type="text" placeholder="type your message here .... " className="w-full rounded-md h-10 outline-none border-2 focus:border-green-400 p-2 text-gray-600 "/>
                        <button type="submit" className="bg-green-600 w-20 rounded-md m-1 h-10 text-white ">send</button>
                </form>
            </div>
		</Layout>
	);
};
