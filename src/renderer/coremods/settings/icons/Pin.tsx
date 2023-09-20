import { MouseEventHandler } from "react";

export default (props: { onClick?: MouseEventHandler }): React.ReactElement => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    onClick={props.onClick}>
    <path fill="currentColor" d="M19 3H5V5H7V12H5V14H11V22H13V14H19V12H17V5H19V3Z" />
  </svg>
);
