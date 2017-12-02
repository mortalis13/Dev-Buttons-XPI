
function addToolbarButton(w,props,command,firstRun){
  var $=w.$,alert=w.alert
  $.init(w.document)
  
  var button=$("<toolbarbutton>")
  button.attr("id",props.id)
  button.attr("class",props.className)
  button.attr("label",props.label)
  button.attr("tooltiptext",props.label)
  
  button.attr("removable","true")
  button.attr("type","menu-button")
  
  button.bind("mousemove",mouseMove)          //not mouseenter to check the mouse coordinates (without it the popup would open earlier) 
  button.bind("mouseleave",buttonLeave)
  button.bind("command",toggleToolbox)

  var menuPopup=$("<menupopup>")
  menuPopup.attr("id","dev-tools-popup")
  menuPopup.bind("mouseleave",menuLeave)
  menuPopup.bind("popuphidden",onHidePopup)
  
  var menuItem=$("<menuitem>")
  menuItem.attr("id","inspector-item")
  menuItem.attr("class", "menuitem-iconic")
  menuItem.attr("label","Inspector")
  menuItem.bind("command",openInspector)
  menuPopup.append(menuItem)
  
  menuItem=$("<menuitem>")
  menuItem.attr("id","console-item")
  menuItem.attr("class", "menuitem-iconic")
  menuItem.attr("label","Console")
  menuItem.bind("command",openConsole)
  menuPopup.append(menuItem)
  
  menuItem=$("<menuitem>")
  menuItem.attr("id","debugger-item")
  menuItem.attr("class", "menuitem-iconic")
  menuItem.attr("label","Debugger")
  menuItem.bind("command",openDebugger)
  menuPopup.append(menuItem)
  
  button.append(menuPopup)
  
/* --------------------------------------------------------------- */ 
  
  var toolbox=$("navigator-toolbox")          //add to customization palette
  if(toolbox) toolbox.palette.append(button)
                                    //without next instructions you'll have to see the button there
  var toolbar=$("nav-bar")  
  if(toolbar){
    var currentset=pref(prefs.savedCurrentSet)
    if(currentset===null){
      firstRun=true
      currentset=toolbar.attr("currentset")
    }
    currentset=currentset.split(",")            //toolbar buttons order
    
    var buttonPos=currentset.indexOf(props.id)                    //find this button id in the current order
    var before
    
    // set button position
    if(firstRun){                     //first run of extension  
      pref(prefs.addBranch,true)
      before=null                   //add the button as the first button
    }else{
      pref(prefs.addBranch,false)
      if(buttonPos==-1) return button                 //if the button isn't in the toolbar (it has to be in the palette) don't change anything
      if(buttonPos!=currentset.length-1){
        i=buttonPos+1
        while(i<=currentset.length && currentset[i]){
          before=$(currentset[i++])
          if(before) break
        }
      }
    }
    toolbar.insertItem(props.id, before)                    //insert (id) before (element)
  }
  
  return button                           //get the button to add other attributes
  
  
  var closedManually=false,       //used to disable mousemove opening if the popup is closed by mouse click
  closedAutomatically=false
  
  function mouseMove(e){
    var stdButtonWidth=34
    var size=e.target.boxObject
    
    var top=size.y+5                    // calculate box region within which popup will open
    var bottom=top+size.height-15
    var left=size.x+stdButtonWidth
    var right=size.x+size.width
    
    if(menuPopup.state=="closed")
      if(!closedManually)                 // if closed by moving mouse out
        if(e.clientY>top && e.clientY<bottom)     // check mouse position
          if(e.clientX>left)
            menuPopup.openPopup(button,"after_start",0,-5,false,false)
      
    if(menuPopup.state=="open")
      if(e.target==e.currentTarget && e.clientX<left)     //if mouse if over the button (not the popup arrow)
        menuPopup.hidePopup()               //close   
  }
  
  function buttonLeave(e){
    closedManually=false
    if(menuPopup.state=="open")
      if(e.explicitOriginalTarget.id!="dev-tools-popup"){   //if from the arrow you go to the elements other than the popup menu
        closedAutomatically=true              //set to prevent the onHidePopup default actions
        menuPopup.hidePopup()
      }
  }
  
  function menuLeave(e){
    if(menuPopup.state=="open"){              //if mouse was over the menu and then leaved
      var popupTop=e.target.boxObject.y
      if(e.clientY>popupTop)                //if mouse leaved the menu to the left/right/down 
        menuPopup.hidePopup()
    }
  } 
  
  function onHidePopup(e){
    if(!closedAutomatically)
      closedManually=true               //popup closed by mouse click
    else closedAutomatically=false            //reset the flag
  }
  
  function toggleToolbox(e){
    w.gDevToolsBrowser.toggleToolboxCommand(w.gBrowser)
  }
  
  function openInspector(e){
    w.gDevToolsBrowser.selectToolCommand(w.gBrowser, 'inspector')
    e.stopPropagation()
  }
  
  function openConsole(e){
    w.gDevToolsBrowser.selectToolCommand(w.gBrowser, 'webconsole')
    e.stopPropagation()
  }

  function openDebugger(e){
    w.gDevToolsBrowser.selectToolCommand(w.gBrowser, 'jsdebugger')
    e.stopPropagation()
  } 
}

function removeToolbarButton(window){
  var toolbar=window.document.getElementById("nav-bar")
  for(var i=1;i<arguments.length;i++){
    var id=arguments[i].id
    toolbar.currentSet=toolbar.currentSet.replace(","+id,"").replace(id+",","")   //find the button id in the list and remove (if the button is there)
  }
}
