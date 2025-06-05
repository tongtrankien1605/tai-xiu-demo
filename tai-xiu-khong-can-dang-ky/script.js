let money = 0;
let round = 0;
let history = [];
let stats = { 'Tài': 0, 'Xỉu': 0 };
let selectedBet = '';

function startGame() {
    const initialMoney = parseInt(document.getElementById('initial-money').value);
    if (isNaN(initialMoney) || initialMoney <= 0) {
        document.getElementById('start-error').textContent = 'Vui lòng nhập số tiền dương!';
        return;
    }
    money = initialMoney;
    round = 1;
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    updateGameInfo();
}

function selectBet(bet) {
    selectedBet = bet;
    document.getElementById('bet-error').textContent = `Đã chọn: ${bet === 'T' ? 'Tài' : 'Xỉu'}`;
}

function placeBet() {
    if (!selectedBet) {
        document.getElementById('bet-error').textContent = 'Vui lòng chọn Tài hoặc Xỉu!';
        return;
    }
    const betAmount = parseInt(document.getElementById('bet-amount').value);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > money) {
        document.getElementById('bet-error').textContent = 'Số tiền cược không hợp lệ!';
        return;
    }

    document.getElementById('dice-result').textContent = 'Đang tung xúc xắc...';
    let dots = 0;
    const interval = setInterval(() => {
        document.getElementById('dice-result').textContent = `Đang tung xúc xắc${'.'.repeat(dots)}`;
        dots = (dots + 1) % 4;
    }, 500);

    setTimeout(() => {
        clearInterval(interval);
        const dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
        const sum = dice.reduce((a, b) => a + b, 0);
        const result = sum >= 11 && sum <= 17 ? 'Tài' : 'Xỉu';
        stats[result]++;
        
        document.getElementById('dice-result').textContent = `Xúc xắc: [${dice.join(', ')}] => Tổng: ${sum} => ${result}`;
        document.getElementById('dice-result').className = result === 'Tài' ? 'tai' : 'xiu';

        const betType = selectedBet === 'T' ? 'Tài' : 'Xỉu';
        if (betType === result) {
            money += betAmount;
            history.push('Thắng');
            document.getElementById('bet-error').textContent = `THẮNG! +${betAmount} VND`;
        } else {
            money -= betAmount;
            history.push('Thua');
            document.getElementById('bet-error').textContent = `THUA! -${betAmount} VND`;
        }

        if (money <= 0) {
            document.getElementById('game-screen').innerHTML = '<h2>HẾT TIỀN RỒI! TẠM BIỆT!</h2>';
            saveGameStats();
            return;
        }

        round++;
        updateGameInfo();
        selectedBet = '';
    }, 2000);
}

function updateGameInfo() {
    document.getElementById('round-info').textContent = `--- VÒNG CHƠI ${round} ---`;
    document.getElementById('balance').textContent = `Số tiền hiện tại: ${money} VND`;
    document.getElementById('stats').textContent = `Tài: ${stats['Tài']} | Xỉu: ${stats['Xỉu']}`;
    document.getElementById('history').textContent = `Lịch sử: ${history.slice(-5).join(' | ') || 'Chưa có'}`;
}

function quitGame() {
    document.getElementById('game-screen').innerHTML = '<h2>OK! Hẹn gặp lại!</h2>';
    saveGameStats();
}

function saveGameStats() {
    fetch('save_stats.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ money, stats, history })
    }).then(response => response.text()).then(data => console.log(data));
}