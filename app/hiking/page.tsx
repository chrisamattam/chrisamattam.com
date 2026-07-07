import Nav from "@/components/Nav";
import { getHikePins } from "@/lib/hikes";
import HikingExplorer from "./_components/HikingExplorer";

export const metadata = {
  title: "Hiking — Chris Mattam",
  description: "An interactive globe of every hike and trek I've done, across the Himalaya and the Sahyadri.",
};

export default function HikingPage() {
  const pins = getHikePins();
  return (
    <>
      <Nav />
      <HikingExplorer pins={pins} />
    </>
  );
}
