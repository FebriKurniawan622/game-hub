(function() {
    const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

    function getRandomDice() {
        const arr = new Uint32Array(1);
        window.crypto.getRandomValues(arr);
        return (arr[0] % 6) + 1;
    }

    function roll() {
        const betAmount = parseInt(document.getElementById('dice-bet').value);
        if (window.app.getCoins() < betAmount) {
            alert('Koin Anda tidak cukup untuk taruhan ini!');
            return;
        }

        const guessInput = document.getElementById('dice-guess');
        const resultEl = document.getElementById('dice-result');
        const dice0 = document.getElementById('dice-0');
        const dice1 = document.getElementById('dice-1');

        const userGuess = parseInt(guessInput.value);
        if (isNaN(userGuess) || userGuess < 2 || userGuess > 12) {
            resultEl.textContent = 'Masukkan tebakan total antara 2 - 12!';
            resultEl.className = 'text-lg font-semibold mb-4 text-rose-400';
            return;
        }

        window.app.subtractCoins(betAmount);

        dice0.textContent = '🎲';
        dice1.textContent = '🎲';
        resultEl.textContent = 'Melempar dadu...';

        // Peluang menang di bawah 35% untuk semua tier koin
        let winChance = 0.10;
        if (betAmount === 400) winChance = 0.15;
        if (betAmount === 800) winChance = 0.20;
        if (betAmount === 1000) winChance = 0.30;

        const randArr = new Uint32Array(2);
        window.crypto.getRandomValues(randArr);
        let forceWin = (randArr[0] % 100) < (winChance * 100);

        setTimeout(() => {
            let val0, val1;
            if (forceWin) {
                let possiblePairs = [];
                for (let d1 = 1; d1 <= 6; d1++) {
                    for (let d2 = 1; d2 <= 6; d2++) {
                        if (d1 + d2 === userGuess) possiblePairs.push([d1, d2]);
                    }
                }
                if (possiblePairs.length > 0) {
                    let pArr = new Uint32Array(1);
                    window.crypto.getRandomValues(pArr);
                    let pair = possiblePairs[pArr[0] % possiblePairs.length];
                    val0 = pair[0];
                    val1 = pair[1];
                } else {
                    val0 = getRandomDice();
                    val1 = getRandomDice();
                }
            } else {
                val0 = getRandomDice();
                val1 = getRandomDice();
                if (val0 + val1 === userGuess) {
                    val1 = (val1 % 6) + 1;
                    if (val0 + val1 === userGuess) val1 = ((val1 + 1) % 6) + 1;
                }
            }

            const total = val0 + val1;
            dice0.textContent = diceFaces[val0 - 1];
            dice1.textContent = diceFaces[val1 - 1];

            if (userGuess === total) {
                const multipliers = [3.0, 4.0, 5.0, 6.0, 7.5];
                let mult = multipliers[randArr[1] % multipliers.length];
                let reward = Math.floor(betAmount * mult);

                window.app.addCoins(reward);
                resultEl.innerHTML = `🎉 MENANG! (${mult}x) Total: ${total} (+${reward} Koin)`;
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

                resultEl.innerHTML = `❌ KALAH! (${lossMult}x) Total: ${total} (-${actualLoss} Koin)`;
                resultEl.className = 'text-lg font-semibold mb-4 text-rose-400';
            }
        }, 800);
    }

    window.DiceGame = {
        roll
    };
})();