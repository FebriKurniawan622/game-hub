(function() {
    const views = ['home', 'profile', 'slot', 'roulette', 'coin', 'dice', 'rocket', 'ludo', 'chess', 'snakes', 'plinko', 'monopoly'];
    let coins = 5000;
    let dailyClaimed = false;

    function switchView(viewName) {
        views.forEach(v => {
            const el = document.getElementById(`view-${v}`);
            if (el) {
                if (v === viewName) {
                    el.classList.remove('hidden');
                } else {
                    el.classList.add('hidden');
                }
            }
        });
        updateCoinDisplay();
        checkAchievements();
        window.scrollTo(0, 0);
    }

    function updateCoinDisplay() {
        const els = document.querySelectorAll('.user-coin-balance');
        els.forEach(el => {
            el.textContent = coins.toLocaleString('id-ID');
        });
        checkAchievements();
    }

    function claimDailyBonus() {
        const btn = document.getElementById('btn-daily-bonus');
        if (dailyClaimed) {
            alert('Bonus harian sudah diklaim hari ini! Silakan kembali besok.');
            return;
        }
        coins += 500;
        dailyClaimed = true;
        if (btn) {
            btn.textContent = '✅ Sudah Diklaim';
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        updateCoinDisplay();
        showWinPopup('🎁 BONUS HARIAN!', '+500 Koin Ditambahkan!');
    }

    function checkAchievements() {
        const badgeRich = document.getElementById('badge-rich');
        const badgeDaily = document.getElementById('badge-daily');

        if (coins >= 10000 && badgeRich) {
            badgeRich.classList.remove('opacity-50');
            badgeRich.classList.add('border-emerald-500', 'bg-slate-900');
        }
        if (dailyClaimed && badgeDaily) {
            badgeDaily.classList.remove('opacity-50');
            badgeDaily.classList.add('border-emerald-500', 'bg-slate-900');
        }
    }

    function showWinPopup(title, subtitle) {
        const existing = document.getElementById('win-popup-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'win-popup-overlay';
        overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in';
        overlay.innerHTML = `
            <div class="bg-slate-900 border-2 border-emerald-500 p-8 rounded-3xl text-center shadow-2xl max-w-sm mx-auto space-y-4">
                <div class="text-6xl animate-bounce">🎉</div>
                <h3 class="text-2xl font-bold text-emerald-400">${title}</h3>
                <p class="text-slate-300 text-lg font-semibold">${subtitle}</p>
                <button onclick="document.getElementById('win-popup-overlay').remove()" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition">Keren!</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    function getCoins() { return coins; }
    
    function addCoins(amount, isBigWin = false) { 
        coins += amount; 
        updateCoinDisplay();
        if (isBigWin || amount >= 1000) {
            showWinPopup('🔥 MEGA WIN!', `Berhasil Mendapatkan +${amount} Koin!`);
        }
    }

    function subtractCoins(amount) { coins -= amount; updateCoinDisplay(); }

    window.addEventListener('DOMContentLoaded', () => { updateCoinDisplay(); });

    window.app = { switchView, getCoins, addCoins, subtractCoins, updateCoinDisplay, claimDailyBonus, showWinPopup };
})();