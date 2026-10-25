(function() {
    let isDropping = false;

    function drawBoard(bx = 144, by = 20, activeSlot = null) {
        const canvas = document.getElementById('plinko-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const w = canvas.width;
        const h = canvas.height;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#38bdf8';
        for (let row = 0; row < 5; row++) {
            let cols = row + 3;
            let startX = w / 2 - (cols - 1) * 18;
            for (let col = 0; col < cols; col++) {
                let px = startX + col * 36;
                let py = 50 + row * 32;
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        const multipliers = [0.2, 0.5, 1.0, 2.0, 3.5, 5.0];
        const slotWidth = w / multipliers.length;
        multipliers.forEach((m, idx) => {
            ctx.fillStyle = idx === activeSlot ? '#22c55e' : (m >= 2.0 ? '#1e293b' : '#334155');
            ctx.fillRect(idx * slotWidth + 2, h - 35, slotWidth - 4, 30);
            ctx.strokeStyle = '#475569';
            ctx.strokeRect(idx * slotWidth + 2, h - 35, slotWidth - 4, 30);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${m}x`, idx * slotWidth + slotWidth / 2, h - 16);
        });

        ctx.save();
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(bx, by, 7, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }

    function drop() {
        if (isDropping) return;

        const betAmount = parseInt(document.getElementById('plinko-bet').value);
        if (window.app.getCoins() < betAmount) {
            alert('Koin Anda tidak cukup untuk taruhan ini!');
            return;
        }

        const resultEl = document.getElementById('plinko-result');
        window.app.subtractCoins(betAmount);
        isDropping = true;
        resultEl.textContent = 'Bola sedang meluncur melewati pasak...';

        let winChance = 0.15;
        if (betAmount === 400) winChance = 0.20;
        if (betAmount === 800) winChance = 0.25;
        if (betAmount === 1000) winChance = 0.35;

        const randArr = new Uint32Array(2);
        window.crypto.getRandomValues(randArr);
        let isWin = (randArr[0] % 100) < (winChance * 100);

        let targetSlot = isWin ? (randArr[1] % 3) + 3 : (randArr[1] % 3);
        const slotWidth = 288 / 6;
        let finalX = targetSlot * slotWidth + slotWidth / 2;

        let startTime = null;
        const duration = 1200;

        function animateDrop(timestamp) {
            if (!startTime) startTime = timestamp;
            let progress = (timestamp - startTime) / duration;
            if (progress > 1) progress = 1;

            let currentX = 144 + (finalX - 144) * progress + Math.sin(progress * Math.PI * 6) * 12;
            let currentY = 20 + (256 - 50) * progress;

            drawBoard(currentX, currentY, progress === 1 ? targetSlot : null);

            if (progress < 1) {
                requestAnimationFrame(animateDrop);
            } else {
                isDropping = false;
                const multipliers = [0.2, 0.5, 1.0, 2.0, 3.5, 5.0];
                let mult = multipliers[targetSlot];

                if (isWin) {
                    let reward = Math.floor(betAmount * mult);
                    window.app.addCoins(reward, reward >= 1000);
                    resultEl.innerHTML = `🎉 MENANG! (${mult}x) Bola mendarat di zona bonus (+${reward} Koin)`;
                    resultEl.className = 'text-sm font-bold mb-3 text-emerald-400';
                } else {
                    const lossMultipliers = [0.5, 1.0, 1.25, 1.5];
                    let lossMult = lossMultipliers[randArr[1] % lossMultipliers.length];
                    let actualLoss = Math.floor(betAmount * lossMult);

                    let diff = actualLoss - betAmount;
                    if (diff > 0) window.app.subtractCoins(diff);
                    else if (diff < 0) window.app.addCoins(Math.abs(diff));

                    resultEl.innerHTML = `❌ KALAH! (${lossMult}x) Bola di zona rendah (-${actualLoss} Koin)`;
                    resultEl.className = 'text-sm font-semibold mb-3 text-rose-400';
                }
            }
        }

        requestAnimationFrame(animateDrop);
    }

    window.addEventListener('DOMContentLoaded', () => { drawBoard(); });
    window.PlinkoGame = { drop };
})();