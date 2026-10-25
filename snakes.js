(function() {
    let playerPos = 1;

    function drawBoard(pos = 1) {
        const canvas = document.getElementById('snakes-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const size = canvas.width;
        const step = size / 10;

        // Gambar grid 1-100 gaya ular tangga klasik
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                let cellNum = r % 2 === 0 ? 100 - (r * 10) - c : 100 - (r * 10) - (9 - c);
                
                ctx.fillStyle = (r + c) % 2 === 0 ? '#334155' : '#1e293b';
                ctx.fillRect(c * step, r * step, step, step);
                ctx.strokeStyle = '#475569'; ctx.lineWidth = 0.5;
                ctx.strokeRect(c * step, r * step, step, step);

                ctx.fillStyle = '#94a3b8';
                ctx.font = `${step * 0.3}px sans-serif`;
                ctx.fillText(cellNum, c * step + 4, r * step + 12);
            }
        }

        // Gambar Tangga & Ular Visual Sederhana di Canvas
        ctx.strokeStyle = '#eab308'; ctx.lineWidth = 3; // Tangga Emas
        ctx.beginPath(); ctx.moveTo(2 * step, 8 * step); ctx.lineTo(2 * step, 4 * step); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(7 * step, 9 * step); ctx.lineTo(7 * step, 2 * step); ctx.stroke();

        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4; // Ular Merah
        ctx.beginPath(); ctx.moveTo(4 * step, 1 * step); ctx.quadraticCurveTo(5 * step, 3 * step, 3 * step, 6 * step); ctx.stroke();

        // Gambar Pion Pemain
        let pRow = Math.floor((pos - 1) / 10);
        let pCol = (pos - 1) % 10;
        if (pRow % 2 === 1) pCol = 9 - pCol;
        let pX = (9 - pRow) * step + step / 2; // Disesuaikan dari atas
        let realRow = 9 - pRow;
        let realCol = pRow % 2 === 0 ? (pos - 1) % 10 : 9 - ((pos - 1) % 10);

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(realCol * step + step / 2, realRow * step + step / 2, step * 0.35, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
    }

    function play() {
        const betAmount = parseInt(document.getElementById('snakes-bet').value);
        if (window.app.getCoins() < betAmount) {
            alert('Koin Anda tidak cukup untuk taruhan ini!');
            return;
        }

        const resultEl = document.getElementById('snakes-result');
        window.app.subtractCoins(betAmount);
        resultEl.textContent = 'Melempar dadu ular tangga...';

        let winChance = 0.15;
        if (betAmount === 400) winChance = 0.20;
        if (betAmount === 800) winChance = 0.25;
        if (betAmount === 1000) winChance = 0.35;

        const randArr = new Uint32Array(2);
        window.crypto.getRandomValues(randArr);
        let isWin = (randArr[0] % 100) < (winChance * 100);

        setTimeout(() => {
            if (isWin) {
                playerPos = 95; // Naik tangga mendekati 100
                drawBoard(playerPos);

                const multipliers = [2.0, 3.0, 4.0, 6.0];
                let mult = multipliers[randArr[1] % multipliers.length];
                let reward = Math.floor(betAmount * mult);

                window.app.addCoins(reward);
                resultEl.innerHTML = `🎉 MENAIKI TANGGA! (${mult}x) Capai kotak 95! (+${reward} Koin)`;
                resultEl.className = 'text-sm font-bold mb-3 text-emerald-400';
            } else {
                playerPos = (randArr[1] % 40) + 10; // Terkena ular turun ke bawah
                drawBoard(playerPos);

                const lossMultipliers = [0.5, 1.0, 1.25, 1.5, 2.0];
                let lossMult = lossMultipliers[randArr[1] % lossMultipliers.length];
                let actualLoss = Math.floor(betAmount * lossMult);

                let diff = actualLoss - betAmount;
                if (diff > 0) window.app.subtractCoins(diff);
                else if (diff < 0) window.app.addCoins(Math.abs(diff));

                resultEl.innerHTML = `🐍 DIGIGIT ULAR! (${lossMult}x) Turun ke kotak ${playerPos} (-${actualLoss} Koin)`;
                resultEl.className = 'text-sm font-semibold mb-3 text-rose-400';
            }
        }, 800);
    }

    window.addEventListener('DOMContentLoaded', () => { drawBoard(1); });
    window.SnakesGame = { play };
})();