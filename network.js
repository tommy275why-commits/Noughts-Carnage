let peer = null;
let conn = null;

// Helper to generate a random 5-letter room code
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
}

function updateStatus(msg) {
    document.getElementById('network-status').innerText = msg;
}

// HOST LOGIC
window.hostRoom = function() {
    let roomCode = generateRoomCode();
    document.getElementById('room-code-display').innerText = "Room Code: " + roomCode;
    updateStatus("Waiting for a challenger...");

    // Initialize PeerJS with the specific room code
    peer = new Peer(roomCode);

    peer.on('connection', function(connection) {
        conn = connection;
        window.myRole = 'X'; // Host is always X
        setupConnectionLogic();
    });
};

// GUEST LOGIC
window.joinRoom = function() {
    let roomCode = document.getElementById('join-code').value.toUpperCase().trim();
    if (!roomCode) { updateStatus("Please enter a code!"); return; }

    updateStatus("Connecting to " + roomCode + "...");
    peer = new Peer(); // Guest gets a random ID

    peer.on('open', function() {
        conn = peer.connect(roomCode);
        window.myRole = 'O'; // Guest is always O
        
        conn.on('open', function() {
            setupConnectionLogic();
        });
    });
};

// SHARED CONNECTION LOGIC
function setupConnectionLogic() {
    updateStatus("Connected! Starting game...");
    
    // Hide the lobby and start the P5.js loop
    document.getElementById('lobby-ui').style.display = 'none';
    loop(); // Unfreezes the game engine we stopped in setup()

    // Listen for incoming moves from the opponent
    conn.on('data', function(data) {
        if (data.type === 'MOVE') {
            // Apply the received move using the function we decoupled in main.js
            window.applyMove(data.i, data.j, data.powerId, data.sourcePlayer);
        }
    });

    conn.on('close', function() {
        alert("Opponent disconnected!");
        location.reload();
    });
}

// OUTGOING MOVES (Called from your main.js mousePressed)
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
