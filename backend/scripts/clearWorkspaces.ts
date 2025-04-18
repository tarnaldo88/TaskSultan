import { PrismaClient } from '../src/prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Delete all WorkspaceMember records first to avoid foreign key constraint errors
  await prisma.workspaceMember.deleteMany({})
  // Delete all Workspace records
  await prisma.workspace.deleteMany({})
  console.log('All workspaces and workspace members deleted.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
