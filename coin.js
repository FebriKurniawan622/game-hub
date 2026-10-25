(function() {
    const sides = ['Angka', 'Gambar'];

    function getRandomSide() {
        const arr = new Uint32Array(1);
        window.crypto.getRandomValues(arr);
        return sides[arr[0] % sides.length];
    }

    function flip() {
        const betAmount = parseInt(document.getElementById('coin-bet').value);
        if (window.app.getCoins() < betAmount) {
            alert('Koin Anda tidak cukup untuk taruhan ini!');
            return;
        }

        const guess = document.getElementById('coin-guess').value;
        const resultEl = document.getElementById('coin-result');
        const coin0 = document.getElementById('coin-0');
        const coin1 = document.getElementById('coin-1');

        window.app.subtractCoins(betAmount);

        coin0.textContent = '🌀';
        coin1.textContent = '🌀';
        resultEl.textContent = 'Melempar koin...';

        // Peluang menang di bawah 50% bahkan untuk taruhan tertinggi
        let winChance = 0.15;
        if (betAmount === 400) winChance = 0.20;
        if (betAmount === 800) winChance = 0.25;
        if (betAmount === 1000) winChance = 0.35;

        const randArr = new Uint32Array(2);
        window.crypto.getRandomValues(randArr);
        let forceWin = (randArr[0] % 100) < (winChance * 100);

        setTimeout(() => {
            let res0, res1;
            if (forceWin && guess !== 'Campur') {
                let targetSide = guess.split('-')[0];
                res0 = targetSide;
                res1 = targetSide;
            } else if (forceWin && guess === 'Campur') {
                res0 = 'Angka';
                res1 = 'Gambar';
            } else {
                res0 = getRandomSide();
                res1 = getRandomSide();
            }

            coin0.textContent = res0 === 'Angka' ? '1️⃣' : '👑';
            coin1.textContent = res1 === 'Angka' ? '1️⃣' : '👑';

            const resString = `${res0}-${res1}`;
            let isWin = (guess === 'Campur') || (guess === resString);

            if (isWin) {
                const multipliers = [1.5, 2.0, 2.5, 3.0, 4.0];
                let mult = multipliers[randArr[1] % multipliers.length];
                let reward = Math.floor(betAmount * mult);

                window.app.addCoins(reward);
                resultEl.innerHTML = `🎉 MENANG! (${mult}x) Hasil: ${res0} & ${res1} (+${reward} Koin)`;
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

                resultEl.innerHTML = `❌ KALAH! (${lossMult}x) Hasil: ${res0} & ${res1} (-${actualLoss} Koin)`;
                resultEl.className = 'text-lg font-semibold mb-4 text-rose-400';
            }
        }, 800);
    }

    window.CoinGame = {
        flip
    };
})();