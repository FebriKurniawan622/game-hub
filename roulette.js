(function() {
    const wheelNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    
    let currentAngle = 0;
    let isSpinning = false;

    function drawWheel(angle = 0) {
        const canvas = document.getElementById('roulette-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const center = canvas.width / 2;
        const radius = center - 10;
        const sliceAngle = (2 * Math.PI) / wheelNumbers.length;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(angle);

        wheelNumbers.forEach((num, index) => {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, index * sliceAngle, (index + 1) * sliceAngle);
            ctx.closePath();

            if (num === 0) {
                ctx.fillStyle = '#16a34a';
            } else if (index % 2 === 0) {
                ctx.fillStyle = '#dc2626';
            } else {
                ctx.fillStyle = '#1e293b';
            }
            ctx.fill();
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.save();
            ctx.rotate(index * sliceAngle + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText(num, radius - 10, 4);
            ctx.restore();
        });

        ctx.restore();
    }

    function spin() {
        if (isSpinning) return;

        const betAmount = parseInt(document.getElementById('roulette-bet').value);
        if (window.app.getCoins() < betAmount) {
            alert('Koin Anda tidak cukup untuk taruhan ini!');
            return;
        }

        const guessInput = document.getElementById('roulette-guess');
        const resultEl = document.getElementById('roulette-result');
        const userGuess = parseInt(guessInput.value);

        if (isNaN(userGuess) || userGuess < 0 || userGuess > 36) {
            resultEl.textContent = 'Masukkan angka tebakan antara 0 - 36!';
            resultEl.className = 'text-lg font-semibold mb-4 text-rose-400';
            return;
        }

        window.app.subtractCoins(betAmount);
        isSpinning = true;

        const btnSpin = document.getElementById('btn-roulette-spin');
        if (btnSpin) btnSpin.disabled = true;

        resultEl.textContent = 'Memutar roda...';
        resultEl.className = 'text-lg font-semibold mb-4 text-slate-300';

        // Peluang menang roulette sangat kecil (max 25% untuk 1000 koin)
        let winChance = 0.05;
        if (betAmount === 400) winChance = 0.10;
        if (betAmount === 800) winChance = 0.15;
        if (betAmount === 1000) winChance = 0.25;

        const randArr = new Uint32Array(2);
        window.crypto.getRandomValues(randArr);
        let hitUser = (randArr[0] % 100) < (winChance * 100);

        let winningNumber;
        if (hitUser) {
            winningNumber = userGuess;
        } else {
            do {
                let rArr = new Uint32Array(1);
                window.crypto.getRandomValues(rArr);
                winningNumber = wheelNumbers[rArr[0] % wheelNumbers.length];
            } while (winningNumber === userGuess);
        }

        const winningIndex = wheelNumbers.indexOf(winningNumber);
        const sliceAngle = (2 * Math.PI) / wheelNumbers.length;
        const targetAngle = 2 * Math.PI * 5 + (2 * Math.PI - (winningIndex * sliceAngle + sliceAngle / 2));

        let startTime = null;
        const duration = 3000;

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            let progress = (timestamp - startTime) / duration;
            if (progress > 1) progress = 1;

            let easeOut = 1 - Math.pow(1 - progress, 3);
            let currentRot = currentAngle + (targetAngle - currentAngle) * easeOut;
            drawWheel(currentRot);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                currentAngle = targetAngle % (2 * Math.PI);
                isSpinning = false;
                if (btnSpin) btnSpin.disabled = false;

                if (userGuess === winningNumber) {
                    const multipliers = [10, 12, 15, 18, 20, 25];
                    let mult = multipliers[randArr[1] % multipliers.length];
                    let reward = Math.floor(betAmount * mult);

                    window.app.addCoins(reward);
                    resultEl.innerHTML = `🎉 MENANG! (${mult}x) Angka: ${winningNumber} (+${reward} Koin)`;
                    resultEl.className = 'text-lg font-bold mb-4 text-emerald-400';
                } else {
                    const lossMultipliers = [0.5, 1.0, 1.25, 1.5, 2.0];
                    let lossMult = lossMultipliers[randArr[1] % lossMultipliers.length];
                    let actualLoss = Math.floor(betAmount * lossMult);

                    let diff = actualLoss - betAmount;
                    if (diff > 0) {
                        window.app.subtractCoins(diff);
                    } else if (diff < 0) {
                        window.app.addCoins(Math.abs(diff));
                    }

                    resultEl.innerHTML = `❌ KALAH! (${lossMult}x) Angka: ${winningNumber} (-${actualLoss} Koin)`;
                    resultEl.className = 'text-lg font-semibold mb-4 text-rose-400';
                }
            }
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('DOMContentLoaded', () => {
        drawWheel(0);
    });

    window.RouletteGame = {
        spin
    };
})();