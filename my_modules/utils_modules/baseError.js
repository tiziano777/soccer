
class baseError extends Error {
    constructor ( description,id,num) {
    super(description)
   
    Object.setPrototypeOf(this, new.target.prototype)
    this.id = id
    this.num = num
    Error.captureStackTrace(this)
    }
   }

module.exports = baseError
