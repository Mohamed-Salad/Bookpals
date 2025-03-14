import "./GridSize48.css";

export const GridSize48 = ({ size = "48", className, ...props }) => {
  const variantsClassName = "size-" + size;

  return (
    <img
      className={"grid-size-48 " + className + " " + variantsClassName}
      src="grid-size-48.svg"
    />
  );
};
