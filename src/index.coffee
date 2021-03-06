asap = require 'asap'

PENDING = 'PENDING'
FULFILLED = 'FULFILLED'
REJECTED = 'REJECTED'

class Promise
  constructor: (executor) ->
    @state = PENDING
    @called = false
    @queue = []
    @doResolve executor

  wrapCb: (cb) ->
    (value) =>
      return if @called
      @called = true
      cb(value)

  doResolve: (executor) ->
    try
      executor (@wrapCb @fulfill), (@wrapCb @reject)
    catch error
      @reject error

  fulfill: (value) =>
    return @reject new TypeError if value is @
    if value and (typeof value is 'object' or typeof value is 'function')
      try
        thenFn = value.then
      catch error
        return @reject error

      isPromise = thenFn is @then and @ instanceof Promise
      
      if isPromise
        @state = FULFILLED
        @value = value
        return @finale()

      isThenable = typeof thenFn is 'function'

      if isThenable
        return @doResolve thenFn.bind value

    @state = FULFILLED
    @value = value
    @finale()

  reject: (reason) =>
    @state = REJECTED
    @value = reason
    @finale()

  finale: ->
    @handle callbacks for callbacks in @queue

  handleResolved: ({ promise, onFulfilled, onRejected }) ->
    asap =>
      cb = (if @state is FULFILLED then onFulfilled else onRejected)

      if typeof cb isnt 'function'
        if @state == FULFILLED
          promise.fulfill @value
        else
          promise.reject @value
        return

      try
        value = cb @value
        promise.fulfill value
      catch error
        promise.reject error

  handle: (data) ->
    promise = @

    while promise.state isnt REJECTED and promise.value instanceof Promise
      promise = promise.value

    if promise.state is PENDING
      promise.queue.push data
    else
      promise.handleResolved data

  then: (onFulfilled, onRejected) ->
    promise = new Promise ->

    @handle { promise, onFulfilled, onRejected }

    promise

module.exports = Promise
