export async function healthController(_request, reply) {
    return reply.code(200).send({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
}
