
/* ******************************************* ui build *********************************************** */

function loadIntoWindow(window){
  try{
    setShortFunctions(window)                     //jQuery-like syntax
    var firstRun=false
    if(pref(prefs.firstRun)){
      firstRun=true
      pref(prefs.firstRun,false)
    }
    addToolbarButton(window,buttonProps,false,firstRun) 
  }
  catch(e){}
}

function unloadFromWindow(window){
  if (!window) return
  removeToolbarButton(window,buttonProps)
  clearUserPrefs()
}

/* ***************************************** load functions ******************************************** */

function eachWindow(callback){
  let enumerator=Services.wm.getEnumerator("navigator:browser")
  while (enumerator.hasMoreElements()){
    let window=enumerator.getNext()
    if (window.document.readyState==="complete") callback(window)
    else runOnLoad(window, callback)
  }
}

function windowWatcher (subject, topic){
  if (topic==="domwindowopened")
    runOnLoad(subject, loadIntoWindow)
}

function runOnLoad (window, callback){
  window.addEventListener("load", function(){
    window.removeEventListener("load", arguments.callee, false)
    callback(window)
  }, false)
}
