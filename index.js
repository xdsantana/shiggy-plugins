(function(){"use strict";
const findByProps=vendetta.metro.findByProps;
const showToast=vendetta.ui.toasts.showToast;
const logger=vendetta.logger;
const socketModule=findByProps("getSocket","isConnected");
const IDENTIFY=2;
const patchedSockets=new WeakMap();
const patchedTransports=new WeakMap();
let watcher=null;
let reconnectDone=false;

function applyDesktop(data){
  if(data&&data.properties){
    data.properties={...data.properties,browser:"Discord Client"};
  }
}

function patchTransport(socket){
  const ws=socket?.webSocket;
  if(!ws||typeof ws.send!=="function"||patchedTransports.has(ws)) return;
  const original=ws.send.bind(ws);
  patchedTransports.set(ws,original);
  ws.send=function(data){
    try{
      if(typeof data==="string"){
        const payload=JSON.parse(data);
        if(payload?.op===IDENTIFY&&payload?.d?.properties){
          applyDesktop(payload.d);
          data=JSON.stringify(payload);
          logger?.log?.("[DesktopSpoofer] Patched raw Gateway IDENTIFY");
        }
      }
    }catch(e){}
    return original(data);
  };
}

function patchSocket(socket){
  if(!socket) return false;
  patchTransport(socket);
  if(patchedSockets.has(socket)) return true;
  if(typeof socket.send!=="function") return false;

  const originalSend=socket.send.bind(socket);
  const originalHandleIdentify=typeof socket.handleIdentify==="function"
    ? socket.handleIdentify.bind(socket)
    : null;

  socket.send=function(op,data,flag){
    if(op===IDENTIFY&&data){
      applyDesktop(data);
      logger?.log?.("[DesktopSpoofer] Patched Gateway IDENTIFY");
    }
    return originalSend(op,data,flag);
  };

  if(originalHandleIdentify){
    socket.handleIdentify=function(...args){
      const result=originalHandleIdentify(...args);
      patchTransport(socket);
      return result;
    };
  }

  patchedSockets.set(socket,{originalSend,originalHandleIdentify});
  return true;
}

function reconnectGateway(socket){
  if(!socket||reconnectDone) return;
  reconnectDone=true;
  try{
    socket.sessionId=null;
    socket.seq=0;
    if(socket.webSocket&&typeof socket.webSocket.close==="function"){
      socket.webSocket.close();
    }else if(typeof socket.close==="function"){
      socket.close();
    }
    logger?.log?.("[DesktopSpoofer] Gateway reconnect requested");
  }catch(e){
    logger?.error?.("[DesktopSpoofer] Failed to reconnect Gateway",e);
  }
}

function tick(){
  try{
    const socket=socketModule?.getSocket?.();
    if(!socket) return;
    const newlyPatched=!patchedSockets.has(socket);
    if(patchSocket(socket)&&newlyPatched){
      const connected=typeof socketModule?.isConnected==="function"
        ? socketModule.isConnected()
        : true;
      if(connected) reconnectGateway(socket);
    }else{
      patchTransport(socket);
    }
  }catch(e){
    logger?.error?.("[DesktopSpoofer] Watcher error",e);
  }
}

const plugin={
  onLoad(){
    if(!socketModule){
      showToast("DesktopSpoofer: Gateway module not found");
      throw new Error("Gateway socket module not found");
    }
    reconnectDone=false;
    tick();
    watcher=setInterval(tick,250);
    showToast("DesktopSpoofer enabled");
    logger?.log?.("[DesktopSpoofer] Gateway watcher started");
  },
  onUnload(){
    if(watcher){clearInterval(watcher);watcher=null;}
    const socket=socketModule?.getSocket?.();
    if(socket&&patchedSockets.has(socket)){
      const saved=patchedSockets.get(socket);
      if(saved?.originalSend) socket.send=saved.originalSend;
      if(saved?.originalHandleIdentify) socket.handleIdentify=saved.originalHandleIdentify;
      const ws=socket.webSocket;
      if(ws&&patchedTransports.has(ws)) ws.send=patchedTransports.get(ws);
    }
    reconnectDone=false;
  }
};
return {default:plugin,__esModule:true};
})()
