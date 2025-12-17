import Images from "@/assets";
const HomeFeatured = () => {
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
        <div className="hidden md:col-span-5  md:mt-0 md:flex ">
          <img
            className="relative xl:max-w-[43rem] xl:h-[43rem] lg:max-w-[30rem] lg:h-[30rem]  top-5 lg:right-14  md:right-0 pr-5"
            src={Images.logo_home}
            alt="shopping illustration"
          />
        </div>
      </div>
    </section>
  );
};

export default HomeFeatured;
