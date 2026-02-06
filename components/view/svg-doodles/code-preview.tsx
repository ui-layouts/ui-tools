"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CodePreviewProps {
	code: string;
}

export function CodePreview({ code }: CodePreviewProps) {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="relative">
			<pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-gray-100 text-xs">
				<code>{code}</code>
			</pre>
			<Button
				size="sm"
				variant="ghost"
				className="absolute top-2 right-2 h-8 w-8 bg-gray-800 p-0 text-gray-100 hover:bg-gray-700"
				onClick={copyToClipboard}
			>
				{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
			</Button>
		</div>
	);
}
