"use client";

import ToolsHeader from "@/components/common/tools-header";
import { usePathname } from "next/navigation";
import type React from "react";

function Toolslayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isLineDraw = pathname === "/svg-line-draw";

	return (
		<div className="h-screen overflow-hidden bg-white text-black dark:bg-black dark:text-white">
			{!isLineDraw && <ToolsHeader />}
			<main
				className={
					isLineDraw
						? "h-full overflow-hidden"
						: "h-full overflow-hidden px-3 pb-3 pt-20 xl:px-6"
				}
			>
				{children}
			</main>
		</div>
	);
}

export default Toolslayout;
