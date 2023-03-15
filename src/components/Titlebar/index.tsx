import { FC, useEffect } from "react";
// import {
// 	IoCloseOutline,
// 	IoContractOutline,
// 	IoExpandOutline,
// 	IoRemove,
// } from "react-icons/io5";
import Amethyst from "../../assets/vinsin.png";

const { getCurrentWindow, app } = window.require("@electron/remote");

export const Titlebar: FC = () => {
	const currentWindow = getCurrentWindow();

	useEffect(() => {
		const icon = document.getElementById("icon") as HTMLElement;
		icon.ondragstart = () => false;
	});

	const onMinimize = () => currentWindow.minimize();
	const onMaximize = () => {
		currentWindow.isMaximized()
			? currentWindow.unmaximize()
			: currentWindow.maximize();
	};
	const onQuit = () => app.quit();

	return (
		<div className="title-bar sticky top-0 select-none">
			<div className="menu-button-container">
				<img
					id="icon"
					src={Amethyst}
					className="menu-icon select-none"
					alt="amethyst"
				/>
			</div>
			<div className="app-name-container select-none">
				<p  >Broadcast-chat-app</p>
			</div>
			<div className="window-controls-container">
				<button
					title="Minimize"
					className="minimize-button focus:outline-none hover:bg-gray-700"
					onClick={onMinimize}
				>
					<div className="w-3 h-3 rounded-full bg-green-500"></div>
					{/* <IoRemove /> */}
				</button>
				<button
					title="Maximize"
					className="min-max-button focus:outline-none hover:bg-gray-700"
					onClick={onMaximize}
				>
					<div className="w-3 h-3 rounded-full bg-yellow-500"></div>
					{/* {maximized ? <IoContractOutline /> : <IoExpandOutline />} */}
				</button>
				<button
					title="Close"
					className="close-button focus:outline-none hover:bg-gray-700"
					onClick={onQuit}
				>
					<div className="w-3 h-3 rounded-full bg-red-500"></div>
					{/* <IoCloseOutline /> */}
				</button>
			</div>
		</div>
	);
};
