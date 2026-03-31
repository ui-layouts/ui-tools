"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import ThemeSwitch from "../theme-switcher";
import GitHubSmallButton from "../ui/github-small-btn";
import { useMediaQuery } from "../ui/use-media-query";
import MobileHeader from "./mobile-header";

function ToolsHeader({ className }: { className?: string }) {
  const isMobile = useMediaQuery("(max-width:1024px)");

  const pathname = usePathname();

  return (
    <>
      <header className={cn("relative z-50 w-full ", className)}>
        <div className=" mx-auto flex max-w-5xl items-center justify-between rounded-xl px-3 xl:px-0 2xl:max-w-7xl inset-shadow-[0_2px_rgb(0_0_0/0.10)] h-11 gap-1 bg-card-bg font-semibold text-xs 2xl:text-base dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] ">
          <div className="flex items-center gap-2">
            {isMobile && <MobileHeader />}
            <Link
              href="/"
              className="inset-shadow-[0_2px_rgb(0_0_0/0.10)] inline-block h-10 rounded-lg bg-card-bg px-2 pb-.5 sm:h-11 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]"
            >
              <svg
                width="208"
                height="48"
                viewBox="0 0 208 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-20 sm:w-28"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M71.8678 32.8457H83.6653V44.0914C83.6653 45.1429 83.2789 46.0571 82.506 46.8343C81.7331 47.6114 80.8012 48 79.7101 48H63.8891C62.798 48 61.8661 47.6114 61.0932 46.8343C60.3203 46.0571 59.9339 45.1429 59.9339 44.0914V39.2914C59.9339 38.1943 59.5475 37.2571 58.7746 36.48C58.0017 35.6571 57.0698 35.2457 55.9787 35.2457H51.887C50.8414 35.2457 49.9322 34.88 49.1593 34.1486C48.3864 33.3714 48 32.4343 48 31.3371V0H59.7975V17.6229H69.6856C70.0038 17.6229 70.2766 17.7371 70.5039 17.9657C70.7312 18.1943 70.8449 18.4686 70.8449 18.7886V29.2114C70.8449 29.5314 70.7312 29.8057 70.5039 30.0343C70.2766 30.2629 70.0038 30.3771 69.6856 30.3771H59.7975V34.0114C59.7975 34.3314 59.9112 34.6057 60.1385 34.8343C60.3658 35.0629 60.6386 35.1771 60.9568 35.1771H70.7085C71.0267 35.1771 71.2995 35.0629 71.5268 34.8343C71.7541 34.6057 71.8678 34.3314 71.8678 34.0114V32.8457Z"
                  fill="currentColor"
                />
                <path
                  d="M118.626 17.6914C119.717 17.6914 120.649 18.08 121.422 18.8571C122.195 19.6343 122.581 20.5486 122.581 21.6V44.0914C122.581 45.1429 122.195 46.0571 121.422 46.8343C120.649 47.6114 119.717 48 118.626 48H90.8027C89.7571 48 88.8478 47.6114 88.075 46.8343C87.3021 46.0571 86.9157 45.1429 86.9157 44.0914V21.6C86.9157 20.5486 87.3021 19.6343 88.075 18.8571C88.8478 18.08 89.7571 17.6914 90.8027 17.6914H118.626ZM110.783 34.08V31.6114C110.783 31.2914 110.67 31.0171 110.443 30.7886C110.215 30.56 109.942 30.4457 109.624 30.4457H99.1906C98.8723 30.4457 98.5995 30.56 98.3722 30.7886C98.1449 31.0171 98.0313 31.2914 98.0313 31.6114V34.08C98.0313 34.4 98.1449 34.6743 98.3722 34.9029C98.5995 35.1314 98.8723 35.2457 99.1906 35.2457H109.624C109.942 35.2457 110.215 35.1314 110.443 34.9029C110.67 34.6743 110.783 34.4 110.783 34.08Z"
                  fill="currentColor"
                />
                <path
                  d="M158.783 17.6914C159.874 17.6914 160.806 18.08 161.579 18.8571C162.352 19.6343 162.738 20.5486 162.738 21.6V44.0914C162.738 45.1429 162.352 46.0571 161.579 46.8343C160.806 47.6114 159.874 48 158.783 48H130.96C129.914 48 129.005 47.6114 128.232 46.8343C127.459 46.0571 127.073 45.1429 127.073 44.0914V21.6C127.073 20.5486 127.459 19.6343 128.232 18.8571C129.005 18.08 129.914 17.6914 130.96 17.6914H158.783ZM150.941 34.08V31.6114C150.941 31.2914 150.827 31.0171 150.6 30.7886C150.372 30.56 150.099 30.4457 149.781 30.4457H139.348C139.029 30.4457 138.757 30.56 138.529 30.7886C138.302 31.0171 138.188 31.2914 138.188 31.6114V34.08C138.188 34.4 138.302 34.6743 138.529 34.9029C138.757 35.1314 139.029 35.2457 139.348 35.2457H149.781C150.099 35.2457 150.372 35.1314 150.6 34.9029C150.827 34.6743 150.941 34.4 150.941 34.08Z"
                  fill="currentColor"
                />
                <path d="M180.05 48H167.366V0H180.05V48Z" fill="currentColor" />
                <path
                  d="M190.952 22.2857V13.7143H208V22.2857H199.476V30.8571H182.427V22.2857H190.952ZM208 39.4286H199.476V30.8571H208V39.4286ZM199.476 39.4286V48H182.427V39.4286H199.476Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.00052884 12.2411V3.27164C0.00052884 2.3814 0.402052 1.60244 1.2051 0.934756C1.95461 0.311588 2.86473 0 3.93547 0H23.289C24.5738 0 25.6713 0.378356 26.5815 1.13506C27.4916 1.89176 27.9466 2.782 27.9466 3.80577V7.14417C27.9466 8.07892 28.2143 8.94691 28.7497 9.74813C29.2851 10.5493 30.0346 11.1725 30.9982 11.6176C31.9083 12.1073 32.9255 12.3743 34.0498 12.4188H37.4226C38.654 12.4188 39.7247 12.7749 40.6348 13.4871C41.5449 14.2438 42 15.1563 42 16.2246V34.1473C42 34.1868 41.9998 34.2262 41.9995 34.2655V44.6399C41.9995 45.5542 41.5979 46.3543 40.7949 47.04C40.0454 47.68 39.1353 48 38.0645 48H18.711C17.4262 48 16.3287 47.6114 15.4185 46.8343C14.5084 46.0571 14.0534 45.1428 14.0534 44.0914V40.6627C14.0534 39.7027 13.7857 38.8113 13.2503 37.9884C12.7149 37.1655 11.9654 36.5255 11.0018 36.0684C10.0917 35.5655 9.07446 35.2912 7.95019 35.2455H4.57738C3.34604 35.2455 2.27531 34.8798 1.36518 34.1483C0.455061 33.3712 0 32.434 0 31.3369V12.3429C0 12.3089 0.000176555 12.275 0.00052884 12.2411ZM27.8663 34.6719V13.6207C27.8663 13.3091 27.7593 13.042 27.5451 12.8195C27.2774 12.5969 26.9562 12.4856 26.5815 12.4856H15.2585C14.8837 12.4856 14.5625 12.5969 14.2948 12.8195C14.2537 12.8536 14.2158 12.8889 14.181 12.9251L14.1337 34.0112C14.1337 34.3312 14.2407 34.6055 14.4549 34.8341C14.7226 35.0626 15.0438 35.1769 15.4185 35.1769H26.7415C27.1163 35.1769 27.4375 35.0626 27.7052 34.8341C27.7658 34.7824 27.8195 34.7283 27.8663 34.6719Z"
                  fill="currentColor"
                />
              </svg>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {!isMobile && (
              <nav className="">
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
                  Color Lab
                </Link>
              </nav>
            )}

            <ThemeSwitch className="inset-shadow-[0_2px_rgb(0_0_0/0.10)] h-11 w-12 shrink-0 cursor-pointer rounded-md bg-card-bg dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]" />
            <a
              href="https://x.com/naymur_dev"
              target="_blank"
              rel="noreferrer"
              className="grid h-11 w-12 shrink-0 place-content-center rounded-md border bg-primary text-2xl text-primary-foreground"
            >
              <span className="sr-only">Visit Naymur’s X profile</span>
              <svg
                width="120"
                height="109"
                viewBox="0 0 120 109"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-6 fill-primary-foreground"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M94.5068 0H112.907L72.7076 46.172L120 109H82.9692L53.9674 70.8942L20.7818 109H2.3693L45.3666 59.6147L0 0H37.9685L64.1848 34.8292L94.5068 0ZM88.0484 97.9318H98.2448L32.4288 10.4872H21.4882L88.0484 97.9318Z" />
              </svg>
            </a>

            {pathname !== "/" && (
              // <a href='https://github.com/naymurdev/ui-tools' target='_blank' className=" grid place-content-center inset-shadow-[0_2px_rgb(0_0_0/0.10)] cursor-pointer dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]  bg-card-bg  w-12 rounded-md h-11 flex-shrink-0">
              //   <Github />
              // </a>
              <GitHubSmallButton />
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default ToolsHeader;
