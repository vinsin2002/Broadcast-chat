import { FC, useState } from "react";
import { Layout } from "../components/Layout";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
const socket = io('http://localhost:3001');
export const ChatPage: FC = () => {
    type Message = { msg: string,img: any, sender: string };
    const [messageq, setmessageq] = useState<Message[]>([]);
    const {state} = useLocation();
    const { id } = state; 
    socket.on("receieve_message",(data)=>{
      setmessageq([...messageq,{msg:data.message,sender: data.name,img:""}])
    })
    socket.on("download", (data)=>{
      setmessageq([...messageq,{msg:"",sender: data.name,img:data.data}])
    })
    function uploadhandler(event: any)
    {
      socket.emit("upload", {data:event.currentTarget.files[0],name:id});
      setmessageq([...messageq,{msg:"file sent",sender: id,img:""}])
    }
    function submithandler(event: React.FormEvent<HTMLFormElement>)
	{
		event.preventDefault();
		const form = event.currentTarget
		const formElements = form.elements as typeof form.elements & {
			textmessage: {value: string},
		  }
        setmessageq([...messageq,{msg:formElements.textmessage.value,sender: id,img: ""}])
        socket.emit("send_message",{message: formElements.textmessage.value,name: id});
        formElements.textmessage.value = "";
	}
	return (
		<Layout>
			<div className="h-screen overflow-scroll w-screen bg-gray-900 flex flex-col min-h-screen ">
                <h1 className="text-center text-white p-2 m-2 bg-green-900 rounded-lg ">Hi {id}!</h1>
                {messageq.map((txt)=>(
                    <h1 className={`text-center text-white p-2 m-2 rounded-lg ${txt.sender === id ? 'bg-blue-500' : 'bg-gray-500'} `}>{txt.sender}: {txt.msg} <div className="flex justify-center items-center"><img src={txt.img} alt="" /></div> </h1>
                ))}
                <form action="" onSubmit={submithandler} className="flex justify-evenly items-center mt-auto p-2 mb-6">
                        <input id="textmessage" name="textmessage" type="text" placeholder="type your message here .... " className="w-full rounded-md h-10 outline-none border-2 focus:border-green-400 p-2 text-gray-600 "/>
                        <div className="flex w-20 h-10 items-center justify-center bg-grey-lighter">
                          <label className="w-16 h-10 m-1 flex flex-col justify-center items-center  bg-violet-500 text-blue rounded-md shadow-lg tracking-wide border border-violet-500 cursor-pointer hover:bg-blue text-white">
                              <h1 className="text-sm">upload</h1>
                              <input id="upload" name="upload" type='file' accept="image/png, image/gif, image/jpeg, image/jpg" className="hidden" onChange={uploadhandler} />
                          </label>
                        </div>
                        <button type="submit" className="bg-green-600 w-20 rounded-md m-1 h-10 text-white ">send</button>
                </form>
            </div>
		</Layout>
	);
};
