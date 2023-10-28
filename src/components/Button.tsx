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
      className="group relative mb-2 mr-2 inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 p-0.5 text-sm font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-cyan-200 disabled:opacity-50 group-hover:from-cyan-500 group-hover:to-blue-500 dark:text-white dark:focus:ring-cyan-800"
    >
      <span className="relative rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900">
        {loading ? "Loading..." : content}
      </span>
    </button>
  );
};

export default Button;
