let user = null;
let round = 0;
let history = [];
let stats = { 'Tài': 0, 'Xỉu': 0 };
let selectedBet = '';

// Khởi tạo người dùng mặc định nếu chưa có
if (!localStorage.getItem('users')) {
    const defaultUsers = [
        {
            username: 'admin',
            password: 'admin123', // Lưu ý: Mật khẩu không mã hóa trong localStorage
            email: 'admin@example.com',
            balance: 1000
        }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
}

function showRegister() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('register-screen').style.display = 'block';
}

function showLogin() {
    document.getElementById('register-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'block';
}

function register() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const error = document.getElementById('register-error');

    if (!username || !email || !password) {
        error.textContent = 'Vui lòng điền đầy đủ thông tin!';
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.username === username || u.email === email)) {
        error.textContent = 'Tên người dùng hoặc email đã tồn tại!';
        return;
    }

    users.push({ username, password, email, balance: 1000 });
    localStorage.setItem('users', JSON.stringify(users));
    error.textContent = 'Đăng ký thành công!';
    showLogin();
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const error = document.getElementById('login-error');

    if (!username || !password) {
        error.textContent = 'Vui lòng điền đầy đủ thông tin!';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = users.find(u => u.username === username && u.password === password);

    if (foundUser) {
        user = foundUser;
        round = 1;
        // Lấy lịch sử và thống kê từ localStorage (nếu có)
        history = JSON.parse(localStorage.getItem(`history_${username}`)) || [];
        stats = JSON.parse(localStorage.getItem(`stats_${username}`)) || { 'Tài': 0, 'Xỉu': 0 };
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        updateGameInfo();
        error.textContent = 'Đăng nhập thành công!';
    } else {
        error.textContent = 'Tên người dùng hoặc mật khẩu sai!';
    }
}

function deposit() {
    const depositAmount = parseInt(document.getElementById('deposit-amount').value);
    const error = document.getElementById('deposit-error');

    if (isNaN(depositAmount) || depositAmount < 1000) {
        error.textContent = 'Số tiền nạp phải từ 1000 VND trở lên!';
        return;
    }

    user.balance += depositAmount;
    error.textContent = `Nạp thành công +${depositAmount} VND!`;

    // Cập nhật localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === user.username);
    if (userIndex !== -1) {
        users[userIndex].balance = user.balance;
        localStorage.setItem('users', JSON.stringify(users));
    }

    updateGameInfo();
    document.getElementById('deposit-amount').value = '';
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
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > user.balance) {
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
        let outcome = '';
        if (betType === result) {
            user.balance += betAmount;
            outcome = 'Thắng';
            document.getElementById('bet-error').textContent = `THẮNG! +${betAmount} VND`;
        } else {
            user.balance -= betAmount;
            outcome = 'Thua';
            document.getElementById('bet-error').textContent = `THUA! -${betAmount} VND`;
        }
        history.push(outcome);

        // Cập nhật localStorage
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.username === user.username);
        if (userIndex !== -1) {
            users[userIndex].balance = user.balance;
            localStorage.setItem('users', JSON.stringify(users));
        }
        localStorage.setItem(`history_${user.username}`, JSON.stringify(history));
        localStorage.setItem(`stats_${user.username}`, JSON.stringify(stats));

        if (user.balance <= 0) {
            document.getElementById('bet-error').textContent = 'Hết tiền! Vui lòng nạp thêm tiền để tiếp tục.';
            // Không kết thúc trò chơi, cho phép người chơi nạp tiền
        }

        round++;
        updateGameInfo();
        selectedBet = '';
    }, 2000);
}

function updateGameInfo() {
    document.getElementById('round-info').textContent = `--- VÒNG CHƠI ${round} ---`;
    document.getElementById('user-info').textContent = `Người chơi: ${user.username}`;
    document.getElementById('balance').textContent = `Số tiền hiện tại: ${user.balance} VND`;
    document.getElementById('stats').textContent = `Tài: ${stats['Tài']} | Xỉu: ${stats['Xỉu']}`;
    document.getElementById('history').textContent = `Lịch sử: ${history.slice(-5).join(' | ') || 'Chưa có'}`;
}

function logout() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'block';
    user = null;
    history = [];
    stats = { 'Tài': 0, 'Xỉu': 0 };
    round = 0;
}