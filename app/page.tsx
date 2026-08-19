import { PrismaticFlowHome } from "@/components/clipper/home-variants";
import { getBookingOptions } from "@/lib/clipper/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const options = await getBookingOptions();

  return <PrismaticFlowHome options={options} />;
}
