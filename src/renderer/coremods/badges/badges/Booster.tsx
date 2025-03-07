import { React } from "@common";

export default React.memo((props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12 0L4 8V16L12 24L20 16V8L12 0ZM18 15.18L12 21.18L6 15.18V8.82L12 2.82L18 8.82V15.18Z"
    />
    <path
      fill="currentColor"
      d="M8 9.66016V14.3402L12 18.3402L16 14.3402V9.66016L12 5.66016L8 9.66016Z"
    />
  </svg>
));
