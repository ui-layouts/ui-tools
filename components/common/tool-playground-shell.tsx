"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Copy, Download, EllipsisVertical, RotateCcw } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface ToolPlaygroundShellProps {
	title: string;
	description: string;
	examples: string[];
	docs: string;
	exportLabel: string;
	exportCode: string;
	children: React.ReactNode;
}

export function ToolPlaygroundShell({
	title,
	description,
	examples,
	docs,
	exportLabel,
	exportCode,
	children,
}: ToolPlaygroundShellProps) {
	const [topTab, setTopTab] = useState("playground");
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [filter, setFilter] = useState("");

	const copyCode = async () => {
		await navigator.clipboard.writeText(exportCode);
		toast.success("Copied");
	};

	return (
		<div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-card-bg">
			<header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b px-4">
				<div className="min-w-0">
					<h1 className="truncate font-semibold text-lg">{title}</h1>
					<p className="truncate text-muted-foreground text-xs">{description}</p>
				</div>

				<Tabs value={topTab} onValueChange={setTopTab} className="hidden md:block">
					<TabsList>
						<TabsTrigger value="playground">Playground</TabsTrigger>
						<TabsTrigger value="examples">Examples</TabsTrigger>
						<TabsTrigger value="docs">Docs</TabsTrigger>
					</TabsList>
				</Tabs>

				<div className="hidden items-center gap-2 lg:flex">
					<Button size="sm" onClick={() => setDrawerOpen(true)}>
						Export code
					</Button>
					<Button variant="outline" size="sm" onClick={copyCode}>
						<Copy className="mr-1 h-4 w-4" /> Copy
					</Button>
					<Button variant="outline" size="sm" onClick={() => location.reload()}>
						<RotateCcw className="mr-1 h-4 w-4" /> Reset
					</Button>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild className="lg:hidden">
						<Button variant="outline" size="icon">
							<EllipsisVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => setDrawerOpen(true)}>
							Export code
						</DropdownMenuItem>
						<DropdownMenuItem onClick={copyCode}>Copy</DropdownMenuItem>
						<DropdownMenuItem onClick={() => location.reload()}>Reset</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</header>

			<div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)]">
				<aside className="min-h-0 border-r">
					<div className="sticky top-0 z-10 border-b bg-card-bg p-3">
						<Input
							placeholder="Search presets"
							value={filter}
							onChange={(e) => setFilter(e.target.value)}
						/>
					</div>
					<div className="h-[calc(100%-60px)] overflow-y-auto p-3">
						{topTab !== "docs" && (
							<section className="mb-4 space-y-2">
								<h2 className="font-medium text-sm">Presets / Examples</h2>
								{examples
									.filter((item) =>
										item.toLowerCase().includes(filter.toLowerCase()),
									)
									.map((item) => (
										<button
											type="button"
											key={item}
											className="mb-2 block w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-accent"
										>
											{item}
										</button>
									))}
							</section>
						)}
						<section>
							<h2 className="mb-2 font-medium text-sm">
								{topTab === "docs" ? "Docs" : "Controls"}
							</h2>
							<div className="rounded-md border bg-background p-3 text-muted-foreground text-sm">
								{topTab === "docs"
									? docs
									: "All existing controls are preserved below in the tool panel. Use this sidebar as the single scroll region."}
							</div>
						</section>
					</div>
				</aside>

				<section className="relative min-h-0 overflow-hidden bg-background/30">
					<div className="h-full overflow-hidden p-2">
						<div className="h-full overflow-hidden rounded-xl border bg-background">{children}</div>
					</div>
				</section>
			</div>

			<div
				className={cn(
					"pointer-events-none fixed top-0 right-0 z-[90] h-screen w-full max-w-xl translate-x-full border-l bg-background/95 opacity-0 backdrop-blur transition-all",
					drawerOpen && "pointer-events-auto translate-x-0 opacity-100",
				)}
			>
				<div className="flex h-16 items-center justify-between border-b px-4">
					<h3 className="font-semibold">Export</h3>
					<Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>
						Close
					</Button>
				</div>
				<div className="h-[calc(100vh-64px)] overflow-y-auto p-4">
					<p className="mb-2 text-muted-foreground text-xs">{exportLabel}</p>
					<pre className="overflow-x-auto rounded-md border bg-card p-3 text-xs">{exportCode}</pre>
					<div className="mt-3 flex gap-2">
						<Button size="sm" onClick={copyCode}>
							<Copy className="mr-1 h-4 w-4" /> Copy
						</Button>
						<Button size="sm" variant="outline">
							<Download className="mr-1 h-4 w-4" /> Download
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
