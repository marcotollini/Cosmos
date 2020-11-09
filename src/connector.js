var callbackFuncMap = {}

function sendDruidRequest(druidReqObj) {
    //register callback func
    callbackFuncMap[druidReqObj.rcvr] = druidReqObj.callbackFunc
    socket.emit('request', druidReqObj)
}

function sendRpatRequest(rpatReqObj) {
    callbackFuncMap['rpatResp'] = rpatReqObj.callbackFunc
    socket.emit('rpatReq', rpatReqObj)
}

socket.on('ctrlResp', (msgArr) => {
    callbackFuncMap['ctrlResp'](msgArr)
})

socket.on('dataResp', (msgArr) => {
    callbackFuncMap['dataResp'](msgArr)
  
})

socket.on('rpatResp', (msg) => {
    callbackFuncMap['rpatResp'](msg)
})

    
