// Адрес вашего развернутого контракта
const contractAddress = '0x5c6040F9CF90c263278aD4aAcB3a76Bb5fabf8c7';
// ABI вашего контракта
const contractAbi = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_message",
                "type": "string"
            }
        ],
        "name": "setMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMessage",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

let contract = null;
let signer = null;

// Проверяем наличие MetaMask
if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Сначала подключаем кошелек
    document.getElementById('connectButton').onclick = async () => {
        try {
            // Запрашиваем доступ к аккаунтам
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Получаем signer только после подключения
            signer = provider.getSigner();
            
            // Создаем экземпляр контракта
            contract = new ethers.Contract(contractAddress, contractAbi, signer);
            
            // Получаем адрес подключенного кошелька
            const address = await signer.getAddress();
            document.getElementById('accountInfo').innerHTML = `Подключен: ${address}`;
            
            // Теперь активируем кнопки для работы с контрактом
            activateContractButtons();
            
        } catch (error) {
            console.error("Ошибка подключения:", error);
            alert('Ошибка подключения к кошельку: ' + error.message);
        }
    };
    
} else {
    alert('Установите MetaMask или другой кошелек.');
    document.getElementById('accountInfo').innerHTML = 'MetaMask не обнаружен';
}

function activateContractButtons() {
    // Кнопка установки сообщения
    document.getElementById('setMessageButton').onclick = async () => {
        try {
            const message = document.getElementById('messageInput').value;
            if (!message.trim()) {
                alert('Введите сообщение');
                return;
            }
            
            // Показываем уведомление о транзакции
            document.getElementById('messageDisplay').innerText = 'Отправка транзакции...';
            
            // Вызываем setMessage (это изменит состояние и потребует газа)
            const tx = await contract.setMessage(message);
            
            // Ждем подтверждения транзакции
            await tx.wait();
            
            document.getElementById('messageDisplay').innerText = 'Сообщение установлено! Транзакция подтверждена.';
            alert('Сообщение успешно установлено!');
            
        } catch (error) {
            console.error("Ошибка установки сообщения:", error);
            document.getElementById('messageDisplay').innerText = 'Ошибка: ' + error.message;
        }
    };
    
    // Кнопка получения сообщения
    document.getElementById('getMessageButton').onclick = async () => {
        try {
            // getMessage - это view функция, не требует газа и signer'а
            // Можно вызывать даже без подключенного кошелька
            const message = await contract.getMessage();
            document.getElementById('messageDisplay').innerText = message;
        } catch (error) {
            console.error("Ошибка получения сообщения:", error);
            document.getElementById('messageDisplay').innerText = 'Ошибка: ' + error.message;
        }
    };
}
