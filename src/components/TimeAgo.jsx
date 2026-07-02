import React from "react";
import { formatDistanceToNow } from "date-fns";

const TimeAgo = ({ date, className = "" }) => {
  return (
    <span className={className}>
      {formatDistanceToNow(new Date(date), { addSuffix: true })}
    </span>
  );
};

export default TimeAgo;
