import { getBookingOptions } from "@/lib/clipper/data";

export async function GET() {
  try {
    return Response.json(await getBookingOptions());
  } catch (error) {
    console.error(
      JSON.stringify({
        message: "failed to load booking options",
        error: error instanceof Error ? error.message : String(error),
      }),
    );

    return Response.json(
      { ok: false, error: "We could not load booking options." },
      { status: 500 },
    );
  }
}
