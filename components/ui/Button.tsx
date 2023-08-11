import React, { forwardRef } from "react";

type Button = React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = forwardRef<HTMLButtonElement, Button>(
  ({ children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={`bg-primary text-white shadow-sm py-2 px-7 rounded-md hover:bg-primary-dark ${props.className}`}
      >
        {children}
      </button>
    );
  }
);

export default Button;
