import ToolsHeader from "@/components/common/tools-header";
import type React from "react";

function Toolslayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="h-screen overflow-hidden bg-white text-black dark:bg-black dark:text-white">
			<ToolsHeader />
			<main className="h-full overflow-hidden px-3 pb-3 pt-20 xl:px-6">{children}</main>
		</div>
	);
}

export default Toolslayout;
