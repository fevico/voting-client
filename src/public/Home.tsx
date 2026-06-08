import Contestant from "@/components/Contestant";
import { useOutletContext } from "react-router-dom";

const Home = () => {
  // 1. Grab the activeTab information from the Layout's Outlet
  const { activeTab } = useOutletContext<{ activeTab: string }>();

  return (
    <div>
      {/* 2. If activeTab is "vote", show the voting landing page content */}
      {activeTab === "vote" && (
        // <div className="space-y-4">
        //   <h2 className="text-2xl font-bold text-center">Vote for Excellence</h2>
        //   <p className="text-center text-zinc-500">Choose your voting method below.</p>
        //   {/* Your cards (Quick Vote, QR Code, etc.) will go here! */}
        // </div>
        <Contestant/>
      )}

      {/* 3. If activeTab is "results", show the results content instead */}
      {activeTab === "results" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Live Election Results</h2>
          <p className="text-center text-zinc-500">See who is winning in real-time.</p>
          {/* Your results charts or lists will go here! */}
        </div>
      )}
    </div>
  );
};

export default Home;