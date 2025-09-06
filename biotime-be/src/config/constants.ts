import { FastifyReply } from "fastify";

export function ans(
  reply: FastifyReply,
  data?: any,
  message?: string | string[],
  status = 200,
  success = true
) {
  return reply.status(status).send({
    success,
    message,
    data,
    statusCode: status
  });
}


export const parseDate = (dateString: string): Date => {
    const parts = dateString.split("/");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; 
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
};
