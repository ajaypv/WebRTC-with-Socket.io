const io = require("socket.io")(3000,{
    cors:['http://localhost:8080']
})

io.on('connection', socket=>{
    socket.on("sendingOffer",(message,to,from) =>{
        socket.to(to).emit("reciveingOffer",message,from)
    })
    socket.on("sendingonIcecandidate",(candidate,to) =>{
        socket.to(to).emit("candidate",candidate)
    })
    socket.on("sendingAnswer",(answer,to) =>{
        socket.to(to).emit("reciveingAnswer",answer)
    })

})