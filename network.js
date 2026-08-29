let peer = null;
let conn = null;
const GAME_PREFIX = 'MY_TICTACTOE_MAYHEM_';

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

    peer = new Peer(GAME_PREFIX + roomCode);

    peer.on('connection', function(connection) {
        conn = connection;
        window.myRole = 'X'; 
        let hostSeed = Math.floor(Math.random() * 999999);
        setupConnectionLogic(hostSeed);
    });
};

window.joinRoom = function() {
    let roomCode = document.getElementById('join-code').value.toUpperCase().trim();
    if (!roomCode) { updateStatus("Please enter a code!"); return; }

    updateStatus("Connecting to " + roomCode + "...");
    peer = new Peer(); 

    peer.on('open', function() {
        conn = peer.connect(GAME_PREFIX + roomCode);
        window.myRole = 'O'; 
        
        conn.on('open', function() {
            setupConnectionLogic(null); 
        });
    });
};

function setupConnectionLogic(hostSeed) {
    updateStatus("Connected! Starting game...");
    document.getElementById('lobby-ui').style.display = 'none';

    conn.on('data', function(data) {
        if (data.type === 'START_SYNC') {
            randomSeed(data.seed);
            window.isGameReady = true;
            loop();
        }
        else if (data.type === 'MOVE' && data.sourcePlayer !== window.myRole) {
            window.applyMove(data.i, data.j, data.powerId, data.sourcePlayer);
        }
        else if (data.type === 'DRAFT' && data.sourcePlayer !== window.myRole) {
            playerPowers[data.sourcePlayer].push(data.powerDef);
            // Assuming you have a function to end the draft turn locally:
            if (typeof advanceDraftQueue === "function") advanceDraftQueue(); 
        }
        else if (data.type === 'SWAP' && data.sourcePlayer !== window.myRole) {
            // Apply the opponent's power swap locally
            playerPowers[data.sourcePlayer][data.index] = data.newPowerDef;
            window.closeSwapUI();
        }
    });

    conn.on('close', function() {
        alert("Opponent disconnected!");
        location.reload();
    });

    if (window.myRole === 'X' && hostSeed !== null) {
        setTimeout(() => {
            randomSeed(hostSeed);
            window.isGameReady = true;
            loop();
            conn.send({ type: 'START_SYNC', seed: hostSeed });
        }, 500);
    }
}

window.sendNetworkMove = function(i, j, powerId) {
    if (conn && conn.open) {
        conn.send({ type: 'MOVE', i: i, j: j, powerId: powerId, sourcePlayer: window.myRole });
    }
};
