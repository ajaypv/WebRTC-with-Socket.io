
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

let init = async () => {

   localStream = await navigator.mediaDevices.getUserMedia({video:{
    width: { min: 1280 },
    height: { min: 720 }
  }, audio: /* {
    channelCount: 2,
    sampleRate: 160000000,
    sampleSize: 16,
    volume: 1000000,
  }*/false});
   document.getElementById('user-1').srcObject = localStream
   document.getElementById('user-2').srcObject = remoteStream
   console.log("this is inti funcation")

}

let createOffer = async () =>{
    peerConnection = new RTCPeerConnection(servers);
    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream;

   


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
            document.getElementById('offer-sdp').value = JSON.stringify(peerConnection.localDescription)
           


        }
    }

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    document.getElementById('offer-sdp').value = JSON.stringify(offer);
    const key = JSON.stringify(offer);
    console.log(key);
    

   

}




// this is a answer from the other peer

let createAnswer = async () => {
    peerConnection = new RTCPeerConnection(servers);
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
            document.getElementById('answer-sdp').value = JSON.stringify(peerConnection.localDescription)

        }
    }


    let offer = document.getElementById('offer-sdp').value
    if(!offer) return alert('Retrieve offer from peer first')

    offer  =JSON.parse(offer)
    await peerConnection.setRemoteDescription(offer)

    let answer = await peerConnection.createAnswer()
    await  peerConnection.setLocalDescription(answer)

    document.getElementById('answer-sdp').value = JSON.stringify(answer)
    

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
document.getElementById('create-answer').addEventListener('click', createAnswer)
document.getElementById('add-answer').addEventListener('click',addAnswer)


init()
