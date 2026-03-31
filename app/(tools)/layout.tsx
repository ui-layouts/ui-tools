import type React from "react";

function Toolslayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="bg-white pt-28 text-black dark:bg-black dark:text-white">
        {children}
      </main>
    </>
  );
}

export default Toolslayout;
