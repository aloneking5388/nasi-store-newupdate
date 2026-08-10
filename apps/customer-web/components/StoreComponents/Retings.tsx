import React from "react";
import { AiFillStar } from "react-icons/ai";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { CiStar } from "react-icons/ci";

interface RatingProps {
  type?: "display" | "selector" | "precise";
  rating?: number;
  onClick?: (value: number) => void;
  size?: "small" | "medium" | "large"; // ✅ updated
  color?: string;
}

const Rating = ({
  type = "display",
  rating = 0,
  onClick,
  size = "medium", // ✅ updated default
  color = "text-[#EDBB0E]",
}: RatingProps) => {
  const stars = [];

  // ✅ Map size prop to Tailwind text size class
  const sizeClass = {
    small: "text-sm",
    medium: "text-xl",
    large: "text-2xl",
  }[size];

  for (let i = 1; i <= 5; i++) {
    if (type === "precise") {
      if (rating >= i) {
        stars.push(<FaStar key={i} className={`${color} ${sizeClass}`} />);
      } else if (rating >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} className={`${color} ${sizeClass}`} />);
      } else {
        stars.push(<CiStar key={i} className={`text-slate-600 ${sizeClass}`} />);
      }
    } else {
      const filled = i <= rating;
      const Icon = filled ? AiFillStar : CiStar;

      stars.push(
        <span
          key={i}
          onClick={type === "selector" ? () => onClick?.(i) : undefined}
          className={`cursor-pointer ${filled ? color : "text-slate-600"} ${sizeClass}`}
        >
          <Icon />
        </span>
      );
    }
  }

  return <div className="flex gap-1 items-center">{stars}</div>;
};

export default Rating;
