"use client";
import React, { Suspense, useEffect, useState } from "react";

import { images } from "@/components/assets";
import ToolsHeader from "@/components/common/tools-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import GitHubButton from "@/components/ui/github-button";
import { CustomSlider } from "@/components/ui/range-slider";
import { useMediaQuery } from "@/components/ui/use-media-query";
import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";
import { Car, ChevronsRight, Lightbulb, MoveRight } from "lucide-react";
import { LayoutGroup, motion } from "motion/react";
import { useTheme } from "next-themes";
import Image, { type StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import SendIdea from "./send-idea";
import CarbonAd from "@/components/common/carbon-ads";
type UiTool = {
  id: number;
  title: string;
  description: string;
  img: StaticImageData;
  path: string;
  new?: boolean;
};
function HomeIndex() {
  const isTab = useMediaQuery("(max-width:1024px)");

  const { theme } = useTheme();
  const [uiTools, setUiTools] = useState<UiTool[]>([]);

  useEffect(() => {
    setUiTools([
      {
        id: 1,
        title: "SVG Line Draw",
        description:
          "SVG Line Draw is your creative playground for sketching hand-drawn lines, arrows, highlights, and animations. Perfect for annotations, web design, and interactive storytelling.",
        img: theme === "dark" ? images.svgLineDraw : images.whiteSvgLineDraw,
        path: "/svg-line-draw",
        new: true,
      },
      {
        id: 1,
        title: "Shadow Generator",
        description:
          "Create smooth, customizable CSS shadows for your UI components with a live preview and easy export.",
        img: theme === "dark" ? images.shadow : images.whiteShadow,
        path: "/shadows",
      },
      {
        id: 2,
        title: "SVG Clip-Path Generator",
        description:
          "Edit and generate complex SVG clip-paths visually. Copy SVG code or React components instantly.",
        img: theme === "dark" ? images.clipPath : images.whiteClipPath,
        path: "/clip-paths",
      },
      {
        id: 3,
        title: "Mesh Gradient Creator",
        description:
          "Design stunning mesh gradients effortlessly. Perfect for modern backgrounds and hero sections.",
        img: theme === "dark" ? images.meshGradient : images.whiteMeshGradient,
        path: "/mesh-gradients",
      },
      {
        id: 4,
        title: "Background Snippets",
        description:
          "Create unique background snippets with customizable colors and patterns. Perfect for modern UI design.",
        img: theme === "dark" ? images.bgSnippets : images.whiteBgSnippets,
        path: "/background-snippets",
      },
      {
        id: 1,
        title: "Color Lab",
        description:
          "Color Lab is your ultimate color toolkit. Generate stunning palettes, convert between HEX, RGB, HSL, and explore StatsCN Theme Generator – perfect for designers and developers.",
        img: theme === "dark" ? images.svgLineDraw : images.whiteSvgLineDraw,
        path: "/color-lab",
        new: true,
      },
    ]);
  }, [theme]);

  return (
    <>
      <svg
        className="clipppy -top-[999px] -left-[999px] absolute h-0 w-0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id="clip-squiggle" clipPathUnits="objectBoundingBox">
            <path
              d="M0.434125 0.00538712C0.56323 -0.00218488 0.714575 -0.000607013 0.814404 0.00302954L0.802642 0.163537C0.813884 0.167475 0.824927 0.172002 0.835358 0.177236C0.869331 0.194281 0.909224 0.225945 0.90824 0.27348C0.907177 0.324883 0.858912 0.354946 0.822651 0.36933C0.857426 0.376783 0.894591 0.387558 0.925837 0.404287C0.968002 0.426862 1.00569 0.464702 0.999287 0.515878C0.993163 0.564818 0.950731 0.597642 0.904098 0.615682C0.88204 0.624216 0.858239 0.62992 0.834803 0.633808C0.858076 0.639299 0.881603 0.646639 0.90267 0.656757C0.946271 0.677698 0.986875 0.715485 0.978905 0.768037C0.972241 0.811979 0.93615 0.843109 0.895204 0.862035C0.858032 0.879217 0.815169 0.887544 0.778534 0.892219C0.704792 0.901628 0.614366 0.901003 0.535183 0.899176C0.508115 0.898551 0.482286 0.89779 0.45773 0.897065C0.404798 0.895504 0.357781 0.894117 0.317008 0.894657C0.301552 0.894862 0.289265 0.895348 0.279749 0.895976C0.251913 0.937168 0.226467 0.980907 0.216015 1L0 0.941216C0.0140558 0.915539 0.051354 0.851547 0.0902557 0.797766C0.118421 0.758828 0.1722 0.745373 0.200402 0.740217C0.168437 0.733484 0.134299 0.723597 0.105102 0.708076C0.0614715 0.684884 0.0263696 0.64687 0.0325498 0.596965C0.0385804 0.548267 0.0803829 0.515256 0.12709 0.496909C0.146901 0.489127 0.168128 0.483643 0.189242 0.479724C0.163739 0.476035 0.137977 0.471053 0.115188 0.463936C0.0874831 0.455285 0.00855855 0.424854 0.016569 0.357817C0.0231721 0.302559 0.0838593 0.276249 0.116031 0.266164C0.149646 0.255625 0.188201 0.2505 0.221821 0.247468C0.208809 0.243824 0.195905 0.239492 0.183801 0.234287C0.152543 0.220846 0.101565 0.189547 0.105449 0.136312C0.108467 0.0949629 0.144168 0.0682612 0.171101 0.0543099C0.197578 0.0405945 0.227933 0.032236 0.25348 0.0267029C0.305656 0.0154021 0.370636 0.00911076 0.434125 0.00538712Z"
              fill="black"
            />
          </clipPath>
        </defs>
        <defs>
          <clipPath id="differentone17" clipPathUnits="objectBoundingBox">
            <path
              d="M0.841643 0.386119L0.727762 0.42401C0.709627 0.430173 0.690277 0.431886 0.671342 0.429007C0.68196 0.414433 0.696325 0.401942 0.714854 0.392573L0.822073 0.338859C0.839106 0.330353 0.853874 0.31792 0.865158 0.302585C0.876442 0.28725 0.88392 0.269452 0.886974 0.25066C0.890029 0.231867 0.888572 0.212617 0.882725 0.194498C0.876879 0.176379 0.866809 0.159909 0.853346 0.146446C0.839883 0.132983 0.823413 0.122913 0.805294 0.117066C0.787174 0.11122 0.767925 0.109763 0.749132 0.112818C0.730339 0.115872 0.712542 0.12335 0.697207 0.134634C0.681872 0.145918 0.669439 0.160685 0.660932 0.177719L0.607427 0.285146C0.598981 0.302441 0.586482 0.31744 0.570993 0.328866C0.56808 0.309863 0.569794 0.290437 0.57599 0.272238L0.613881 0.158357C0.619946 0.140292 0.621625 0.121043 0.618782 0.102201C0.615938 0.0833579 0.608652 0.0654622 0.597527 0.0499913C0.586401 0.0345205 0.571754 0.0219184 0.554796 0.0132259C0.537839 0.00453345 0.519056 0 0.5 0C0.480944 0 0.462162 0.00453345 0.445204 0.0132259C0.428246 0.0219184 0.413599 0.0345205 0.402473 0.0499913C0.391348 0.0654622 0.384062 0.0833579 0.381218 0.102201C0.378375 0.121043 0.380055 0.140292 0.386119 0.158357L0.42401 0.272238C0.430173 0.290373 0.431886 0.309723 0.429007 0.328658C0.413564 0.317355 0.401068 0.302502 0.392573 0.285354L0.338859 0.177927C0.330353 0.160894 0.31792 0.146126 0.302585 0.134842C0.28725 0.123558 0.269452 0.11608 0.25066 0.113026C0.231867 0.109971 0.212617 0.111428 0.194498 0.117275C0.176379 0.123121 0.159909 0.133191 0.146446 0.146654C0.132983 0.160117 0.122913 0.176587 0.117066 0.194706C0.11122 0.212826 0.109763 0.232075 0.112818 0.250868C0.115872 0.269661 0.12335 0.287458 0.134634 0.302793C0.145918 0.318128 0.160685 0.330561 0.177719 0.339068L0.285146 0.392573C0.302441 0.401019 0.31744 0.413518 0.328866 0.429007C0.310754 0.431921 0.291392 0.430464 0.272238 0.42401L0.158357 0.386119C0.140292 0.380055 0.121043 0.378375 0.102201 0.381218C0.0833579 0.384062 0.0654622 0.391348 0.0499913 0.402473C0.0345205 0.413599 0.0219184 0.428246 0.0132259 0.445204C0.00453345 0.462162 0 0.480944 0 0.5C0 0.519056 0.00453345 0.537839 0.0132259 0.554796C0.0219184 0.571754 0.0345205 0.586401 0.0499913 0.597527C0.0654622 0.608652 0.0833579 0.615938 0.102201 0.618782C0.121043 0.621625 0.140292 0.619946 0.158357 0.613881L0.272238 0.57599C0.290373 0.569827 0.309723 0.568114 0.328658 0.570993C0.317355 0.586436 0.302502 0.598932 0.285354 0.607427L0.177927 0.661141C0.160894 0.669647 0.146126 0.68208 0.134842 0.697415C0.123558 0.71275 0.11608 0.730548 0.113026 0.74934C0.109971 0.768133 0.111428 0.787383 0.117275 0.805502C0.123121 0.823621 0.133191 0.840091 0.146654 0.853554C0.160117 0.867017 0.176587 0.877087 0.194706 0.882934C0.212826 0.888781 0.232075 0.890237 0.250868 0.887182C0.269661 0.884128 0.287458 0.876651 0.302793 0.865366C0.318128 0.854082 0.330561 0.839315 0.339068 0.822281L0.392573 0.714854C0.401019 0.697559 0.413518 0.682561 0.429007 0.671134C0.431921 0.689247 0.430464 0.708608 0.42401 0.727762L0.386119 0.841643C0.380055 0.859708 0.378375 0.878957 0.381218 0.8978C0.384062 0.916642 0.391348 0.934538 0.402473 0.950009C0.413599 0.96548 0.428246 0.978082 0.445204 0.986774C0.462162 0.995467 0.480944 1 0.5 1C0.519056 1 0.537839 0.995467 0.554796 0.986774C0.571754 0.978082 0.586401 0.96548 0.597527 0.950009C0.608652 0.934538 0.615938 0.916642 0.618782 0.8978C0.621625 0.878957 0.619946 0.859708 0.613881 0.841643L0.57599 0.727762C0.569827 0.709627 0.568114 0.690277 0.570993 0.671342C0.585567 0.68196 0.598058 0.696325 0.607427 0.714854L0.661141 0.822073C0.669647 0.839106 0.68208 0.853874 0.697415 0.865158C0.71275 0.876442 0.730548 0.88392 0.74934 0.886974C0.768133 0.890029 0.787383 0.888572 0.805502 0.882725C0.823621 0.876879 0.840091 0.866809 0.853554 0.853346C0.867017 0.839883 0.877087 0.823413 0.882934 0.805294C0.888781 0.787174 0.890237 0.767925 0.887182 0.749132C0.884128 0.730339 0.876651 0.712542 0.865366 0.697207C0.854082 0.681872 0.839315 0.669439 0.822281 0.660932L0.714854 0.607427C0.697559 0.598981 0.682561 0.586482 0.671134 0.570993C0.689247 0.568079 0.708608 0.569536 0.727762 0.57599L0.841643 0.613881C0.859708 0.619946 0.878957 0.621625 0.8978 0.618782C0.916642 0.615938 0.934538 0.608652 0.950009 0.597527C0.96548 0.586401 0.978082 0.571754 0.986774 0.554796C0.995467 0.537839 1 0.519056 1 0.5C1 0.480944 0.995467 0.462162 0.986774 0.445204C0.978082 0.428246 0.96548 0.413599 0.950009 0.402473C0.934538 0.391348 0.916642 0.384062 0.8978 0.381218C0.878957 0.378375 0.859708 0.380055 0.841643 0.386119Z"
              fill="black"
            />
          </clipPath>
        </defs>
        <defs>
          <clipPath id="differentone18" clipPathUnits="objectBoundingBox">
            <path
              d="M0.5 0C0.367392 0 0.240215 0.0526784 0.146447 0.146447C0.0526784 0.240215 0 0.367392 0 0.5L0 1H0.5C0.632608 1 0.759785 0.947322 0.853553 0.853553C0.947322 0.759785 1 0.632608 1 0.5V0H0.5ZM0.5 0.75C0.433696 0.75 0.370107 0.723661 0.323223 0.676777C0.276339 0.629893 0.25 0.566304 0.25 0.5C0.25 0.433696 0.276339 0.370107 0.323223 0.323223C0.370107 0.276339 0.433696 0.25 0.5 0.25C0.566304 0.25 0.629893 0.276339 0.676777 0.323223C0.723661 0.370107 0.75 0.433696 0.75 0.5C0.75 0.566304 0.723661 0.629893 0.676777 0.676777C0.629893 0.723661 0.566304 0.75 0.5 0.75Z"
              fill="black"
            />
          </clipPath>
        </defs>
        <defs>
          <clipPath id="differentone12" clipPathUnits="objectBoundingBox">
            <path
              d="M0.5 0.5L0.887785 0.306108C0.887785 0.249152 0.875667 0.195104 0.853611 0.146389C0.804896 0.124576 0.750848 0.112215 0.693892 0.112215L0.5 0.5ZM0.5 0.5L0.306108 0.112215C0.249152 0.112215 0.195104 0.124333 0.146389 0.146389C0.124576 0.195104 0.112215 0.249152 0.112215 0.306108L0.5 0.5ZM0.5 0.5L0.693892 0.887785C0.750848 0.887785 0.804896 0.875667 0.853611 0.853611C0.875424 0.804896 0.887785 0.750848 0.887785 0.693892L0.5 0.5ZM0.5 0.5L0.112215 0.693892C0.112215 0.750848 0.124333 0.804896 0.146389 0.853611C0.195104 0.875424 0.249152 0.887785 0.306108 0.887785L0.5 0.5ZM0.5 0.5L0.911294 0.637179C0.951527 0.596946 0.981095 0.549927 1 0.5C0.981095 0.450073 0.951527 0.403054 0.911294 0.362821L0.5 0.5ZM0.5 0.5L0.637179 0.0887058C0.598298 0.049697 0.551527 0.0194523 0.5 0C0.450073 0.0189045 0.403054 0.0484731 0.362821 0.0887058L0.5 0.5ZM0.5 0.5L0.362821 0.911294C0.403054 0.951527 0.450073 0.981095 0.5 1C0.549927 0.981095 0.596946 0.951527 0.637179 0.911294L0.5 0.5ZM0.5 0.5L0.0887058 0.362821C0.049697 0.401702 0.0194523 0.448473 0 0.5C0.0189045 0.549927 0.0484731 0.596946 0.0887058 0.637179L0.5 0.5Z"
              fill="black"
            />
          </clipPath>
        </defs>
        <defs>
          <clipPath id="differentone13" clipPathUnits="objectBoundingBox">
            <path
              d="M0.116539 0.187984L0.782476 0.0130417C0.855312 -0.00976168 0.940747 -0.00595721 0.970812 0.0510676C0.993884 0.0948284 1.00203 0.135712 0.970812 0.188931L0.771031 0.487477L0.909421 0.564491C0.978095 0.601593 1.00609 0.643428 0.998905 0.703327C0.991033 0.768954 0.961446 0.793652 0.871961 0.820274L0.220591 0.987611C0.111335 1.01233 0.047614 0.998323 0.0249724 0.960967C-0.00540408 0.91085 -0.0133159 0.889933 0.0312152 0.81552L0.0978094 0.72137L0.240362 0.512197L0.116539 0.440889C0.0509847 0.405713 0.0352626 0.383845 0.0156077 0.339155C-0.00104165 0.301299 0.0228905 0.214605 0.116539 0.187984Z"
              fill="black"
            />
          </clipPath>
        </defs>
      </svg>
      {isTab && (
        <Suspense>
          <ShaderGradientCanvas
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100vh",
            }}
            lazyLoad={false}
            pointerEvents="none"
          >
            <ShaderGradient
              control={"props"}
              animate="on"
              type="waterPlane"
              wireframe={true}
              uTime={12}
              uSpeed={0.28}
              uStrength={2.5}
              uDensity={2}
              uFrequency={0}
              uAmplitude={0}
              positionX={0.7}
              positionY={0}
              positionZ={0}
              rotationX={60}
              rotationY={0}
              rotationZ={30}
              color1="#084d9c"
              color2="#1f1fb3"
              color3="#009cff"
              reflection={0.4}
              cAzimuthAngle={184}
              cPolarAngle={67}
              cDistance={2}
              cameraZoom={8.5}
              lightType="3d"
              brightness={1.3}
              envPreset="city"
              grain="on"
              toggleAxis={false}
              zoomOut={false}
              hoverState=""
              enableTransition={false}
            />
          </ShaderGradientCanvas>
        </Suspense>
      )}
      <div className="relative min-h-screen text-white ">
        {!isTab && (
          <div className="absolute top-0 right-0 bottom-0 left-0 z-10 lg:z-0 dark:bg-[radial-gradient(125%_125%_at_50%_10%,rgba(255,255,255,0)_40%,#012ef5_100%)]" />
        )}
        <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(to_right,#4f4f4f29_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[40px_44px] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="relative mx-auto grid h-full gap-2 px-4 pt-28 pb-2 sm:px-0 md:pt-40 lg:w-[1000px] xl:pb-0">
          {!isTab && (
            <Suspense>
              <ShaderGradientCanvas
                style={{
                  position: "absolute",
                  top: 100,
                  left: !isTab ? -30 : undefined,
                  right: 0,
                  bottom: 0,
                  rotate: !isTab ? "5deg" : undefined,
                  width: isTab ? "100%" : "900px",
                  height: isTab ? "800px" : "1100px",
                  margin: "auto",
                  clipPath: !isTab ? "url(#clip-squiggle)" : undefined,
                }}
                lazyLoad={false}
                pointerEvents="none"
              >
                <ShaderGradient
                  control={"props"}
                  animate="on"
                  type="waterPlane"
                  wireframe={true}
                  uTime={12}
                  uSpeed={0.28}
                  uStrength={2.5}
                  uDensity={2}
                  uFrequency={0}
                  uAmplitude={0}
                  positionX={0.7}
                  positionY={0}
                  positionZ={0}
                  rotationX={60}
                  rotationY={0}
                  rotationZ={30}
                  color1="#084d9c"
                  color2="#1f1fb3"
                  color3="#009cff"
                  reflection={0.4}
                  cAzimuthAngle={184}
                  cPolarAngle={67}
                  cDistance={2}
                  cameraZoom={8.5}
                  lightType="3d"
                  brightness={1.3}
                  envPreset="city"
                  grain="on"
                  toggleAxis={false}
                  zoomOut={false}
                  hoverState=""
                  enableTransition={false}
                />
              </ShaderGradientCanvas>
            </Suspense>
          )}

          <span className="relative z-[1] mx-auto inline-block w-fit rounded-lg bg-white/5 p-1 px-2 text-xl backdrop-blur-lg">
            Introducing Tools🔥
          </span>
          <h1 className="relative z-[1] text-center font-semibold text-3xl sm:text-4xl sm:leading-[100%] md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-5xl ">
            <span className="block">
              Open Source <span className="font-bold "> UI-TOOLS </span>
            </span>
            <span className="block"> for Designer/Developer.</span>
          </h1>
          <p className="relative z-[1] mx-auto text-center text-sm sm:w-[80%] sm:text-base lg:w-[38rem] 2xl:w-[42rem] 2xl:text-lg">
            A creative toolbox featuring shadow, SVG, gradient, and background
            pattern generators, color. Open-source, fast, and made for builders.
          </p>
          <div className="relative z-[2] flex flex-wrap items-center justify-center gap-2">
            <GitHubButton />
            <a
              href="/svg-line-draw"
              className="flex h-11 items-center gap-1 rounded-full bg-background px-3 font-semibold text-foreground"
            >
              Get Started
              <ChevronsRight />
            </a>
            <SendIdea />
          </div>
        </div>
        <div className="flex justify-center items-center">
          <CarbonAd />
        </div>

        <div className="relative z-20 mx-auto flex max-w-screen-xl flex-wrap justify-center gap-2 p-4 pt-10 sm:gap-6 sm:p-6 sm:pt-16 md:pt-40">
          {uiTools.map((tool) => (
            <a
              key={tool.id}
              href={tool.path}
              target="_blank"
              className="group relative w-[calc(50%-1rem)] cursor-pointer overflow-hidden rounded-2xl bg-neutral-100/10 p-2 text-primary shadow-[0px_1px_0px_0px_rgba(17,17,26,0.1)] backdrop-blur-lg transition sm:w-[calc(30%-1rem)] sm:p-3 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:bg-neutral-950/50 dark:shadow-none"
              rel="noreferrer"
            >
              {tool?.new && (
                <span className="absolute top-2 right-2 z-10 rounded-full bg-blue-500 px-3 py-0.5 text-white text-xs">
                  New
                </span>
              )}
              <Image
                src={tool.img}
                alt={tool.title}
                className="aspect-video w-full rounded-xl object-cover transition-opacity duration-300 group-hover:opacity-20"
              />
              <div className="absolute bottom-0 z-[1] p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <h3 className="mb-2 font-semibold text-xl">{tool.title}</h3>
              </div>
            </a>
          ))}
        </div>
        <footer className="container relative z-10 mx-auto flex justify-center rounded-md p-2">
          <p className="text-balance text-center font-semibold text-sm text-white md:text-left lg:text-muted-foreground">
            Built by{" "}
            <a
              href="https://x.com/naymur_dev"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              naymur
            </a>{" "}
            . The source code is available on{" "}
            <a
              href="https://github.com/ui-layouts/uilayouts"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </footer>
      </div>
    </>
  );
}

export default HomeIndex;
