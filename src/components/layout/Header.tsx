import { Trophy, CheckSquare, BarChart3, TrendingUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900">
              VoteHub 2024
            </h1>
            <p className="text-xs font-medium text-zinc-500">
              Choose Your Champion
            </p>
          </div>
        </div>

        {/* Right Side: Navigation Tabs & Total Stats */}
        <div className="flex items-center gap-4">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-100/80 p-1 rounded-xl h-11">
              <TabsTrigger 
                value="vote" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm transition-all"
              >
                <CheckSquare className="h-4 w-4" />
                Vote
              </TabsTrigger>
              <TabsTrigger 
                value="results" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm transition-all"
              >
                <BarChart3 className="h-4 w-4" />
                Results
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Total Votes Badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-zinc-50 px-3 py-2 rounded-xl border border-zinc-100 h-11">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-zinc-700">17,305</span>
            <span className="text-xs text-zinc-400 font-medium">Total Votes</span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;