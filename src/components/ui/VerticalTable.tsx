import React, { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Container for the entire vertical table
const VerticalTableContainer = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col", className)} {...props} />
));
VerticalTableContainer.displayName = "VerticalTableContainer";

// Each row in the vertical table
const VerticalTableRow = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between border-b py-2", className)}
    {...props}
  />
));
VerticalTableRow.displayName = "VerticalTableRow";

// Cell for label and value
const VerticalTableCell = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1", className)} {...props} />
));
VerticalTableCell.displayName = "VerticalTableCell";

// Main VerticalTable component
interface VerticalTableProps {
  product: {
    description: Record<string, string>;
  };
}

const VerticalTable: React.FC<VerticalTableProps> = ({ product }) => {
  // Ensure description is defined and an object
  const description = product.description || {};

  return (
    <VerticalTableContainer>
      {Object.entries(description).length === 0 ? (
        <VerticalTableRow>
          <VerticalTableCell className="text-sm">
            No description available
          </VerticalTableCell>
        </VerticalTableRow>
      ) : (
        Object.entries(description).map(([key, value]) => (
          <VerticalTableRow key={key}>
            <VerticalTableCell className="font-semibold text-sm">
              {key}
            </VerticalTableCell>
            <VerticalTableCell className="text-sm">{value}</VerticalTableCell>
          </VerticalTableRow>
        ))
      )}
    </VerticalTableContainer>
  );
};

export default VerticalTable;
