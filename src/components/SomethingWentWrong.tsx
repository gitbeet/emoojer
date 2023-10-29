import { useRouter } from "next/router";
import Button from "./Button";

const SomethingWentWrong = () => {
  const { reload, back } = useRouter();
  return (
    <div className="absolute inset-0 z-[-1] flex flex-col items-center justify-center  gap-8 ">
      <div className="flex flex-col items-center gap-4">
        <h1 className=" text-4xl font-bold">Oops..!</h1>

        <h1 className="text-xl text-slate-300 ">
          Something went wrong.Please try again
        </h1>
      </div>

      <div className="flex gap-4">
        {" "}
        <Button content="Retry" onClick={reload} />
        <Button content="Go back" onClick={back} />
      </div>
    </div>
  );
};

export default SomethingWentWrong;
