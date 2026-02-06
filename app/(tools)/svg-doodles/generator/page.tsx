import React, { Suspense } from "react";
import SvgDoodlesGenerator from "@/components/view/svg-doodles/generator";
const PageLoading = () => {
  return (
    <>
      <div className="mx-auto h-28 w-[50%] animate-pulse rounded-lg border bg-card-bg" />
      <div className="mx-auto grid w-[70%] grid-cols-3 gap-5 pt-10 md:grid-cols-6">
        {Array.from({ length: 18 }).map((_, index) => (
          <div
            key={index}
            className="h-36 w-full animate-pulse rounded-lg border bg-card-bg"
          />
        ))}
      </div>
    </>
  );
};
function page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SvgDoodlesGenerator />;
    </Suspense>
  );
}

export default page;
