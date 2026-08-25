(function(){"use strict";
const showToast=vendetta.ui.toasts.showToast;
const logger=vendetta.logger;
let originalSend=null;
let patchedSend=null;
function patchIdentify(data){
  if(typeof data!=="string") return data;
  try{
    const payload=JSON.parse(data);
    if(payload?.op===2&&payload?.d?.properties){
      payload.d.properties={...payload.d.properties,browser:"Discord Client"};
      return JSON.stringify(payload);
    }
  }catch(e){}
  return data;
}
const plugin={
  onLoad(){
    try{
      const WS=globalThis.WebSocket;
      if(!WS?.prototype?.send) throw new Error("WebSocket.send unavailable");
      if(originalSend) return;
      originalSend=WS.prototype.send;
      patchedSend=function(data){return originalSend.call(this,patchIdentify(data));};
      WS.prototype.send=patchedSend;
      showToast("DesktopSpoofer enabled — restart Discord to apply");
      logger?.log?.("[DesktopSpoofer] Waiting for Gateway IDENTIFY");
    }catch(e){
      logger?.error?.("[DesktopSpoofer] Failed to patch WebSocket.send",e);
      showToast("DesktopSpoofer failed to load");
      throw e;
    }
  },
  onUnload(){
    try{
      const WS=globalThis.WebSocket;
      if(originalSend&&WS?.prototype?.send===patchedSend) WS.prototype.send=originalSend;
    }finally{
      originalSend=null;
      patchedSend=null;
    }
  }
};
return {default:plugin,__esModule:true};
})()
