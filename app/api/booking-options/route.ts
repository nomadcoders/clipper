import { getBookingOptions } from "@/lib/clipper/data";

export async function GET() {
  try {
    return Response.json(await getBookingOptions());
  } catch (error) {
    console.error("Failed to load booking options", error);

    return Response.json(
      { ok: false, error: "We could not load booking options." },
      { status: 500 },
    );
  }
}
