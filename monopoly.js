(function() {
    let playerPos = 0;

    function drawBoard(pos = 0) {
        const canvas = document.getElementById('monopoly-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const size = canvas.width;
        const s = size / 4;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, size, size);

        const cells = [
            {r:3, c:3, name:'GO', color:'#22c55e'},
            {r:3, c:2, name:'Tanah A', color:'#3b82f6'},
            {r:3, c:1, name:'Pajak', color:'#ef4444'},
            {r:3, c:0, name:'Tanah B', color:'#3b82f6'},
            {r:2, c:0, name:'Penjara', color:'#64748b'},
            {r:1, c:0, name:'Tanah C', color:'#eab308'},
            {r:0, c:0, name:'Kesempatan', color:'#a855f7'},
            {r:0, c:1, name:'Tanah D', color:'#eab308'},
            {r:0, c:2, name:'Parkir', color:'#06b6d4'},
            {r:0, c:3, name:'Tanah E', color:'#ec4899'},
            {r:1, c:3, name:'Denda', color:'#ef4444'},
            {r:2, c:3, name:'Tanah F', color:'#ec4899'}
        ];

        cells.forEach((cell, idx) => {
            ctx.fillStyle = idx === pos ? '#facc15' : cell.color;
            ctx.fillRect(cell.c * s + 2, cell.r * s + 2, s - 4, s - 4);
            ctx.strokeStyle = '#334155';
            ctx.strokeRect(cell.c * s + 2, cell.r * s + 2, s - 4, s - 4);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cell.name, cell.c * s + s/2, cell.r * s + s/2);
        });

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(s + 2, s + 2, s * 2 - 4, s * 2 - 4);
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('MONOPOLY', size/2, size/2);
    }

    function play() {
        const betAmount = parseInt(document.getElementById('monopoly-bet').value);
        if (window.app.getCoins() < betAmount) {
            alert('Koin Anda tidak cukup untuk taruhan ini!');
            return;
        }

        const resultEl = document.getElementById('monopoly-result');
        window.app.subtractCoins(betAmount);
        resultEl.textContent = 'Melempar dadu & memutar bidak...';

        let winChance = 0.15;
        if (betAmount === 400) winChance = 0.20;
        if (betAmount === 800) winChance = 0.25;
        if (betAmount === 1000) winChance = 0.35;

        const randArr = new Uint32Array(2);
        window.crypto.getRandomValues(randArr);
        let isWin = (randArr[0] % 100) < (winChance * 100);

        setTimeout(() => {
            playerPos = randArr[1] % 12;
            drawBoard(playerPos);

            if (isWin) {
                const multipliers = [1.5, 2.0, 3.0, 4.0, 5.0];
                let mult = multipliers[randArr[1] % multipliers.length];
                let reward = Math.floor(betAmount * mult);

                window.app.addCoins(reward, reward >= 1000);
                resultEl.innerHTML = `🎉 MENANG SEWA! (${mult}x) Untung besar (+${reward} Koin)`;
                resultEl.className = 'text-sm font-bold mb-3 text-emerald-400';
            } else {
                const lossMultipliers = [0.5, 1.0, 1.25, 1.5, 2.0];
                let lossMult = lossMultipliers[randArr[1] % lossMultipliers.length];
                let actualLoss = Math.floor(betAmount * lossMult);

                let diff = actualLoss - betAmount;
                if (diff > 0) window.app.subtractCoins(diff);
                else if (diff < 0) window.app.addCoins(Math.abs(diff));

                resultEl.innerHTML = `❌ BAYAR SEWA/PAJAK! (${lossMult}x) Rugi (-${actualLoss} Koin)`;
                resultEl.className = 'text-sm font-semibold mb-3 text-rose-400';
            }
        }, 800);
    }

    window.addEventListener('DOMContentLoaded', () => { drawBoard(0); });
    window.MonopolyGame = { play };
})();