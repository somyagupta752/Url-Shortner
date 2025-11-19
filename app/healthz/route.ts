export const GET = async (request: Request) => {
  return Response.json({ "ok": true, "version": "1.0" });
}