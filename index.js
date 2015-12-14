var createStore = function(actions) {
  var store = {
    state: null,
    previousState: null,
    processor: createProcessor(actions),
    listeners: [],
    dispatch: function(action, params) {
      console.log('Action: ' + (action ? (action.prototype.name+(action.prototype.simple ? '' : '(Complex)' )) : 'Store Initialization'))

      if (action === null) {
        this.previousState = this.state
        this.state = this.processor.process(null, action, params)
        this.listeners.forEach((listener) => listener())
        this.previousState = null
      }
      else if (action.prototype.simple===true) {
        this.previousState = this.state
        this.state = this.processor.process(this.state, action, params)
        this.listeners.forEach((listener) => listener(this.state, this.previousState))
        this.previousState = null
      } else if (action.prototype.simple===false) {
        action()(this, params)
      }
    },
    subscribe: function(listener) {
      this.listeners.push(listener)
      return () => { this.listeners = this.listeners.filter((l) => l!==listener) }
    }
  }
  
  store.dispatch(null)

  return store
}

var createProcessor = function(obj, paths=[]) {
  if (obj.type=='actionGroup') { // if obj is actionGroup, create a processor out of it
    Object.keys(obj).forEach(function(actionName) {
      var action = obj[actionName]

      action.prototype.name = (paths.length==0 ? actionName : paths.join('.')+'.'+actionName)
      
      action.prototype.simple = (typeof action({}, {}) === 'function') ? false : true
    })
    
    return {
      process: function(state, action, params) {
        if (state === null) {
          return this.actionGroup.default()
        } else {
          for (var i=0; i<Object.keys(this.actionGroup).length; i++) {
            var k = Object.keys(this.actionGroup)[i]
  
            if (this.actionGroup[k]===action) {
              return this.actionGroup[k](state, params)
            }
          }
                  
          return state
        }
      },
      actionGroup: obj
    }
  } else { // if obj is a normal object, combine processors in it
    var subProcessors = {}
    
    Object.keys(obj).forEach((k) => {
      subProcessors[k] = createProcessor(obj[k], [...paths, k])
    })
    
    return {
      process: function(state, action, params) {
        if (state === null) {
          var newState = {}

          Object.keys(this.subProcessors).forEach((k) => {
            newState[k] = this.subProcessors[k].process(null)
          })
          
          return newState
        } else {
          var newState = {}
          
          Object.keys(this.subProcessors).forEach((k) => {
            newState[k] = this.subProcessors[k].process(state[k], action, params)
          })
          
          return newState
        }
      },
      subProcessors: subProcessors
    }
  }
}

var createActionGroup = function(obj) {
  var propertiesObject = {}

  Object.keys(obj).forEach(function(actionName) {
    var action = obj[actionName]

    propertiesObject[actionName] = {enumerable: true, value: action}
  })
  
  propertiesObject.type = {enumerable: false, value: 'actionGroup'}
  
  return Object.create({}, propertiesObject)
}

module.exports.createStore = createStore;
module.exports.createProcessor = createProcessor;
module.exports.createActionGroup = createActionGroup;
