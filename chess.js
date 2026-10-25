(function() {
    let boardState = [
        ['♜','♞','♝','♛','♚','♝','♞','♜'],
        ['♟','♟','♟','♟','♟','♟','♟','♟'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['♙','♙','♙','♙','♙','♙','♙','♙'],
        ['♖','♘','♗','♕','♔','♗','♘','♖']
    ];
    let lastMove = null; // Menyimpan jejak langkah terakhir untuk efek interaktif

    function drawBoard() {
        const canvas = document.getElementById('chess-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const size = canvas.width;
        const squareSize = size / 8;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                // Warna petak papan catur klasik
                ctx.fillStyle = (r + c) % 2 === 0 ? '#eed9b7' : '#b58863';
                ctx.fillRect(c * squareSize, r * squareSize, squareSize, squareSize);

                // Highlight kotak bidak yang baru berpindah (Efek Interaktif)
                if (lastMove && lastMove.r === r && lastMove.c === c) {
                    ctx.fillStyle = 'rgba(250, 204, 21, 0.45)';
                    ctx.fillRect(c * squareSize, r * squareSize, squareSize, squareSize);
                }

                let piece = boardState[r][c];
                if (piece) {
                    ctx.save();
                    // Efek bayangan teks bidak agar tampak hidup
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    ctx.shadowBlur = 4;
                    ctx.fillStyle = r < 2 ? '#0f172a' : '#ffffff';
                    ctx.font = `bold ${squareSize * 0.72}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(piece, c * squareSize + squareSize / 2, r * squareSize + squareSize / 2);
                    ctx.restore();
                }
            }
        }
    }

    function play() {
        const betAmount = parseInt(document.getElementById('chess-bet').value);
        if (window.app.getCoins() < betAmount) {
            alert('Koin Anda tidak cukup untuk taruhan ini!');
            return;
        }

        const resultEl = document.getElementById('chess-result');
        window.app.subtractCoins(betAmount);
        resultEl.textContent = 'Menganalisis strategi & melangkah...';

        let winChance = 0.15;
        if (betAmount === 400) winChance = 0.20;
        if (betAmount === 800) winChance = 0.25;
        if (betAmount === 1000) winChance = 0.35;

        const randArr = new Uint32Array(3);
        window.crypto.getRandomValues(randArr);
        let isWin = (randArr[0] % 100) < (winChance * 100);

        setTimeout(() => {
            if (isWin) {
                // Simulasi bidak melangkah maju saat menang
                lastMove = { r: 4, c: 4 };
                boardState[4][4] = boardState[6][4];
                boardState[6][4] = '';
                drawBoard();

                const multipliers = [2.5, 3.0, 4.0, 5.0];
                let mult = multipliers[randArr[1] % multipliers.length];
                let reward = Math.floor(betAmount * mult);

                window.app.addCoins(reward);
                resultEl.innerHTML = `🎉 SKAKMAT! (${mult}x) Serangan sukses (+${reward} Koin)`;
                resultEl.className = 'text-sm font-bold mb-3 text-emerald-400';
            } else {
                // Simulasi bidak terpojok saat kalah
                lastMove = { r: 3, c: 3 };
                boardState[3][3] = boardState[1][3];
                boardState[1][3] = '';
                drawBoard();

                const lossMultipliers = [0.5, 1.0, 1.25, 1.5, 2.0];
                let lossMult = lossMultipliers[randArr[1] % lossMultipliers.length];
                let actualLoss = Math.floor(betAmount * lossMult);

                let diff = actualLoss - betAmount;
                if (diff > 0) window.app.subtractCoins(diff);
                else if (diff < 0) window.app.addCoins(Math.abs(diff));

                resultEl.innerHTML = `❌ SKAK SKOR! (${lossMult}x) Bidak tertangkap (-${actualLoss} Koin)`;
                resultEl.className = 'text-sm font-semibold mb-3 text-rose-400';
            }
        }, 800);
    }

    window.addEventListener('DOMContentLoaded', () => { drawBoard(); });
    window.ChessGame = { play };
})();