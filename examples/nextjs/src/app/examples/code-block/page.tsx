import dynamic from "next/dynamic";

const Page = () => {
  const Example = dynamic(() => import("./example"), { ssr: false });
  return <Example />;
};

export default Page;
