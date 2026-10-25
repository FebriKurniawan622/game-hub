(function() {
    let currentVal = 1.00;
    let historyPoints = [1.00, 1.05, 1.10];

    function drawRocketCanvas() {
        const canvas = document.getElementById('rocket-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }

        if (historyPoints.length < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3;

        let minVal = Math.min(...historyPoints);
        let maxVal = Math.max(...historyPoints);
        if (maxVal === minVal) maxVal += 1;

        historyPoints.forEach((val, idx) => {
            let x = (idx / (historyPoints.length - 1)) * canvas.width;
            let y = canvas.height - ((val - minVal) / (maxVal - minVal)) * (canvas.height - 40) - 20;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        let lastX = canvas.width;
        let lastY = canvas.height - ((historyPoints[historyPoints.length - 1] - minVal) / (maxVal - minVal)) * (canvas.height - 40) - 20;
        ctx.font = '20px sans-serif';
        ctx.fillText('🚀', lastX - 30, lastY + 5);
    }

    function guess(userPrediction) {
        const betAmount = parseInt(document.getElementById('rocket-bet').value);
        if (window.app.getCoins() < betAmount) {
            alert('Koin Anda tidak cukup untuk taruhan ini!');
            return;
        }

        const statusEl = document.getElementById('rocket-status');
        const resultEl = document.getElementById('rocket-result');

        window.app.subtractCoins(betAmount);

        // Peluang menang dibatasi rendah (max 35% untuk 1000 koin)
        let winChance = 0.20;
        if (betAmount === 400) winChance = 0.25;
        if (betAmount === 800) winChance = 0.30;
        if (betAmount === 1000) winChance = 0.35;

        const randArr = new Uint32Array(3);
        window.crypto.getRandomValues(randArr);
        let forceWin = (randArr[0] % 100) < (winChance * 100);

        let magnitude = ((randArr[1] % 15) + 5) / 100;
        let actualDirection = forceWin ? userPrediction : (userPrediction === 'UP' ? 'DOWN' : 'UP');

        let prevVal = currentVal;
        if (actualDirection === 'UP') {
            currentVal += magnitude;
        } else {
            currentVal = Math.max(1.00, currentVal - magnitude);
        }

        historyPoints.push(currentVal);
        if (historyPoints.length > 20) historyPoints.shift();

        drawRocketCanvas();
        resultEl.textContent = `Nilai: ${currentVal.toFixed(2)}x`;

        if (userPrediction === actualDirection) {
            const multipliers = [1.5, 2.0, 2.5, 3.0, 4.0];
            let mult = multipliers[randArr[2] % multipliers.length];
            let reward = Math.floor(betAmount * mult);

            window.app.addCoins(reward);
            statusEl.innerHTML = `🎉 BENAR! (${mult}x) Sistem bergerak ${actualDirection === 'UP' ? 'NAIK 🚀' : 'TURUN 📉'} (+${reward} Koin)`;
            statusEl.className = 'text-sm font-bold mb-2 text-emerald-400';
        } else {
            const lossMultipliers = [0.5, 1.0, 1.25, 1.5, 2.0];
            let lossMult = lossMultipliers[randArr[2] % lossMultipliers.length];
            let actualLoss = Math.floor(betAmount * lossMult);

            let diff = actualLoss - betAmount;
            if (diff > 0) {
                window.app.subtractCoins(diff);
            } else if (diff < 0) {
                window.app.addCoins(Math.abs(diff));
            }

            statusEl.innerHTML = `❌ SALAH! (${lossMult}x) Sistem bergerak ${actualDirection === 'UP' ? 'NAIK 🚀' : 'TURUN 📉'} (-${actualLoss} Koin)`;
            statusEl.className = 'text-sm font-semibold mb-2 text-rose-400';
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        drawRocketCanvas();
    });

    window.RocketGame = {
        guess
    };
})();