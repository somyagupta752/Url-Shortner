import prisma from "@/lib/prisma";

//redirect to url
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  try {
    const link = await prisma.url.findUnique({
      where: {
        code: code,
      },
    });
    if (link) {
      //update clicks and last clicked
      await prisma.url.update({
        where: {
          code: code,
        },
        data: {
          clicks: link.clicks + 1,
          lastClicked: new Date(),
        },
      });
      return Response.redirect(link.url, 302);
    } else {
      return Response.json({ error: "Code not found" }, { status: 404 });
    }
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Code not found" }, { status: 404 });
  }

}