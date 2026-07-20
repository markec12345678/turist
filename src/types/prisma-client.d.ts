declare module "@prisma/client" {
  export class PrismaClient {
    constructor(args?: any)
    $connect(): Promise<void>
    $disconnect(): Promise<void>
    [key: string]: any
  }
  export namespace Prisma {
    type InputJsonValue = any
  }
}
declare module "@prisma/adapter-pg" {
  export class PrismaPg {
    constructor(args: { connectionString: string })
  }
}
