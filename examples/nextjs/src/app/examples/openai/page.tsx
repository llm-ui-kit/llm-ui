import dynamic from "next/dynamic";

const Page = () => {
  // Code which uses Shiki for code highlighting must be imported dynamically
  const Example = dynamic(() => import("./example"), { ssr: false });
  return <Example />;
};

export default Page;
