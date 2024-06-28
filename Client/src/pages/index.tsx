import { FC } from "react";
import { Layout } from "../components/Layout";
import { useNavigate } from "react-router-dom";
export const IndexPage: FC = () => {
	const navigate = useNavigate();
	function submithandler(event: React.FormEvent<HTMLFormElement>)
	{
		event.preventDefault();
		const form = event.currentTarget
		const formElements = form.elements as typeof form.elements & {
			username: {value: string}
		  }
		console.log(formElements.username.value);
		navigate("/chat",{ state: { id: formElements.username.value} })
	}
	return (
		<Layout>
			<div className=" h-screen w-auto bg-gray-900 flex justify-center items-center ">
				<div className=" bg-green-500 w-80 h-96 rounded-tl-3xl rounded-br-3xl  flex justify-center items-center ">
					<form onSubmit={submithandler} className=" flex flex-col space-y-3  justify-center items-center">
						<input type="text" id="username" name="username" className=" text-center w-64 h-9 rounded-3xl p-3 outline-none border-2 focus:border-blue-400 placeholder:text-center" placeholder=" Enter username " />
						<button type="submit" className=" text-center w-2/3 text-white border-2 rounded-full p-2 m-2 hover:bg-white hover:text-green-500 ">submit</button>
					</form>
				</div>
			</div>
		</Layout>
	);
};
