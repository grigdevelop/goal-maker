import { Content } from "./content";
import prisma from "@/lib/prisma";

export default async function Home() {
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  console.log("Deleted all users");
  return (
    <Content />
  );
}
