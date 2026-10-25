(function() {
    const symbols = ['🍎', '🍊', '🍇', '🍉', '🍋', '🍒'];
    let isSpinning = false;
    let isAutoSpinning = false;
    let autoSpinTimeout = null;

    function getRandomSymbol() {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return symbols[array[0] % symbols.length];
    }

    function spin() {
        if (isSpinning) return;

        const betAmount = parseInt(document.getElementById('slot-bet').value);
        if (window.app.getCoins() < betAmount) {
            alert('Koin Anda tidak cukup untuk melakukan taruhan ini!');
            if (isAutoSpinning) toggleAutoSpin();
            return;
        }

        window.app.subtractCoins(betAmount);
        isSpinning = true;

        const btnSpin = document.getElementById('btn-slot-spin');
        const btnAuto = document.getElementById('btn-slot-auto');
        const forceWinCheckbox = document.getElementById('slot-force-win').checked;
        const resultEl = document.getElementById('slot-result');

        if (btnSpin) btnSpin.disabled = true;
        if (btnAuto) btnAuto.disabled = true;
        resultEl.textContent = 'Memutar...';
        resultEl.className = 'text-lg font-semibold mb-4 text-slate-300';

        // Peluang menang diperkecil agar lebih besar peluang kalahnya (Max 35% untuk taruhan terbesar)
        let winChance = 0.15; // 200 Koin = 15% menang
        if (betAmount === 400) winChance = 0.20; // 400 Koin = 20% menang
        if (betAmount === 800) winChance = 0.25; // 800 Koin = 25% menang
        if (betAmount === 1000) winChance = 0.35; // 1000 Koin = 35% menang (65% tetap peluang kalah)

        const randArr = new Uint32Array(2);
        window.crypto.getRandomValues(randArr);
        let isLuckyWin = forceWinCheckbox || ((randArr[0] % 100) < (winChance * 100));

        let finalResults = [];
        if (isLuckyWin) {
            let sym = getRandomSymbol();
            finalResults = [sym, sym, sym];
        } else {
            finalResults = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
            if (finalResults[0] === finalResults[1] && finalResults[1] === finalResults[2]) {
                finalResults[2] = symbols[(symbols.indexOf(finalResults[2]) + 1) % symbols.length];
            }
        }

        let counter = 0;
        let interval = setInterval(() => {
            for (let i = 0; i < 3; i++) {
                document.getElementById(`slot-${i}`).textContent = getRandomSymbol();
            }
            counter++;
            if (counter > 15) {
                clearInterval(interval);
                for (let i = 0; i < 3; i++) {
                    document.getElementById(`slot-${i}`).textContent = finalResults[i];
                }
                evaluateResult(finalResults, betAmount, randArr[1]);
            }
        }, 100);
    }

    function evaluateResult(res, betAmount, randomSeed) {
        isSpinning = false;
        const btnSpin = document.getElementById('btn-slot-spin');
        const btnAuto = document.getElementById('btn-slot-auto');
        const resultEl = document.getElementById('slot-result');

        if (btnSpin) btnSpin.disabled = false;
        if (btnAuto) btnAuto.disabled = false;

        if (res[0] === res[1] && res[1] === res[2]) {
            const multipliers = [1.5, 2.0, 2.5, 3.0, 4.0, 5.0];
            let mult = multipliers[randomSeed % multipliers.length];
            let reward = Math.floor(betAmount * mult);

            window.app.addCoins(reward);
            resultEl.innerHTML = `🎉 MENANG! (${mult}x) +${reward} Koin`;
            resultEl.className = 'text-lg font-bold mb-4 text-emerald-400 animate-bounce';
            if (isAutoSpinning) toggleAutoSpin();
        } else {
            const lossMultipliers = [0.5, 1.0, 1.25, 1.5, 2.0];
            let lossMult = lossMultipliers[randomSeed % lossMultipliers.length];
            let actualLoss = Math.floor(betAmount * lossMult);
            
            let diff = actualLoss - betAmount;
            if (diff > 0) {
                window.app.subtractCoins(diff);
            } else if (diff < 0) {
                window.app.addCoins(Math.abs(diff));
            }

            resultEl.textContent = `❌ KALAH! (${lossMult}x) Kehilangan ${actualLoss} Koin`;
            resultEl.className = 'text-lg font-semibold mb-4 text-rose-400';
            if (isAutoSpinning) {
                if (window.app.getCoins() < betAmount) {
                    alert('Auto Spin berhenti: Koin habis!');
                    toggleAutoSpin();
                } else {
                    autoSpinTimeout = setTimeout(spin, 1500);
                }
            }
        }
    }

    function toggleAutoSpin() {
        isAutoSpinning = !isAutoSpinning;
        const btnAuto = document.getElementById('btn-slot-auto');
        if (isAutoSpinning) {
            btnAuto.textContent = 'Stop Auto';
            btnAuto.className = 'px-4 py-3 bg-rose-600 hover:bg-rose-500 font-bold rounded-xl transition border border-rose-500 text-white';
            spin();
        } else {
            btnAuto.textContent = 'Auto Spin';
            btnAuto.className = 'px-4 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl transition border border-slate-700';
            if (autoSpinTimeout) clearTimeout(autoSpinTimeout);
        }
    }

    window.SlotGame = {
        spin,
        toggleAutoSpin
    };
})();