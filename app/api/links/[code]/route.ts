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

