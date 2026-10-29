// headless Chrome draws WebGL with SwiftShader; the site then (rightly) skips its GPU-only effects.
// To look at those effects anyway, report a hardware renderer. Use: await ctx.addInitScript(require('./fakegpu'))
module.exports = () => {
  const gp = WebGLRenderingContext.prototype.getParameter;
  WebGLRenderingContext.prototype.getParameter = function (p) {
    if (p === 0x9246) return 'Test GPU (hardware)';
    return gp.call(this, p);
  };
};
