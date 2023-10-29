type Props = {
  content: string | JSX.Element;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

const Button = ({ content, onClick, disabled, loading }: Props) => {
  return (
    <button
      disabled={disabled ?? loading ?? false}
      onClick={onClick}
      className="group  relative inline-flex  items-center justify-center overflow-hidden rounded-full  bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-0.5 text-sm font-medium text-slate-100 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-800"
    >
      <span className="relative rounded-full bg-gray-800 px-4 py-2 transition-all duration-75 ease-in group-hover:bg-opacity-0 ">
        {loading ? "Loading..." : content}
      </span>
    </button>
  );
};

export default Button;
