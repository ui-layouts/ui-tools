"use client";

import ToolsHeader from "@/components/common/tools-header";
import { usePathname } from "next/navigation";
import type React from "react";

function Toolslayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isFullPlayground =
		pathname === "/svg-line-draw" || pathname === "/shadows";

	return (
		<div className="h-screen overflow-hidden bg-white text-black dark:bg-black dark:text-white">
			{!isFullPlayground && <ToolsHeader />}
			<main
				className={
					isFullPlayground
						? "h-full overflow-hidden"
						: "h-full overflow-hidden px-3 pt-20 pb-3 xl:px-6"
				}
			>
				{children}
			</main>
		</div>
	);
}

export default Toolslayout;
