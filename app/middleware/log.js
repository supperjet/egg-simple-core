module.exports = config => async(ctx, next) => {
    console.log(config.formate(ctx.url));
    next()
}