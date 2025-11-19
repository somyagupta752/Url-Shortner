import prisma from "@/lib/prisma";

function CreateCode() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const length = Math.floor(Math.random() * 3) + 6; // Generate length between 6 and 8
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

export async function POST(request: Request) {
  //handle shorten url request
  try {
    let { url, code } = await request.json();
    console.log(url);
    //check url is valid or not
    const urlPattern =
      /^(https?:\/\/)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}([\/?#][^\s]*)?$/;

    if (!urlPattern.test(url)) {
      return Response.json({ error: "Invalid URL" }, { status: 400 });
    }
    //[A-Za-z0-9]{6,8}.
    if (code) {
      const isCodeValid = /^[A-Za-z0-9]{6,8}$/.test(code);
      if (!isCodeValid) {
        return Response.json(
          {
            error:
              "Invalid code. Code must be alphanumeric and 6-8 characters long.",
          },
          { status: 400 }
        );
      }
      const exist = await prisma.url.findUnique({
        where: {
          code: code,
        },
      });
      if (exist) {
        return Response.json({ error: "Code already exists" }, { status: 409 });
      }
    }
    if (!code) {
      code = CreateCode();
    }
    await prisma.url.create({
      data: {
        url: url,
        code: code,
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate a delay of 2 seconds
    return Response.json({ code });
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const GET = async (request: Request) => {
  const data = await prisma.url.findMany({orderBy: { createdAt : "desc" }});
  return Response.json({ data });
}
