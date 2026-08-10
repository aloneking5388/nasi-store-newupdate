"use client";

import { CiStar } from "react-icons/ci";
import { AiFillStar } from "react-icons/ai";

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
};

const StarRating = ({ value, onChange, readonly = false }: StarRatingProps) => {
  return (
    <div className="flex gap-1 cursor-pointer">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value >= star;
        return (
          <span
            key={star}
            onClick={() => !readonly && onChange?.(star)}
            className={`text-4xl ${
              filled ? "text-[#EDBB0E]" : "text-slate-600"
            }`}
          >
            {filled ? <AiFillStar /> : <CiStar />}
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
