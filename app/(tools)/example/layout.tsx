import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
	alternates: {
		canonical: "/example",
	},
	robots: {
		index: false,
		follow: false,
	},
};

export default function ExampleLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
