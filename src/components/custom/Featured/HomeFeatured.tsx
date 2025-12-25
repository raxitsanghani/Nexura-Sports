import Images from "@/assets";
import Bg from "@/assets/BG.png";
import { useEffect, useRef } from "react"
import "./index.css";

const HomeFeatured = () => {
  const modelRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const model = modelRef.current as any
    if (!model) return

    model.autoRotate = false

    const startAfterDelay = setTimeout(() => {
      model.autoRotate = true
    }, 1000)

    const stopRotate = () => (model.autoRotate = false)
    const startRotate = () => (model.autoRotate = true)

    model.addEventListener("mouseenter", stopRotate)
    model.addEventListener("mouseleave", startRotate)

    return () => {
      clearTimeout(startAfterDelay)
      model.removeEventListener("mouseenter", stopRotate)
      model.removeEventListener("mouseleave", startRotate)
    }
  }, [])

  return (
    <section className="bg-white py-8  antialiased  md:py-16 ">
      <div className="mx-auto grid max-w-screen-xl  px-4 pb-8 md:grid-cols-12 lg:gap-12 lg:pb-16 xl:gap-0 ">
        <div className="content-center justify-self-start md:col-span-7  md:ml-5   md:text-start">
          <h1 className="mb-4 text-4xl font-bold leading-none tracking-tight font-sans  md:max-w-2xl md:text-6xl xl:text-8xl">
            Best In Style
            <br />
            Collection <br />
            For You
          </h1>
          <hr className="bg-cs_green  h-[3px] mx-auto my-4  rounded  " />
          <p className="mb-4 max-w-2xl text-gray-500  md:mb-12 md:text-lg  lg:mb-5 lg:text-xl">
            We craft the, we wont say the best,
            <br />
            But through 70 years of experience in the industry
          </p>
          <a
            href="#product_list"
            className="inline-block rounded-lg bg-gray-900 px-6 py-3.5 text-center font-medium text-white hover:bg-black focus:outline-none focus:ring-4 focus:ring-zink-800 -600  "
          >
            Shop Now!
          </a>
        </div>
        <div className="md:col-span-5 md:mt-0 md:flex relative justify-center items-center z-10">
          <div className="relative w-full flex items-center justify-center group ">

            {/* Background Image */}
            {/* <img
              src={Images.bg}
              className="absolute inset-0 w-full h-full object-contain scale-110 transition-transform duration-700 group-hover:scale-110"
              alt="Background"
            />

            {/* Shoe Image */}
            {/* <img
              src={Images.shoe}
              className="relative z-10 w-[73%] object-cover translate-x-[-3%] translate-y-[-4%] scale-125 
             drop-shadow-[0_40px_60px_rgba(0,0,0,0.35)]
             transition-transform duration-500 ease-in-out
             group-hover:scale-150 group-hover:-rotate-6"
              alt="Shoe"
            /> */}
            <model-viewer
              ref={modelRef}
              src="/src/assets/nike/source/model.glb"
              auto-rotate
              camera-controls
              disable-zoom
              disable-pan
              shadow-intensity="1"
              shadow-softness="1"
              exposure="1"
              scale="1.6 1.6 1.6"
              class="w-full h-[600px] md:h-[700px] rotate-slow"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default HomeFeatured;
