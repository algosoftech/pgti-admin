import React from "react";
import { Skeleton } from "antd";

const SkeltonEffect = ({ row = 1, col = 1 }) => {
  return (
    <>
      {Array(row)
        .fill()
        .map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array(col)
              .fill()
              .map((_, colIndex) => (
                <td key={colIndex}>
                  <Skeleton loading={true} active paragraph={{ rows: 0 }} />
                </td>
              ))}
          </tr>
        ))}
    </>
  );
};

export default SkeltonEffect;
