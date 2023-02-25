'use strict';

module.exports = {
  async fetchCredentials(ctx) {
    ctx.body = await strapi.db.query('api::melhor-envio.melhor-envio').findMany({
      populate: { category: true }
    });
  },
  async updateCredentials(ctx) {
    const regex = /(\?|\&)([^=]+)\=([^&]+)/g;
    const params = [...ctx.request.url.matchAll(regex)];

    let data = {}

    for (let i = 0; i < params.length; i++) {
      data[params[i][2]] = params[i][3]
    }

    await strapi.db.query('api::melhor-envio.melhor-envio').update({
      where: { id: 1 },
      data
    })
    return ctx.send({status: 200});
  }
};
