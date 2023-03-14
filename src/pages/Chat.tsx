import { FC } from "react";
import { Layout } from "../components/Layout";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
export const ChatPage: FC = () => {
    const {state} = useLocation();
    const { id } = state;
    const navigate = useNavigate();
    function submithandler()
    {
        navigate("/");
    }
	return (
		<Layout>
			<div className="h-screen w-screen bg-gray-900 flex flex-col min-h-screen ">
                <form action="" className="flex justify-evenly items-center mt-auto p-2">
                        <input type="text" placeholder="type your message here .... " className="w-full rounded-md h-10 outline-none border-2 focus:border-green-400 p-2 text-gray-600 "/>
                        <button onClick={submithandler} className="bg-green-600 w-20 rounded-md m-1 h-10 text-white ">send</button>
                </form>
            </div>
		</Layout>
	);
};
