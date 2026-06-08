import { useState } from "react";
import Header from "./Header"
import { Outlet } from "react-router-dom";

const Layout = () => {
    const [activeTab, setActiveTab] = useState("vote");
  return (
    <div className="min-h-screen bg-zinc-50">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="w-full">
        <Outlet context={{ activeTab }} />
      </main>

    </div>
  )
}

export default Layout