import prisma from "@/lib/prisma"

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) => {
  try{
    const {code} = await params
    let check = await prisma.url.findUnique({where: {code: code}})
    if(!check){
        return Response.json({ error: "Code not found" }, { status: 404 })
    }
    return Response.json(check)
  }catch{
    return Response.json({ error: "Code not found" }, { status: 404 })
  }
}

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) => {
  try {
    const { code } = await params;
    const existing = await prisma.url.findUnique({ where: { code } });
    if (!existing) {
      return Response.json({ error: "Code not found" }, { status: 404 });
    }

    await prisma.url.delete({ where: { code } });
    return Response.json({ success: true, code });
  } catch (err) {
    console.error("DELETE /api/links/:code error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

