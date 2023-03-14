import { FC } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { IndexPage } from "./pages";
import { PopupPage } from "./pages/popup";
import { ChatPage } from "./pages/Chat"
export const Router: FC = () => {
	return (
		<HashRouter>
			<Routes>
				<Route path="/">
					<Route index element={<IndexPage />} />
					<Route path="popup" element={<PopupPage />} />
				</Route>
				<Route path="/chat" element={<ChatPage/>}>

				</Route>
			</Routes>
		</HashRouter>
	);
};
