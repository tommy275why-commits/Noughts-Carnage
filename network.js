let peer = null;
let conn = null;

function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
}

function updateStatus(msg) {
    document.getElementById('network-status').innerText = msg;
}

window.hostRoom = function() {
    let roomCode = generateRoomCode();
    document.getElementById('room-code-display').innerText = "Room Code: " + roomCode;
    updateStatus("Waiting for a challenger...");

    peer = new Peer(roomCode);

    peer.on('connection', function(connection) {
        conn = connection;
        window.myRole = 'X'; 
        setupConnectionLogic();
    });
};

window.joinRoom = function() {
    let roomCode = document.getElementById('join-code').value.toUpperCase().trim();
    if (!roomCode) { updateStatus("Please enter a code!"); return; }

    updateStatus("Connecting to " + roomCode + "...");
    peer = new Peer(); 

    peer.on('open', function() {
        conn = peer.connect(roomCode);
        window.myRole = 'O'; 
        
        conn.on('open', function() {
            setupConnectionLogic();
        });
    });
};

function setupConnectionLogic() {
    updateStatus("Connected! Starting game...");
    
    document.getElementById('lobby-ui').style.display = 'none';
    loop(); 

    conn.on('data', function(data) {
        if (data.type === 'MOVE') {
            window.applyMove(data.i, data.j, data.powerId, data.sourcePlayer);
        }
    });

    conn.on('close', function() {
        alert("Opponent disconnected!");
        location.reload();
    });
}

window.sendNetworkMove = function(i, j, powerId) {
    if (conn && conn.open) {
        conn.send({
            type: 'MOVE',
            i: i,
            j: j,
            powerId: powerId,
            sourcePlayer: window.myRole
        });
    }
};
