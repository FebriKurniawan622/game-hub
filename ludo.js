(function() {
    let tokenPosition = 0; // 0 = di base, 1-52 = di jalur, 56 = finish

    function drawBoard(pos = 0) {
        const canvas = document.getElementById('ludo-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const size = canvas.width;
        const step = size / 15;

        // Background papan
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, size, size);

        // 1. Base Kotak 4 Warna (Hijau, Kuning, Biru, Merah)
        ctx.fillStyle = '#16a34a'; ctx.fillRect(0, 0, 6 * step, 6 * step);         // Hijau (Atas-Kiri)
        ctx.fillStyle = '#ca8a04'; ctx.fillRect(9 * step, 0, 6 * step, 6 * step);   // Kuning (Atas-Kanan)
        ctx.fillStyle = '#2563eb'; ctx.fillRect(9 * step, 9 * step, 6 * step, 6 * step); // Biru (Bawah-Kanan)
        ctx.fillStyle = '#dc2626'; ctx.fillRect(0, 9 * step, 6 * step, 6 * step);   // Merah (Bawah-Kiri)

        // Kotak Putih di dalam Base (Rumah Pion)
        const drawHomeBase = (x, y, color) => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect((x + 1) * step, (y + 1) * step, 4 * step, 4 * step);
            // 4 lingkaran pion di dalam base
            ctx.fillStyle = color;
            [ [x+1.5, y+1.5], [x+3.5, y+1.5], [x+1.5, y+3.5], [x+3.5, y+3.5] ].forEach(pt => {
                ctx.beginPath();
                ctx.arc(pt[0] * step, pt[1] * step, step * 0.7, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();
            });
        };
        drawHomeBase(0, 0, '#16a34a'); // Hijau
        drawHomeBase(9, 0, '#ca8a04'); // Kuning
        drawHomeBase(9, 9, '#2563eb'); // Biru
        drawHomeBase(0, 9, '#dc2626'); // Merah

        // 2. Jalur Utama (Tracks)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(6 * step, 0, 3 * step, 15 * step);
        ctx.fillRect(0, 6 * step, 15 * step, 3 * step);

        // Grid sel jalur warna-warni
        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = '#22c55e'; ctx.fillRect(6 * step, i * step, step, step);       // Hijau track
            ctx.fillStyle = '#eab308'; ctx.fillRect((14 - i) * step, 6 * step, step, step); // Kuning track
            ctx.fillStyle = '#3b82f6'; ctx.fillRect(8 * step, (14 - i) * step, step, step); // Biru track
            ctx.fillStyle = '#ef4444'; ctx.fillRect(i * step, 8 * step, step, step);        // Merah track
        }

        // Jalur Masuk Finish (Home Stretch)
        for(let i=1; i<=5; i++) { 
            ctx.fillStyle = '#22c55e'; ctx.fillRect(i * step, 7 * step, step, step); 
            ctx.fillStyle = '#eab308'; ctx.fillRect(7 * step, i * step, step, step); 
            ctx.fillStyle = '#3b82f6'; ctx.fillRect((14 - i) * step, 7 * step, step, step); 
            ctx.fillStyle = '#ef4444'; ctx.fillRect(7 * step, (14 - i) * step, step, step); 
        }

        // 3. Pusat (Home Triangle Finish Center)
        ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(6*step, 9*step); ctx.lineTo(9*step, 9*step); ctx.lineTo(7.5*step, 7.5*step); ctx.fill();
        ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.moveTo(6*step, 6*step); ctx.lineTo(6*step, 9*step); ctx.lineTo(7.5*step, 7.5*step); ctx.fill();
        ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.moveTo(6*step, 6*step); ctx.lineTo(9*step, 6*step); ctx.lineTo(7.5*step, 7.5*step); ctx.fill();
        ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.moveTo(9*step, 6*step); ctx.lineTo(9*step, 9*step); ctx.lineTo(7.5*step, 7.5*step); ctx.fill();

        // 4. Posisi Pion Pemain
        let tokenX = step * 1.5, tokenY = step * 10.5; // Default di base merah
        if (pos > 0 && pos < 56) {
            const path = [
                [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
                [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
                [7, 0],
                [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
                [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
                [14, 7],
                [14, 8], [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
                [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
                [7, 14],
                [6, 14], [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
                [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
            ];
            let idx = (pos - 1) % path.length;
            tokenX = (path[idx][0] + 0.5) * step;
            tokenY = (path[idx][1] + 0.5) * step;
        } else if (pos >= 56) {
            tokenX = 7.5 * step;
            tokenY = 7.5 * step;
        }

        // Gambar Pion Aktif dengan Efek Glow Menarik
        ctx.save();
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(tokenX, tokenY, step * 0.45, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    function play() {
        const betAmount = parseInt(document.getElementById('ludo-bet').value);
        if (window.app.getCoins() < betAmount) {
            alert('Koin Anda tidak cukup untuk taruhan ini!');
            return;
        }

        const resultEl = document.getElementById('ludo-result');
        window.app.subtractCoins(betAmount);
        resultEl.textContent = 'Melempar dadu & menggerakkan pion...';

        let winChance = 0.15;
        if (betAmount === 400) winChance = 0.20;
        if (betAmount === 800) winChance = 0.25;
        if (betAmount === 1000) winChance = 0.35;

        const randArr = new Uint32Array(2);
        window.crypto.getRandomValues(randArr);
        let isWin = (randArr[0] % 100) < (winChance * 100);

        setTimeout(() => {
            if (isWin) {
                tokenPosition = 56; // Finish
                drawBoard(tokenPosition);

                const multipliers = [2.0, 2.5, 3.0, 4.0];
                let mult = multipliers[randArr[1] % multipliers.length];
                let reward = Math.floor(betAmount * mult);

                window.app.addCoins(reward);
                resultEl.innerHTML = `🎉 MENANG! (${mult}x) Pion sukses mencapai Finish! (+${reward} Koin)`;
                resultEl.className = 'text-sm font-bold mb-3 text-emerald-400';
            } else {
                tokenPosition = (randArr[1] % 25) + 1;
                drawBoard(tokenPosition);

                const lossMultipliers = [0.5, 1.0, 1.25, 1.5, 2.0];
                let lossMult = lossMultipliers[randArr[1] % lossMultipliers.length];
                let actualLoss = Math.floor(betAmount * lossMult);

                let diff = actualLoss - betAmount;
                if (diff > 0) window.app.subtractCoins(diff);
                else if (diff < 0) window.app.addCoins(Math.abs(diff));

                resultEl.innerHTML = `❌ KALAH! (${lossMult}x) Pion tertangkap lawan (-${actualLoss} Koin)`;
                resultEl.className = 'text-sm font-semibold mb-3 text-rose-400';
            }
        }, 800);
    }

    window.addEventListener('DOMContentLoaded', () => { drawBoard(0); });
    window.LudoGame = { play };
})();