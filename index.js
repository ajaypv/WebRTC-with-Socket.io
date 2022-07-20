import {io} from "socket.io-client";
const socket = io("http://localhost:3000")

let peerConnection;
let localStream;
let remoteStream;

let servers = {
    iceServers:[
        {
            urls:['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
        }
    ]
}


//to initalize the video and audio
let init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
   document.getElementById('user-1').srcObject = localStream
}
init();


//To display the socket id in html after connecting to server
socket.on("connect",()=>{
    document.getElementById("iduser").innerHTML = `id ${socket.id}`
    
})
//To recive the Offer 
socket.on("reciveingOffer",(message,to)=>{
    document.getElementById('offer-sdp').value = message;
    createAnswer(to)
    
})

//TO recive the Answer
socket.on("reciveingAnswer",(answer)=>{
    answer = JSON.parse(answer)
    if(!peerConnection.currentRemoteDescription){
        peerConnection.setRemoteDescription(answer)
    }
    
})

// To add Icecandidate in peer connection
socket.on("candidate",(candidate)=>{
    if(peerConnection){
        peerConnection.addIceCandidate(candidate)
    }
})


//To create peerConnection 
let createPeerConnection = async (sdpType, to) => {
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })

    peerConnection.ontrack = async (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = async (event) => {
        if(event.candidate){
            document.getElementById(sdpType).value = JSON.stringify(peerConnection.localDescription)
            socket.emit("sendingonIcecandidate",event.candidate,to)
            
        }
    }
}



//creating a offer and sending to other peer
let createOffer = async () => {
    const to=  document.getElementById('sdpkey').value
    createPeerConnection('offer-sdp', to)
    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    document.getElementById('offer-sdp').value = JSON.stringify(offer)
    socket.emit("sendingOffer",JSON.stringify(offer),to,socket.id)
}


let createAnswer = async (to) => {
    createPeerConnection('answer-sdp', to)
    let offer = document.getElementById('offer-sdp').value
    if(!offer) return alert('Retrieve offer from peer first...')
    offer = JSON.parse(offer)
    await peerConnection.setRemoteDescription(offer)
    let answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    document.getElementById('answer-sdp').value  = JSON.stringify(answer)
    socket.emit("sendingAnswer",JSON.stringify(answer),to)
}

let addAnswer = async () => {
    let answer = document.getElementById('answer-sdp').value
    if(!answer) return alert('Retrieve answer from peer first...')

    answer = JSON.parse(answer)
    if(!peerConnection.currentRemoteDescription){
        peerConnection.setRemoteDescription(answer)
    }

}


document.getElementById('create-offer').addEventListener('click', createOffer)
