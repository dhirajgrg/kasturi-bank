const catchAsync = function (fn) {
  return function (req, res, next) {
    return fn(req,res,next).catch(next)
  };
};

module.exports = catchAsync;

