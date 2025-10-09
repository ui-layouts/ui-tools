import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { Button } from "../ui/button";

function MobileHeader({ classname }: { classname?: string }) {
	const pathname = usePathname();
	//   const [sidebarOpen, setSidebarOpen] = useState(false);
	return (
		<>
			<Sheet>
				<SheetTrigger asChild>
					<button type="button" className={cn("cursor-pointer p-0", classname)}>
						<svg
							width="642"
							height="421"
							viewBox="0 0 642 421"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className=" h-9 w-9 stroke-primary"
							aria-hidden="true"
							focusable="false"
						>
							<path
								d="M52.333 359H252.333"
								strokeWidth="66.6667"
								strokeLinecap="round"
							/>
							<path
								d="M52.333 212H452.333"
								strokeWidth="66.6667"
								strokeLinecap="round"
							/>
							<path
								d="M52.333 65H585.666"
								strokeWidth="66.6667"
								strokeLinecap="round"
							/>
						</svg>
					</button>
				</SheetTrigger>
				<SheetContent side={"left"}>
					<div className="grid gap-4 py-4">
						<nav className="inset-shadow-[0_2px_rgb(0_0_0/0.10)] flex flex-col space-y-2 rounded-xl bg-card-bg p-4 font-semibold text-sm dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]">
							<Link
								href="/svg-line-draw"
								className={cn(
									"inline-block rounded-lg p-2 px-3",
									pathname === "/svg-line-draw" &&
										"bg-primary text-primary-foreground",
								)}
							>
								SVG Line Draw
							</Link>
							<Link
								href="/shadows"
								className={cn(
									"inline-block rounded-lg p-2 px-3",
									pathname === "/shadows" &&
										"bg-primary text-primary-foreground",
								)}
							>
								Shadows
							</Link>
							<Link
								href="/clip-paths"
								className={cn(
									"inline-block rounded-lg p-2 px-3",
									pathname === "/clip-paths" &&
										"bg-primary text-primary-foreground",
								)}
							>
								Clip-Path
							</Link>
							<Link
								href="/mesh-gradients"
								className={cn(
									"inline-block rounded-lg p-2 px-3",
									pathname === "/mesh-gradients" &&
										"bg-primary text-primary-foreground",
								)}
							>
								Mesh-Gradient
							</Link>
							<Link
								href="/background-snippets"
								className={cn(
									"inline-block rounded-lg p-2 px-3",
									pathname === "/background-snippets" &&
										"bg-primary text-primary-foreground",
								)}
							>
								Background Snippets
							</Link>
							<Link
								href="/color-lab"
								className={cn(
									"inline-block rounded-lg p-2 px-3",
									pathname === "/color-lab" &&
										"bg-primary text-primary-foreground",
								)}
							>
								Background Snippets
							</Link>
							<Link
								href="/color-lab"
								className={cn(
									"inline-block rounded-lg p-2 px-3",
									pathname === "/color-lab" &&
										"bg-primary text-primary-foreground",
								)}
							>
								Color Lab
							</Link>
						</nav>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}

export default MobileHeader;
