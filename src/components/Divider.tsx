import { Trophy } from "lucide-react";
import type { FC } from "react";

export type Lead = {
  name: string;
  votes: number;
};
interface Props{
  leadingPoint: Lead;
}

const Divider: FC<Props> = ({ leadingPoint }) => {
  return (
    <div className="w-full bg-[#F9EBC8] mt-6">
      <div className="flex gap-4 justify-center py-6">
        <Trophy className="h-5 w-5 text-[#F59E0B]" />
        <span className="text-semibold">Currently Leading:</span>{" "}
        <p className="text-bold">{leadingPoint.name}</p>
        <p className="text-sm text-gray-500">with {leadingPoint.votes} votes</p>
      </div>
    </div>
  );
};

export default Divider;
